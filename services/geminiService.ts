
import { GoogleGenAI } from "@google/genai";

// Initialize AI right before use to ensure the latest API Key
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Trích xuất JSON từ chuỗi văn bản (hỗ trợ cả Markdown code blocks)
 * Rất quan trọng khi dùng Search Grounding vì AI hay thêm văn bản giải thích.
 */
function extractJson(text: string) {
  try {
    // Tìm khối JSON đầu tiên trong chuỗi
    const jsonRegex = /({[\s\S]*?})/;
    const match = text.match(jsonRegex);
    if (match) {
      return JSON.parse(match[1]);
    }
    
    // Nếu không tìm thấy bằng regex đơn giản, thử tìm trong Markdown block
    const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownMatch) {
      return JSON.parse(markdownMatch[1]);
    }

    return null;
  } catch (e) {
    console.error("Lỗi parse JSON từ AI:", e, "Văn bản gốc:", text);
    return null;
  }
}

// Search for chemical details from the internet using Google Search tool
export const searchChemicalInfo = async (query: string) => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  
  const prompt = `Bạn là một chuyên gia hóa chất. Hãy tìm kiếm thông tin chính xác từ internet cho hóa chất: "${query}".
  YÊU CẦU: Trả về kết quả dưới dạng JSON (với định dạng Code Block) chứa các trường sau:
  {
    "name": "Tên chuẩn",
    "formula": "Công thức",
    "casNumber": "Số CAS",
    "category": "Chọn một: Axit, Bazơ, Chất oxi hóa, Chất dễ cháy, Độc hại, Thuốc thử, Dung môi, Khác",
    "state": "Chọn một: Rắn, Lỏng, Khí",
    "nfpa": {
      "health": 0-4,
      "flammability": 0-4,
      "instability": 0-4,
      "special": "Ký hiệu đặc biệt"
    }
  }`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Khi dùng Search Grounding, tránh ép kiểu responseMimeType: "application/json" 
        // để mô hình có thể trả về cả dữ liệu grounding dẫn nguồn.
      },
    });

    const text = response.text || "";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const jsonData = extractJson(text);
    
    return {
      data: jsonData,
      sources: sources.map((chunk: any) => ({
        uri: chunk.web?.uri,
        title: chunk.web?.title
      })).filter((s: any) => s.uri),
      error: null
    };
  } catch (error: any) {
    console.error("Chemical Search Error:", error);
    
    // Kiểm tra lỗi 429 Quota Exceeded
    const errorStr = error?.toString() || "";
    const isQuotaError = errorStr.includes("429") || error?.status === 429 || errorStr.toLowerCase().includes("quota");
    
    return { 
      data: null, 
      sources: [], 
      error: isQuotaError ? "QUOTA_EXCEEDED" : "API_ERROR" 
    };
  }
};

export const getSafetyAdvice = async (chemicalName: string, casNumber: string) => {
  const ai = getAI();
  const prompt = `Act as a senior chemical safety expert. Provide a concise safety summary for ${chemicalName} (CAS: ${casNumber}). 
  Include primary hazards, storage compatibility, PPE and emergency first aid. Use a professional tone.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error: any) {
    console.error("Safety Advice Error:", error);
    const errorStr = error?.toString() || "";
    const isQuotaError = errorStr.includes("429") || error?.status === 429;
    
    return isQuotaError 
      ? "LỖI: Bạn đã hết hạn mức AI (Quota Exceeded). Vui lòng thử lại sau 1 phút." 
      : "Không thể lấy tư vấn an toàn vào lúc này.";
  }
};

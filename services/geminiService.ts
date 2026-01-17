
import { GoogleGenAI } from "@google/genai";

// Initialize AI right before use to ensure the latest API Key as per guidelines
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Trích xuất JSON từ chuỗi văn bản (hỗ trợ cả Markdown code blocks)
 */
function extractJson(text: string) {
  try {
    const jsonRegex = /({[\s\S]*?})/;
    const match = text.match(jsonRegex);
    if (match) {
      return JSON.parse(match[1]);
    }
    
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
    // Calling generateContent with googleSearch tool to find chemical data
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
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
    // Calling generateContent to get expert safety advice
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

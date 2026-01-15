
import { GoogleGenAI } from "@google/genai";

// Initialize AI right before use to ensure the latest API Key
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Trích xuất JSON từ chuỗi văn bản (hỗ trợ cả Markdown code blocks)
 */
function extractJson(text: string) {
  try {
    // Thử tìm khối JSON trong Markdown ```json ... ```
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    const content = jsonMatch ? jsonMatch[1] : text;
    return JSON.parse(content);
  } catch (e) {
    console.error("Lỗi parse JSON:", e, "Văn bản gốc:", text);
    return null;
  }
}

// Search for chemical details from the internet using Google Search tool
export const searchChemicalInfo = async (query: string) => {
  const ai = getAI();
  // Sử dụng gemini-3-flash-preview cho tốc độ và khả năng Search tốt
  const model = 'gemini-3-flash-preview';
  
  const prompt = `Bạn là một chuyên gia hóa chất. Hãy tìm kiếm thông tin chính xác từ internet cho hóa chất: "${query}".
  TRẢ VỀ DUY NHẤT MỘT KHỐI JSON (Markdown code block) với cấu trúc sau:
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
        // Không sử dụng responseMimeType khi dùng Search để tránh lỗi xung đột dữ liệu grounding
      },
    });

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const jsonData = extractJson(text || "");
    
    return {
      data: jsonData,
      sources: sources.map((chunk: any) => ({
        uri: chunk.web?.uri,
        title: chunk.web?.title
      })).filter((s: any) => s.uri)
    };
  } catch (error) {
    console.error("Chemical Search Error:", error);
    return { data: null, sources: [] };
  }
};

export const getSafetyAdvice = async (chemicalName: string, casNumber: string) => {
  const ai = getAI();
  const prompt = `Act as a senior chemical safety expert. Provide a concise safety summary for ${chemicalName} (CAS: ${casNumber}). 
  Include primary hazards, storage compatibility, PPE and emergency first aid.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not retrieve safety advice at this time.";
  }
};

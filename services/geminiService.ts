
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Search for chemical details from the internet using Google Search tool
export const searchChemicalInfo = async (query: string) => {
  const model = 'gemini-3-pro-preview';
  
  const prompt = `Bạn là một chuyên gia hóa chất. Hãy tìm kiếm thông tin chính xác và cập nhật nhất từ internet cho hóa chất sau: "${query}".
  Yêu cầu tìm:
  1. Tên chuẩn (Standard Name)
  2. Công thức hóa học (Chemical Formula)
  3. Số CAS (CAS Number)
  4. Chỉ số NFPA 704: Sức khỏe (Health 0-4), Dễ cháy (Flammability 0-4), Phản ứng (Instability 0-4) và Ký hiệu đặc biệt.
  5. Danh mục: Chọn một trong các loại sau: Axit, Bazơ, Chất oxi hóa, Chất dễ cháy, Độc hại, Thuốc thử, Dung môi, Khác.
  6. Trạng thái vật lý: Chọn một trong: Rắn, Lỏng, Khí.
  
  Trả về kết quả dưới dạng JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            formula: { type: Type.STRING },
            casNumber: { type: Type.STRING },
            category: { type: Type.STRING, description: "One of: Axit, Bazơ, Chất oxi hóa, Chất dễ cháy, Độc hại, Thuốc thử, Dung môi, Khác" },
            state: { type: Type.STRING, description: "One of: Rắn, Lỏng, Khí" },
            nfpa: {
              type: Type.OBJECT,
              properties: {
                health: { type: Type.INTEGER },
                flammability: { type: Type.INTEGER },
                instability: { type: Type.INTEGER },
                special: { type: Type.STRING }
              },
              required: ["health", "flammability", "instability"]
            }
          },
          required: ["name", "formula", "casNumber", "nfpa", "category", "state"]
        }
      },
    });

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return {
      data: text ? JSON.parse(text) : null,
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
  const prompt = `Act as a senior chemical safety expert. Provide a concise safety summary for ${chemicalName} (CAS: ${casNumber}). 
  Include: 
  1. Primary hazards.
  2. Storage compatibility (what to avoid).
  3. PPE recommendations.
  4. Emergency first aid in one sentence.
  Return in a professional, clear format.`;

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

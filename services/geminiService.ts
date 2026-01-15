
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
  4. Chỉ số NFPA 704 (Mức độ nguy hại): Sức khỏe (Health 0-4), Dễ cháy (Flammability 0-4), Phản ứng (Instability 0-4) và Ký hiệu đặc biệt (nếu có).
  
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
            nfpa: {
              type: Type.OBJECT,
              properties: {
                health: { type: Type.INTEGER, description: "Health hazard rating 0-4" },
                flammability: { type: Type.INTEGER, description: "Fire hazard rating 0-4" },
                instability: { type: Type.INTEGER, description: "Instability/Reactivity rating 0-4" },
                special: { type: Type.STRING, description: "Special hazards like W, OX, SA, etc." }
              },
              required: ["health", "flammability", "instability"]
            }
          },
          required: ["name", "formula", "casNumber", "nfpa"]
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

export const analyzeHazardFromSdsText = async (sdsText: string) => {
  const prompt = `Analyze this SDS text snippet and extract hazard classifications: ${sdsText.substring(0, 1000)}. 
  Respond with a JSON object containing: { "ghsTags": [], "nfpa": { "health": 0, "flammability": 0, "instability": 0, "special": "" } }`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("SDS Analysis Error:", error);
    return null;
  }
};

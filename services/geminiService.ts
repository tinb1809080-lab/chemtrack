
import { GoogleGenAI } from "@google/genai";

export const getSafetyAdvice = async (chemicalName: string, casNumber: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    return JSON.parse(response.text);
  } catch (error) {
    console.error("SDS Analysis Error:", error);
    return null;
  }
};

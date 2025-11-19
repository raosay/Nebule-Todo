import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize safe instance
let ai: GoogleGenAI | null = null;
try {
    if (apiKey) {
        ai = new GoogleGenAI({ apiKey: apiKey });
    }
} catch (e) {
    console.error("Failed to initialize Gemini client", e);
}

export const breakdownTaskWithAI = async (taskText: string): Promise<string[]> => {
  if (!ai) {
    console.warn("Gemini API Key missing");
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `将以下任务分解为 3 到 5 个较小的可执行子步骤。保持简洁。任务：“${taskText}”`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as string[];
    }
    return [];
  } catch (error) {
    console.error("Error generating task breakdown:", error);
    return [];
  }
};
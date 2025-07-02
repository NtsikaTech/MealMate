
import { GoogleGenAI } from "@google/genai";
import { Meal } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this example, we'll alert the user and disable the AI features.
  // This check is primarily for development environments where the key might be missing.
  console.error("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateMealSuggestions = async (prompt: string): Promise<Omit<Meal, 'id'>[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is not configured. Please set the API_KEY environment variable.");
  }
  
  const model = "gemini-2.5-flash-preview-04-17";
  const systemInstruction = `You are a creative chef who generates meal ideas. The user will provide jejich preferences. 
  You must return a valid JSON array of meal objects. Each object must have three keys: 
  1. "name" (string): The name of the meal.
  2. "notes" (string): A brief, enticing description of the meal.
  3. "ingredients" (array of objects): Each object in this array must have two keys: "name" (string) and "quantity" (string).
  Do not include any other text, explanations, or markdown formatting outside of the JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Generate 3 meal ideas based on this request: "${prompt}"`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsedData = JSON.parse(jsonStr);

    // Basic validation to ensure the response matches the expected structure
    if (Array.isArray(parsedData) && parsedData.every(item => 'name' in item && 'notes' in item && 'ingredients' in item)) {
        return parsedData as Omit<Meal, 'id'>[];
    } else {
        console.error("Parsed data does not match expected Meal structure:", parsedData);
        throw new Error("Received malformed data from AI. Please try again.");
    }
  } catch (error) {
    console.error("Error generating meal suggestions:", error);
    throw new Error("Failed to get suggestions from the AI. The model may be busy or an error occurred.");
  }
};

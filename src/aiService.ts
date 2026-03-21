import { GoogleGenAI } from "@google/genai";
import { TeamStats, TournamentWeights, TeamScore, AI_ANALYSIS_SCHEMA } from "./types";

export async function getAIAnalysis(teams: TeamStats[], weights: TournamentWeights, scores: TeamScore[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyse les résultats du Ballon d'Or FECOB.
    
    Données: ${JSON.stringify(teams)}
    Pondérations: ${JSON.stringify(weights)}
    Scores: ${JSON.stringify(scores)}
    
    Gagnant: ${scores[0]?.teamName} (${scores[0]?.percentage.toFixed(2)}%).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "Tu es un expert en analyse sportive. Sois concis et professionnel. Fournis un résumé global et un insight par équipe.",
        responseMimeType: "application/json",
        responseSchema: AI_ANALYSIS_SCHEMA,
        maxOutputTokens: 1000, // Prevent runaway generation
      },
    });

    const text = response.text.trim();
    // Handle potential markdown code blocks if the model ignores responseMimeType
    const jsonStr = text.startsWith('```json') 
      ? text.replace(/^```json\n?/, '').replace(/\n?```$/, '')
      : text;

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return null;
  }
}

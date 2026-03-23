import { GoogleGenAI } from "@google/genai";
import { TeamStats, TournamentWeights, TeamScore, AI_ANALYSIS_SCHEMA } from "./types";

export async function getAIAnalysis(teams: TeamStats[], weights: TournamentWeights, scores: TeamScore[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  
  // Use a more compact data representation to save tokens and reduce complexity
  const compactTeams = teams.map(t => ({
    n: t.name,
    g: t.globalGoals,
    fp: t.fairPlay,
    lm: t.ligueMajeure.enabled ? { r: t.ligueMajeure.ranking, s: t.ligueMajeure.goalsScored, c: t.ligueMajeure.goalsConceded } : 'off',
    lc: t.ligueChampions.enabled ? { p: t.ligueChampions.knockoutPhase, w: t.ligueChampions.won } : 'off',
    pl: t.powerLeague.enabled ? { p: t.powerLeague.knockoutPhase } : 'off'
  }));

  const prompt = `
    Analyse les résultats du Ballon d'Or FECOB.
    
    Données: ${JSON.stringify(compactTeams)}
    Scores: ${JSON.stringify(scores.map(s => ({ n: s.teamName, p: s.percentage.toFixed(1) })))}
    
    Génère un résumé global et un insight pour chaque équipe.
    
    RÈGLES:
    1. Réponds UNIQUEMENT au format JSON.
    2. N'utilise JAMAIS de guillemets doubles (") à l'intérieur des textes.
    3. Sois concis pour éviter la troncature.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "Tu es un expert en analyse sportive. Réponds UNIQUEMENT avec un objet JSON valide. Sois bref et précis. Ne tronque jamais ta réponse.",
        responseMimeType: "application/json",
        responseSchema: AI_ANALYSIS_SCHEMA,
      },
    });

    const text = response.text.trim();
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parse failed. Raw text:", text);
      
      // Attempt to fix common truncation by closing brackets if they seem missing
      let fixedText = text;
      if (!fixedText.endsWith('}')) {
        // Very basic heuristic to close a truncated JSON object
        if (fixedText.includes('"insights":[')) {
          if (!fixedText.endsWith(']')) fixedText += ']}';
          else fixedText += '}';
        } else {
          fixedText += '}';
        }
      }

      try {
        return JSON.parse(fixedText);
      } catch (e) {
        return null;
      }
    }
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return null;
  }
}

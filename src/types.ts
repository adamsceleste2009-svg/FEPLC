import { Type } from "@google/genai";

export type FairPlay = 'Faible' | 'Moyen' | 'Plein';
export type Availability = 25 | 50 | 75 | 100;
export type RankingGroup = '1-4' | '5-10' | '11-14' | '15-16';
export type KnockoutPhase = 'Aucune' | 'Quart' | 'Demi' | 'Finale';

export interface LigueMajeureStats {
  enabled: boolean;
  ranking: RankingGroup;
  goalsScored: number;
  goalsConceded: number;
  availability: Availability;
}

export interface LigueChampionsStats {
  enabled: boolean;
  groupPhase: boolean;
  knockoutPhase: KnockoutPhase;
  won: boolean;
  goalsScored: number;
  goalsConceded: number;
  availability: Availability;
}

export interface SupercoupeStats {
  enabled: boolean;
  knockoutPhase: KnockoutPhase;
  goalsScored: number;
}

export interface PowerLeagueStats {
  enabled: boolean;
  groupPhase: boolean;
  knockoutPhase: boolean;
  goalsScored: number;
  goalsConceded: number;
  availability: Availability;
}

export interface TeamStats {
  id: string;
  name: string;
  globalGoals: number;
  fairPlay: FairPlay;
  ligueMajeure: LigueMajeureStats;
  ligueChampions: LigueChampionsStats;
  supercoupe: SupercoupeStats;
  powerLeague: PowerLeagueStats;
}

export interface TournamentWeights {
  ligueMajeure: number;
  ligueChampions: number;
  supercoupe: number;
  powerLeague: number;
  global: number; // For global goals and fair play
}

export interface TeamScore {
  teamId: string;
  teamName: string;
  totalScore: number;
  percentage: number;
  breakdown: {
    ligueMajeure: number;
    ligueChampions: number;
    supercoupe: number;
    powerLeague: number;
    global: number;
  };
}

export const DEFAULT_TOURNAMENT_WEIGHTS: TournamentWeights = {
  ligueMajeure: 30,
  ligueChampions: 40,
  supercoupe: 10,
  powerLeague: 20,
  global: 0, // Initially 0 as the user specified 30+40+10+20 = 100
};

export const AI_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A brief summary of the overall competition and the winner's performance.",
    },
    insights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          teamName: { type: Type.STRING },
          comment: { type: Type.STRING, description: "A specific comment about this team's performance and why they got their score." }
        }
      }
    }
  },
  required: ["summary", "insights"]
};

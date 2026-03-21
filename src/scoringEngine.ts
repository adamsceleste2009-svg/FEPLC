import { TeamStats, TournamentWeights, TeamScore, RankingGroup, KnockoutPhase } from './types';

function getRankingPoints(group: RankingGroup): number {
  switch (group) {
    case '1-4': return 100;
    case '5-10': return 75;
    case '11-14': return 50;
    case '15-16': return 25;
    default: return 0;
  }
}

function getKnockoutPoints(phase: KnockoutPhase): number {
  switch (phase) {
    case 'Finale': return 100;
    case 'Demi': return 75;
    case 'Quart': return 50;
    default: return 0;
  }
}

export function calculateScores(teams: TeamStats[], weights: TournamentWeights): TeamScore[] {
  if (teams.length === 0) return [];

  // Find max goals for normalization across all teams
  const maxGlobalGoals = Math.max(...teams.map(t => t.globalGoals), 1);
  
  return teams.map(team => {
    // 1. Ligue Majeure Score
    let lmScore = 0;
    if (team.ligueMajeure.enabled) {
      const rankPoints = getRankingPoints(team.ligueMajeure.ranking);
      const goalPoints = (team.ligueMajeure.goalsScored / 100) * 100; // normalized to 100
      const defensePoints = (1 - (team.ligueMajeure.goalsConceded / 100)) * 100;
      lmScore = (rankPoints + goalPoints + defensePoints + team.ligueMajeure.availability) / 4;
    }

    // 2. Ligue Champions Score
    let lcScore = 0;
    if (team.ligueChampions.enabled) {
      const groupPoints = team.ligueChampions.groupPhase ? 100 : 0;
      const koPoints = getKnockoutPoints(team.ligueChampions.knockoutPhase);
      const winPoints = team.ligueChampions.won ? 100 : 0;
      const goalPoints = (team.ligueChampions.goalsScored / 100) * 100;
      const defensePoints = (1 - (team.ligueChampions.goalsConceded / 100)) * 100;
      lcScore = (groupPoints + koPoints + winPoints + goalPoints + defensePoints + team.ligueChampions.availability) / 6;
    }

    // 3. Supercoupe Score
    let scScore = 0;
    if (team.supercoupe.enabled) {
      const koPoints = getKnockoutPoints(team.supercoupe.knockoutPhase);
      const goalPoints = (team.supercoupe.goalsScored / 100) * 100;
      scScore = (koPoints + goalPoints) / 2;
    }

    // 4. Power League Score
    let plScore = 0;
    if (team.powerLeague.enabled) {
      const groupPoints = team.powerLeague.groupPhase ? 100 : 0;
      const koPoints = team.powerLeague.knockoutPhase ? 100 : 0;
      const goalPoints = (team.powerLeague.goalsScored / 100) * 100;
      const defensePoints = (1 - (team.powerLeague.goalsConceded / 100)) * 100;
      plScore = (groupPoints + koPoints + goalPoints + defensePoints + team.powerLeague.availability) / 5;
    }

    // 5. Global Score (Fair Play + Global Goals)
    const fairPlayPoints = team.fairPlay === 'Plein' ? 100 : team.fairPlay === 'Moyen' ? 50 : 0;
    const globalGoalPoints = (team.globalGoals / 100) * 100;
    const globalScore = (fairPlayPoints + globalGoalPoints) / 2;

    const totalWeightedScore = (
      (lmScore * weights.ligueMajeure) +
      (lcScore * weights.ligueChampions) +
      (scScore * weights.supercoupe) +
      (plScore * weights.powerLeague) +
      (globalScore * weights.global)
    ) / (weights.ligueMajeure + weights.ligueChampions + weights.supercoupe + weights.powerLeague + weights.global || 1);

    return {
      teamId: team.id,
      teamName: team.name,
      totalScore: totalWeightedScore,
      percentage: totalWeightedScore,
      breakdown: {
        ligueMajeure: lmScore,
        ligueChampions: lcScore,
        supercoupe: scScore,
        powerLeague: plScore,
        global: globalScore
      }
    };
  }).sort((a, b) => b.totalScore - a.totalScore);
}

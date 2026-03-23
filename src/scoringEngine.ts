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
    case 'Demi': return 95;
    case 'Quart': return 90;
    case '8ème': return 85;
    default: return 0;
  }
}

export function calculateScores(teams: TeamStats[], weights: TournamentWeights): TeamScore[] {
  if (teams.length === 0) return [];

  return teams.map(team => {
    let lmScore = 0;
    let lcScore = 0;
    let scScore = 0;
    let plScore = 0;
    let activeWeightsSum = 0;

    // Goal weight multiplier (user wants goals to be "max" compared to availability/fair play)
    const GOAL_WEIGHT = 2;

    // 1. Ligue Majeure Score
    if (team.ligueMajeure.enabled) {
      const rankPoints = getRankingPoints(team.ligueMajeure.ranking);
      const goalPoints = (team.ligueMajeure.goalsScored / 100) * 100;
      const defensePoints = (1 - (team.ligueMajeure.goalsConceded / 100)) * 100;
      // Goals (offense + defense) weighted more than rank and availability
      lmScore = (rankPoints + (goalPoints * GOAL_WEIGHT) + (defensePoints * GOAL_WEIGHT) + team.ligueMajeure.availability) / (2 + (2 * GOAL_WEIGHT));
      activeWeightsSum += weights.ligueMajeure;
    }

    // 2. Ligue Champions Score
    if (team.ligueChampions.enabled) {
      const groupPoints = team.ligueChampions.groupPhase ? 100 : 0;
      const koPoints = getKnockoutPoints(team.ligueChampions.knockoutPhase);
      const winPoints = team.ligueChampions.won ? 100 : 0;
      const goalPoints = (team.ligueChampions.goalsScored / 100) * 100;
      const defensePoints = (1 - (team.ligueChampions.goalsConceded / 100)) * 100;
      lcScore = (groupPoints + koPoints + winPoints + (goalPoints * GOAL_WEIGHT) + (defensePoints * GOAL_WEIGHT) + team.ligueChampions.availability) / (4 + (2 * GOAL_WEIGHT));
      activeWeightsSum += weights.ligueChampions;
    }

    // 3. Supercoupe Score
    if (team.supercoupe.enabled) {
      const koPoints = getKnockoutPoints(team.supercoupe.knockoutPhase);
      const goalPoints = (team.supercoupe.goalsScored / 100) * 100;
      scScore = (koPoints + (goalPoints * GOAL_WEIGHT)) / (1 + GOAL_WEIGHT);
      activeWeightsSum += weights.supercoupe;
    }

    // 4. Power League Score
    if (team.powerLeague.enabled) {
      const groupPoints = team.powerLeague.groupPhase ? 100 : 0;
      const koPoints = getKnockoutPoints(team.powerLeague.knockoutPhase);
      const goalPoints = (team.powerLeague.goalsScored / 100) * 100;
      const defensePoints = (1 - (team.powerLeague.goalsConceded / 100)) * 100;
      plScore = (groupPoints + koPoints + (goalPoints * GOAL_WEIGHT) + (defensePoints * GOAL_WEIGHT) + team.powerLeague.availability) / (3 + (2 * GOAL_WEIGHT));
      activeWeightsSum += weights.powerLeague;
    }

    // 5. Global Score (Fair Play + Global Goals)
    const fairPlayPoints = team.fairPlay === 'Plein' ? 100 : team.fairPlay === 'Moyen' ? 50 : 0;
    const globalGoalPoints = (team.globalGoals / 100) * 100;
    // Global goals weighted more than fair play
    const globalScore = (fairPlayPoints + (globalGoalPoints * GOAL_WEIGHT)) / (1 + GOAL_WEIGHT);
    activeWeightsSum += weights.global;

    const totalWeightedScore = (
      (lmScore * weights.ligueMajeure) +
      (lcScore * weights.ligueChampions) +
      (scScore * weights.supercoupe) +
      (plScore * weights.powerLeague) +
      (globalScore * weights.global)
    ) / (activeWeightsSum || 1);

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

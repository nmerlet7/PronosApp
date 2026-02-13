import { Bet, Result, PointsBreakdown } from "@/types";

export function calculateBetPoints(bet: Bet): PointsBreakdown {
  const breakdown: PointsBreakdown = {
    winnerCorrect: 0,
    halfTimeScoreCorrect: 0,
    fullTimeScoreCorrect: 0,
    halfTimeGoalsPenalty: 0,
    fullTimeGoalsPenalty: 0,
    total: 0
  };

  if (!bet.match.result) return breakdown;

  const prediction = bet.result;
  const actual = bet.match.result;

  // Vainqueur correct (1 point)
  if (prediction.winner?.id === actual.winner?.id) {
    breakdown.winnerCorrect += 1;
  } else if (prediction.winner && actual.winner && prediction.winner.id !== actual.winner.id) {
    breakdown.total -= 1;
  }

  // Score mi-temps correct (1 point)
  if (prediction.halfTime && actual.halfTime) {
    if (prediction.halfTime.home === actual.halfTime.home && 
        prediction.halfTime.away === actual.halfTime.away) {
      breakdown.halfTimeScoreCorrect += 1;
    } else {
      const predictedGoals = prediction.halfTime.home + prediction.halfTime.away;
      const actualGoals = actual.halfTime.home + actual.halfTime.away;
      if (Math.abs(predictedGoals - actualGoals) >= 3) {
        breakdown.halfTimeGoalsPenalty -= 1;
      }
    }
  }

  // Score final correct (2 points)
  if (prediction.fullTime && actual.fullTime) {
    if (prediction.fullTime.home === actual.fullTime.home && 
        prediction.fullTime.away === actual.fullTime.away) {
      breakdown.fullTimeScoreCorrect += 2;
    } else {
      const predictedGoals = prediction.fullTime.home + prediction.fullTime.away;
      const actualGoals = actual.fullTime.home + actual.fullTime.away;
      if (Math.abs(predictedGoals - actualGoals) >= 5) {
        breakdown.fullTimeGoalsPenalty -= 1;
      }
    }
  }

  breakdown.total = breakdown.winnerCorrect + 
                   breakdown.halfTimeScoreCorrect + 
                   breakdown.fullTimeScoreCorrect + 
                   breakdown.halfTimeGoalsPenalty + 
                   breakdown.fullTimeGoalsPenalty;

  return breakdown;
}

export function determineWinner(result: Result, homeTeam: any, awayTeam: any) {
  if (!result.fullTime) return null;
  
  if (result.fullTime.home > result.fullTime.away) {
    return homeTeam;
  } else if (result.fullTime.away > result.fullTime.home) {
    return awayTeam;
  }
  
  return null; // Match nul
}
import { Match, Pronostic, PointsCalculation } from '@/types';

export class PointsCalculator {
  static calculatePoints(pronostic: Pronostic, match: Match): PointsCalculation {
    let basePoints = 0;
    const bonusMalus = {
      incorrectWinner: 0,
      correctHalftimeScore: 0,
      incorrectHalftimeGoals: 0,
      correctFinalScore: 0,
      incorrectFinalGoals: 0,
    };

    if (!match.scores?.final) {
      return {
        basePoints,
        bonusMalus,
        total: 0,
      };
    }

    // Déterminer le vainqueur réel (en tenant compte des tirs-au-but)
    const actualWinner = this.getActualWinner(match);
    const predictedWinner = pronostic.winner;

    if (actualWinner === predictedWinner) {
      basePoints = 1;
    } else if (actualWinner !== 'draw' && predictedWinner !== 'draw') {
      bonusMalus.incorrectWinner = -1;
    }

    if (match.scores.halftime && pronostic.halftimeScore) {
      if (
        match.scores.halftime.homeTeam === pronostic.halftimeScore.homeTeam &&
        match.scores.halftime.awayTeam === pronostic.halftimeScore.awayTeam
      ) {
        bonusMalus.correctHalftimeScore = 1;
      }

      const halftimeGoalDiff = Math.abs(
        (match.scores.halftime.homeTeam + match.scores.halftime.awayTeam) -
        (pronostic.halftimeScore.homeTeam + pronostic.halftimeScore.awayTeam)
      );
      if (halftimeGoalDiff >= 3) {
        bonusMalus.incorrectHalftimeGoals = -1;
      }
    }

    if (pronostic.finalScore) {
      if (
        match.scores.final.homeTeam === pronostic.finalScore.homeTeam &&
        match.scores.final.awayTeam === pronostic.finalScore.awayTeam
      ) {
        bonusMalus.correctFinalScore = 2;
      }

      const finalGoalDiff = Math.abs(
        (match.scores.final.homeTeam + match.scores.final.awayTeam) -
        (pronostic.finalScore.homeTeam + pronostic.finalScore.awayTeam)
      );
      if (finalGoalDiff >= 5) {
        bonusMalus.incorrectFinalGoals = -1;
      }
    }

    const total = basePoints + 
      bonusMalus.incorrectWinner +
      bonusMalus.correctHalftimeScore +
      bonusMalus.incorrectHalftimeGoals +
      bonusMalus.correctFinalScore +
      bonusMalus.incorrectFinalGoals;

    return {
      basePoints,
      bonusMalus,
      total,
    };
  }

  private static getWinner(score: { homeTeam: number; awayTeam: number }): 'home' | 'away' | 'draw' {
    if (score.homeTeam > score.awayTeam) return 'home';
    if (score.awayTeam > score.homeTeam) return 'away';
    return 'draw';
  }

  private static getActualWinner(match: Match): 'home' | 'away' | 'draw' {
    // Si le score final est nul et qu'il y a des tirs-au-but, le vainqueur est déterminé par les tirs-au-but
    if (match.scores?.final && match.scores.final.homeTeam === match.scores.final.awayTeam) {
      if (match.scores.finalAfterPenalties) {
        return this.getWinner(match.scores.finalAfterPenalties);
      }
      return 'draw';
    }
    
    // Sinon, le vainqueur est déterminé par le score final
    if (match.scores?.final) {
      return this.getWinner(match.scores.final);
    }
    
    return 'draw';
  }

  static updatePronosticPoints(pronostics: Pronostic[], matches: Match[]): Pronostic[] {
    return pronostics.map(pronostic => {
      const match = matches.find(m => m.id === pronostic.matchId);
      if (!match || match.status !== 'finished' || !match.scores?.final) {
        return { ...pronostic, points: 0 };
      }

      const calculation = this.calculatePoints(pronostic, match);
      return { ...pronostic, points: calculation.total };
    });
  }
}

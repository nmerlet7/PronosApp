export interface Team {
  id: string;
  name: string;
  image?: string;
}

export interface Pronostiqueur {
  id: string;
  name: string;
  photo?: string;
}

export interface MatchScore {
  homeTeam: number;
  awayTeam: number;
}

export interface Match {
  id: string;
  name?: string;
  homeTeam: Team;
  awayTeam: Team;
  tournamentId: string;
  status: 'upcoming' | 'in_progress' | 'finished';
  scores?: {
    halftime?: MatchScore;
    final?: MatchScore;
    finalAfterPenalties?: MatchScore;
  };
  externalId?: number;
  date?: string;
}

export type PronosticWinner = 'home' | 'away' | 'draw';

export interface Pronostic {
  id: string;
  pronostiqueurId: string;
  matchId: string;
  winner: PronosticWinner;
  halftimeScore?: MatchScore;
  finalScore?: MatchScore;
  points?: number;
}

export interface Tournament {
  id: string;
  name: string;
  status: 'upcoming' | 'in_progress' | 'finished';
  createdAt: Date;
  updatedAt: Date;
}

export interface RankingEntry {
  pronostiqueur: Pronostiqueur;
  totalPoints: number;
  pronostics: Pronostic[];
}

export interface PointsCalculation {
  basePoints: number;
  bonusMalus: {
    incorrectWinner: number;
    correctHalftimeScore: number;
    incorrectHalftimeGoals: number;
    correctFinalScore: number;
    incorrectFinalGoals: number;
  };
  total: number;
}

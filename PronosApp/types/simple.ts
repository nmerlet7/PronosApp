// Types simplifiés pour l'application

export interface Tournament {
  id: string;
  name: string;
  status: 'upcoming' | 'in_progress' | 'finished';
  createdAt: string;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  tournamentId: string;
  status: 'upcoming' | 'in_progress' | 'finished';
  score?: {
    home: number;
    away: number;
  };
  date: string;
}

export interface Pronostic {
  id: string;
  matchId: string;
  winner: 'home' | 'away' | 'draw';
  score?: {
    home: number;
    away: number;
  };
  points?: number;
}

export interface Player {
  id: string;
  name: string;
  totalPoints: number;
}
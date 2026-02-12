export interface ApiMatch {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
      elapsed?: number;
    };
  };
  league: {
    id: number;
    name: string;
    type: string;
    logo: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home?: number;
    away?: number;
  };
  score: {
    halftime: {
      home?: number;
      away?: number;
    };
    fulltime: {
      home?: number;
      away?: number;
    };
    penalty?: {
      home?: number;
      away?: number;
    };
  };
}

export interface Competition {
  id: number;
  name: string;
  type: string;
  logo: string;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  leagueId: number;
  leagueName: string;
}

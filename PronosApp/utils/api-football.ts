// Configuration pour api-football.com
const API_BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = 'e23b2b39ff9055b1744f5b6c6d61aba8';

// Types pour les données de l'API
export interface ApiTeam {
  id: number;
  name: string;
  logo: string;
}

export interface ApiFixture {
  id: number;
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number | null;
      second: number | null;
    };
    venue: {
      id: number;
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: ApiTeam;
    away: ApiTeam;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
}

export interface ApiLeague {
  id: number;
  name: string;
  type: string;
  logo: string;
  country: string;
  seasons: Array<{
    year: number;
    start: string;
    end: string;
    current: boolean;
    coverage: {
      fixtures: {
        events: boolean;
        lineups: boolean;
        statistics_fixtures: boolean;
        statistics_players: boolean;
      };
    };
  }>;
}

class ApiFootballService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'x-apisports-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Football Error:', error);
      throw error;
    }
  }

  // Récupérer les championnats disponibles
  async getLeagues(): Promise<ApiLeague[]> {
    const response = await this.makeRequest('/leagues');
    return response.response;
  }

  // Récupérer les matchs à venir pour un championnat
  async getUpcomingFixtures(leagueId: number, season: number): Promise<ApiFixture[]> {
    const today = new Date().toISOString().split('T')[0];
    const response = await this.makeRequest(`/fixtures?league=${leagueId}&season=${season}&from=${today}`);
    return response.response;
  }

  // Récupérer les matchs en cours
  async getLiveFixtures(leagueId?: number): Promise<ApiFixture[]> {
    const endpoint = leagueId 
      ? `/fixtures?live=${leagueId}` 
      : '/fixtures?live=all';
    const response = await this.makeRequest(endpoint);
    return response.response;
  }

  // Récupérer les matchs terminés aujourd'hui
  async getTodayFinishedFixtures(leagueId?: number): Promise<ApiFixture[]> {
    const today = new Date().toISOString().split('T')[0];
    const endpoint = leagueId 
      ? `/fixtures?league=${leagueId}&date=${today}&status=FT`
      : `/fixtures?date=${today}&status=FT`;
    const response = await this.makeRequest(endpoint);
    return response.response;
  }

  // Récupérer les équipes d'un championnat
  async getTeams(leagueId: number, season: number): Promise<ApiTeam[]> {
    const response = await this.makeRequest(`/teams?league=${leagueId}&season=${season}`);
    return response.response;
  }

  // Convertir un match de l'API vers notre format Match
  convertApiFixtureToMatch(apiFixture: ApiFixture, tournamentId: string): any {
    return {
      id: apiFixture.fixture.id.toString(),
      name: `${apiFixture.teams.home.name} vs ${apiFixture.teams.away.name}`,
      homeTeam: {
        id: apiFixture.teams.home.id.toString(),
        name: apiFixture.teams.home.name,
        image: apiFixture.teams.home.logo,
      },
      awayTeam: {
        id: apiFixture.teams.away.id.toString(),
        name: apiFixture.teams.away.name,
        image: apiFixture.teams.away.logo,
      },
      tournamentId,
      status: this.mapApiStatusToMatchStatus(apiFixture.fixture.status.long),
      scores: apiFixture.goals.home !== null && apiFixture.goals.away !== null ? {
        halftime: apiFixture.score.halftime.home !== null && apiFixture.score.halftime.away !== null ? {
          homeTeam: apiFixture.score.halftime.home,
          awayTeam: apiFixture.score.halftime.away,
        } : undefined,
        final: {
          homeTeam: apiFixture.goals.home,
          awayTeam: apiFixture.goals.away,
        },
        finalAfterPenalties: apiFixture.score.penalty.home !== null && apiFixture.score.penalty.away !== null ? {
          homeTeam: apiFixture.score.penalty.home,
          awayTeam: apiFixture.score.penalty.away,
        } : undefined,
      } : undefined,
      externalId: apiFixture.fixture.id,
      date: new Date(apiFixture.fixture.date).toLocaleString(),
    };
  }

  // Convertir le statut de l'API vers notre format
  mapApiStatusToMatchStatus(apiStatus: string): 'upcoming' | 'in_progress' | 'finished' {
    switch (apiStatus.toLowerCase()) {
      case 'not started':
      case 'time to be defined':
      case 'postponed':
      case 'cancelled':
        return 'upcoming';
      case 'first half':
      case 'second half':
      case 'half time':
      case 'extra time':
      case 'penalty in progress':
        return 'in_progress';
      case 'match finished':
      case 'finished':
      case 'award':
        return 'finished';
      default:
        return 'upcoming';
    }
  }
}

// Exporter une instance par défaut
export const apiFootballService = new ApiFootballService(API_KEY);

// Fonction pour configurer la clé API
export const setApiKey = (apiKey: string) => {
  (apiFootballService as any).apiKey = apiKey;
};

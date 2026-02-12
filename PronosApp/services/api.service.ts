import { ApiMatch, Competition } from '@/types/api.types';
import { API_CONFIG, COMPETITIONS } from '@/constants';
import { AppError, ERROR_CODES } from './error';

export interface ApiResponse<T> {
  response: T;
  get?: T;
  results?: number;
  paging?: {
    current?: number;
    total?: number;
  };
}

export class ApiService {
  private static apiKey: string | null = null;

  static setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  static getApiKey(): string | null {
    return this.apiKey;
  }

  private static async makeRequest<T>(endpoint: string): Promise<T> {
    if (!this.apiKey) {
      throw new AppError('Clé API non configurée', ERROR_CODES.API_KEY_MISSING);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        headers: {
          'x-apisports-key': this.apiKey,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new AppError('Clé API invalide', ERROR_CODES.API_KEY_INVALID, response.status);
        }
        throw new AppError(`Erreur API: ${response.status} ${response.statusText}`, undefined, response.status);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AppError('Délai d\'attente dépassé', ERROR_CODES.NETWORK_ERROR);
      }
      
      if (error instanceof Error) {
        throw new AppError(error.message, ERROR_CODES.NETWORK_ERROR);
      }
      
      throw new AppError('Erreur réseau inconnue', ERROR_CODES.NETWORK_ERROR);
    }
  }

  static async getCompetitions(): Promise<Competition[]> {
    try {
      const data = await this.makeRequest<ApiResponse<Competition[]>>('/leagues');
      
      const competitionIds = Object.values(COMPETITIONS);
      return data.response.filter(comp => competitionIds.includes(comp.id));
    } catch (error) {
      console.error('Error getting competitions:', error);
      throw error;
    }
  }

  static async getMatches(leagueId?: number, season?: number, from?: string, to?: string): Promise<ApiMatch[]> {
    try {
      const params = new URLSearchParams();
      
      if (leagueId) {
        const validCompetition = Object.values(COMPETITIONS).includes(leagueId as any);
        if (validCompetition) {
          params.append('league', leagueId.toString());
        }
      }
      if (season) params.append('season', season.toString());
      if (from) params.append('from', from);
      if (to) params.append('to', to);

      const endpoint = `/fixtures${params.toString() ? `?${params.toString()}` : ''}`;
      const data = await this.makeRequest<ApiResponse<ApiMatch[]>>(endpoint);
      
      return data.response || [];
    } catch (error) {
      console.error('Error getting matches:', error);
      throw error;
    }
  }

  static async getTodayMatches(leagueId?: number): Promise<ApiMatch[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getMatches(leagueId, undefined, today, today);
  }

  static async getThisWeekMatches(leagueId?: number): Promise<ApiMatch[]> {
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const from = today.toISOString().split('T')[0];
    const to = weekFromNow.toISOString().split('T')[0];
    
    return this.getMatches(leagueId, undefined, from, to);
  }

  static async getMatchesByCompetition(competitionId: number): Promise<ApiMatch[]> {
    return this.getMatches(competitionId);
  }

  static getPopularCompetitions(): Competition[] {
    return [
      { id: COMPETITIONS.PREMIER_LEAGUE, name: 'Premier League', type: 'league', logo: 'https://media.api-sports.io/football/leagues/39.png' },
      { id: COMPETITIONS.LA_LIGA, name: 'La Liga', type: 'league', logo: 'https://media.api-sports.io/football/leagues/140.png' },
      { id: COMPETITIONS.BUNDESLIGA, name: 'Bundesliga', type: 'league', logo: 'https://media.api-sports.io/football/leagues/78.png' },
      { id: COMPETITIONS.SERIE_A, name: 'Serie A', type: 'league', logo: 'https://media.api-sports.io/football/leagues/135.png' },
      { id: COMPETITIONS.LIGUE_1, name: 'Ligue 1', type: 'league', logo: 'https://media.api-sports.io/football/leagues/61.png' },
      { id: COMPETITIONS.EREDIVISIE, name: 'Eredivisie', type: 'league', logo: 'https://media.api-sports.io/football/leagues/88.png' },
      { id: COMPETITIONS.PRIMEIRA_LIGA, name: 'Primeira Liga', type: 'league', logo: 'https://media.api-sports.io/football/leagues/94.png' },
      { id: COMPETITIONS.SCOTTISH_PREMIERSHIP, name: 'Scottish Premiership', type: 'league', logo: 'https://media.api-sports.io/football/leagues/103.png' },
      { id: COMPETITIONS.CHAMPIONS_LEAGUE, name: 'Champions League', type: 'cup', logo: 'https://media.api-sports.io/football/leagues/2.png' },
      { id: COMPETITIONS.EUROPA_LEAGUE, name: 'Europa League', type: 'cup', logo: 'https://media.api-sports.io/football/leagues/3.png' },
      { id: COMPETITIONS.CONFERENCE_LEAGUE, name: 'Conference League', type: 'cup', logo: 'https://media.api-sports.io/football/leagues/848.png' },
    ];
  }
}

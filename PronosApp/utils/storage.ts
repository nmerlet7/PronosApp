import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tournament, Match, Pronostiqueur, Team, Pronostic } from '@/types';

const STORAGE_KEYS = {
  TOURNAMENTS: 'tournaments',
  MATCHES: 'matches',
  PRONOSTIQUEURS: 'pronostiqueurs',
  TEAMS: 'teams',
  PRONOSTICS: 'pronostics',
  CURRENT_TOURNAMENT: 'current_tournament',
  API_KEY: 'api_key',
} as const;

export class StorageService {
  static async getTournaments(): Promise<Tournament[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting tournaments:', error);
      return [];
    }
  }

  static async saveTournaments(tournaments: Tournament[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
    } catch (error) {
      console.error('Error saving tournaments:', error);
    }
  }

  static async getMatches(tournamentId: string): Promise<Match[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MATCHES);
      const allMatches = data ? JSON.parse(data) : [];
      return allMatches.filter((match: Match) => match.tournamentId === tournamentId);
    } catch (error) {
      console.error('Error getting matches:', error);
      return [];
    }
  }

  static async saveMatches(matches: Match[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
    } catch (error) {
      console.error('Error saving matches:', error);
    }
  }

  static async getPronostiqueurs(): Promise<Pronostiqueur[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PRONOSTIQUEURS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting pronostiqueurs:', error);
      return [];
    }
  }

  static async savePronostiqueurs(pronostiqueurs: Pronostiqueur[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PRONOSTIQUEURS, JSON.stringify(pronostiqueurs));
    } catch (error) {
      console.error('Error saving pronostiqueurs:', error);
    }
  }

  static async getTeams(): Promise<Team[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TEAMS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting teams:', error);
      return [];
    }
  }

  static async saveTeams(teams: Team[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    } catch (error) {
      console.error('Error saving teams:', error);
    }
  }

  static async getPronostics(): Promise<Pronostic[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PRONOSTICS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting pronostics:', error);
      return [];
    }
  }

  static async savePronostics(pronostics: Pronostic[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PRONOSTICS, JSON.stringify(pronostics));
    } catch (error) {
      console.error('Error saving pronostics:', error);
    }
  }

  static async getCurrentTournament(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TOURNAMENT);
    } catch (error) {
      console.error('Error getting current tournament:', error);
      return null;
    }
  }

  static async setCurrentTournament(tournamentId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TOURNAMENT, tournamentId);
    } catch (error) {
      console.error('Error setting current tournament:', error);
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  static async getApiKey(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
    } catch (error) {
      console.error('Error getting API key:', error);
      return null;
    }
  }

  static async saveApiKey(apiKey: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  }
}

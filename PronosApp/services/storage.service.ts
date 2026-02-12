import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tournament, Match, Pronostiqueur, Team, Pronostic } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { AppError, ERROR_CODES } from './error';

export class StorageService {
  private static async getItem<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      throw new AppError(`Erreur de lecture: ${key}`, ERROR_CODES.STORAGE_ERROR);
    }
  }

  private static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw new AppError(`Erreur d'écriture: ${key}`, ERROR_CODES.STORAGE_ERROR);
    }
  }

  static async getTournaments(): Promise<Tournament[]> {
    const result = await this.getItem<Tournament[]>(STORAGE_KEYS.TOURNAMENTS);
    return result || [];
  }

  static async saveTournaments(tournaments: Tournament[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.TOURNAMENTS, tournaments);
  }

  static async getMatches(tournamentId: string): Promise<Match[]> {
    try {
      const allMatches = await this.getItem<Match[]>(STORAGE_KEYS.MATCHES) || [];
      return allMatches.filter((match: Match) => match.tournamentId === tournamentId);
    } catch (error) {
      console.error('Error getting matches:', error);
      return [];
    }
  }

  static async saveMatches(matches: Match[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.MATCHES, matches);
  }

  static async getPronostiqueurs(): Promise<Pronostiqueur[]> {
    const result = await this.getItem<Pronostiqueur[]>(STORAGE_KEYS.PRONOSTIQUEURS);
    return result || [];
  }

  static async savePronostiqueurs(pronostiqueurs: Pronostiqueur[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.PRONOSTIQUEURS, pronostiqueurs);
  }

  static async getTeams(): Promise<Team[]> {
    const result = await this.getItem<Team[]>(STORAGE_KEYS.TEAMS);
    return result || [];
  }

  static async saveTeams(teams: Team[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.TEAMS, teams);
  }

  static async getPronostics(): Promise<Pronostic[]> {
    const result = await this.getItem<Pronostic[]>(STORAGE_KEYS.PRONOSTICS);
    return result || [];
  }

  static async savePronostics(pronostics: Pronostic[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.PRONOSTICS, pronostics);
  }

  static async getCurrentTournament(): Promise<string | null> {
    return this.getItem<string>(STORAGE_KEYS.CURRENT_TOURNAMENT);
  }

  static async setCurrentTournament(tournamentId: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.CURRENT_TOURNAMENT, tournamentId);
  }

  static async getApiKey(): Promise<string | null> {
    return this.getItem<string>(STORAGE_KEYS.API_KEY);
  }

  static async saveApiKey(apiKey: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.API_KEY, apiKey);
  }

  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new AppError('Erreur de nettoyage du stockage', ERROR_CODES.STORAGE_ERROR);
    }
  }
}

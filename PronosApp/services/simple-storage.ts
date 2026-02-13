import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tournament, Match, Pronostic, Player } from '@/types/simple';

// Service de stockage simplifié
export class SimpleStorage {
  private static async get<T>(key: string): Promise<T[]> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Erreur lecture ${key}:`, error);
      return [];
    }
  }

  private static async set<T>(key: string, value: T[]): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erreur écriture ${key}:`, error);
      throw error;
    }
  }

  // Tournois
  static async getTournaments(): Promise<Tournament[]> {
    return this.get<Tournament>('tournaments');
  }

  static async saveTournaments(tournaments: Tournament[]): Promise<void> {
    return this.set('tournaments', tournaments);
  }

  // Matchs
  static async getMatches(tournamentId?: string): Promise<Match[]> {
    const matches = await this.get<Match>('matches');
    return tournamentId ? matches.filter(m => m.tournamentId === tournamentId) : matches;
  }

  static async saveMatches(matches: Match[]): Promise<void> {
    return this.set('matches', matches);
  }

  // Pronostics
  static async getPronostics(matchId?: string): Promise<Pronostic[]> {
    const pronostics = await this.get<Pronostic>('pronostics');
    return matchId ? pronostics.filter(p => p.matchId === matchId) : pronostics;
  }

  static async savePronostics(pronostics: Pronostic[]): Promise<void> {
    return this.set('pronostics', pronostics);
  }

  // Joueurs
  static async getPlayers(): Promise<Player[]> {
    return this.get<Player>('players');
  }

  static async savePlayers(players: Player[]): Promise<void> {
    return this.set('players', players);
  }

  // Nettoyage
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['tournaments', 'matches', 'pronostics', 'players']);
    } catch (error) {
      console.error('Erreur nettoyage:', error);
      throw error;
    }
  }
}
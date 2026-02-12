import { Match, Tournament } from '@/types';
import { ApiService, ApiMatch } from '@/utils/api';
import { StorageService } from '@/utils/storage';

export class MatchIntegrationService {
  static async importMatchesToTournament(
    tournamentId: string,
    competitionId?: number,
    dateFrom?: string,
    dateTo?: string
  ): Promise<Match[]> {
    try {
      // Récupérer les matchs depuis l'API
      let apiMatches: ApiMatch[];
      
      if (competitionId) {
        apiMatches = await ApiService.getMatchesByCompetition(competitionId);
      } else {
        apiMatches = await ApiService.getMatches(undefined, dateFrom, dateTo);
      }

      // Convertir les matchs API en format interne
      const convertedMatches = apiMatches.map(apiMatch => 
        ApiService.convertApiMatchToMatch(apiMatch, tournamentId)
      );

      // Récupérer les matchs existants pour ce tournoi
      const existingMatches = await StorageService.getMatches(tournamentId);
      
      // Filtrer les matchs qui n'existent pas déjà
      const newMatches = convertedMatches.filter(match => 
        !existingMatches.some(existingMatch => 
          existingMatch.externalId === match.externalId ||
          existingMatch.id === match.id
        )
      );

      if (newMatches.length === 0) {
        return [];
      }

      // Ajouter les nouveaux matchs aux matchs existants
      const allMatches = [...existingMatches, ...newMatches];
      await StorageService.saveMatches(allMatches);

      return newMatches;
    } catch (error) {
      console.error('Error importing matches:', error);
      throw error;
    }
  }

  static async syncTournamentMatches(tournamentId: string): Promise<{
    updated: number;
    added: number;
    total: number;
  }> {
    try {
      const tournament = await this.getTournamentById(tournamentId);
      if (!tournament) {
        throw new Error('Tournoi non trouvé');
      }

      const existingMatches = await StorageService.getMatches(tournamentId);
      
      // Récupérer les matchs de la semaine
      const apiMatches = await ApiService.getThisWeekMatches();
      const convertedMatches = apiMatches.map(apiMatch => 
        ApiService.convertApiMatchToMatch(apiMatch, tournamentId)
      );

      let updated = 0;
      let added = 0;

      for (const newMatch of convertedMatches) {
        const existingIndex = existingMatches.findIndex(match => 
          match.externalId === newMatch.externalId
        );

        if (existingIndex >= 0) {
          // Mettre à jour le match existant
          existingMatches[existingIndex] = newMatch;
          updated++;
        } else {
          // Ajouter le nouveau match
          existingMatches.push(newMatch);
          added++;
        }
      }

      await StorageService.saveMatches(existingMatches);

      return {
        updated,
        added,
        total: existingMatches.length,
      };
    } catch (error) {
      console.error('Error syncing tournament matches:', error);
      throw error;
    }
  }

  static async getTournamentById(tournamentId: string): Promise<Tournament | null> {
    try {
      const tournaments = await StorageService.getTournaments();
      return tournaments.find(t => t.id === tournamentId) || null;
    } catch (error) {
      console.error('Error getting tournament:', error);
      return null;
    }
  }

  static async getAvailableCompetitions(): Promise<Array<{
    id: number;
    name: string;
    matchesCount: number;
  }>> {
    try {
      const competitions = ApiService.getPopularCompetitions();
      const result = [];

      for (const competition of competitions) {
        try {
          const matches = await ApiService.getMatchesByCompetition(competition.id);
          result.push({
            id: competition.id,
            name: competition.name,
            matchesCount: matches.length,
          });
        } catch (error) {
          // Ignorer les compétitions qui retournent une erreur
          console.warn(`Could not fetch matches for ${competition.name}:`, error);
        }
      }

      return result.sort((a, b) => b.matchesCount - a.matchesCount);
    } catch (error) {
      console.error('Error getting available competitions:', error);
      return [];
    }
  }

  static async createTournamentFromCompetition(
    competitionId: number,
    tournamentName: string
  ): Promise<Tournament> {
    try {
      // Créer le nouveau tournoi
      const tournaments = await StorageService.getTournaments();
      const newTournament: Tournament = {
        id: Date.now().toString(),
        name: tournamentName,
        status: 'upcoming',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      tournaments.push(newTournament);
      await StorageService.saveTournaments(tournaments);

      // Importer les matchs de la compétition
      await this.importMatchesToTournament(newTournament.id, competitionId);

      return newTournament;
    } catch (error) {
      console.error('Error creating tournament from competition:', error);
      throw error;
    }
  }

  static async searchTeams(query: string): Promise<Array<{
    id: string;
    name: string;
    image?: string;
  }>> {
    try {
      const matches = await ApiService.getThisWeekMatches();
      const teams = new Map<string, { id: string; name: string; image?: string }>();

      matches.forEach(match => {
        // Ajouter l'équipe domicile
        if (match.teams.home.name.toLowerCase().includes(query.toLowerCase())) {
          teams.set(match.teams.home.id.toString(), {
            id: match.teams.home.id.toString(),
            name: match.teams.home.name,
            image: match.teams.home.logo,
          });
        }

        // Ajouter l'équipe extérieur
        if (match.teams.away.name.toLowerCase().includes(query.toLowerCase())) {
          teams.set(match.teams.away.id.toString(), {
            id: match.teams.away.id.toString(),
            name: match.teams.away.name,
            image: match.teams.away.logo,
          });
        }
      });

      return Array.from(teams.values()).slice(0, 20); // Limiter à 20 résultats
    } catch (error) {
      console.error('Error searching teams:', error);
      return [];
    }
  }

  static async getMatchesByTeam(teamId: string): Promise<Match[]> {
    try {
      const matches = await ApiService.getThisWeekMatches();
      const convertedMatches = matches.map(apiMatch => 
        ApiService.convertApiMatchToMatch(apiMatch, 'temp')
      );

      return convertedMatches.filter(match => 
        match.homeTeam.id === teamId || match.awayTeam.id === teamId
      );
    } catch (error) {
      console.error('Error getting matches by team:', error);
      return [];
    }
  }
}

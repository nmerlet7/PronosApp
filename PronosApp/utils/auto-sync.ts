import { apiFootballService, ApiFixture } from './api-football';
import { StorageService } from './storage';
import { Match } from '@/types';

class AutoSyncService {
  private static SYNC_INTERVAL = 60 * 60 * 1000; // 1 heure en millisecondes
  private static syncTimer: any = null;

  // Démarrer la synchronisation automatique
  static startAutoSync(tournamentId: string) {
    // Arrêter le timer existant
    this.stopAutoSync();

    // Synchroniser immédiatement
    this.syncMatches(tournamentId);

    // Configurer le timer pour la synchronisation périodique
    this.syncTimer = setInterval(() => {
      this.syncMatches(tournamentId);
    }, this.SYNC_INTERVAL);

    console.log('Auto-sync démarré - synchronisation toutes les heures');
  }

  // Arrêter la synchronisation automatique
  static stopAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log('Auto-sync arrêté');
    }
  }

  // Synchroniser les matchs manuellement
  static async syncMatches(tournamentId: string) {
    try {
      console.log('Début de la synchronisation des matchs...');
      
      // Récupérer les championnats principaux
      const leagues = await apiFootballService.getLeagues();
      const mainLeagues = leagues.filter(league => 
        [39, 140, 135, 78, 61, 2].includes(league.id)
      );

      // Pour chaque championnat, récupérer les matchs à venir
      for (const league of mainLeagues) {
        const currentSeason = league.seasons.find(s => s.current);
        if (!currentSeason) continue;

        const fixtures = await apiFootballService.getUpcomingFixtures(
          league.id, 
          currentSeason.year
        );

        // Importer les nouveaux matchs
        await this.importNewFixtures(tournamentId, fixtures);
        
        // Petite pause pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('Synchronisation terminée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      return false;
    }
  }

  // Importer uniquement les nouveaux matchs
  private static async importNewFixtures(tournamentId: string, fixtures: any[]) {
    try {
      const existingMatches = await StorageService.getMatches(tournamentId);
      const existingExternalIds = existingMatches
        .filter(m => m.externalId)
        .map(m => m.externalId);

      const newFixtures = fixtures.filter(fixture => 
        !existingExternalIds.includes(fixture.fixture.id)
      );

      if (newFixtures.length === 0) {
        console.log('Aucun nouveau match à importer');
        return;
      }

      const newMatches = newFixtures.map(fixture => 
        apiFootballService.convertApiFixtureToMatch(fixture, tournamentId)
      );

      existingMatches.push(...newMatches);
      await StorageService.saveMatches(existingMatches);

      console.log(`${newFixtures.length} nouveaux matchs importés`);
    } catch (error) {
      console.error('Erreur lors de l\'importation des matchs:', error);
    }
  }

  // Synchroniser les scores des matchs en cours
  static async syncLiveScores(tournamentId: string) {
    try {
      const matches = await StorageService.getMatches(tournamentId);
      const liveMatches = matches.filter(m => m.status === 'in_progress');

      if (liveMatches.length === 0) {
        console.log('Aucun match en cours à synchroniser');
        return;
      }

      // Récupérer les scores en direct
      const liveFixtures = await apiFootballService.getLiveFixtures();
      
      for (const liveFixture of liveFixtures) {
        const localMatch = matches.find(m => m.externalId === liveFixture.fixture.id);
        if (localMatch) {
          // Mettre à jour le score
          localMatch.scores = liveFixture.goals.home !== null && liveFixture.goals.away !== null ? {
            halftime: liveFixture.score.halftime.home !== null && liveFixture.score.halftime.away !== null ? {
              homeTeam: liveFixture.score.halftime.home,
              awayTeam: liveFixture.score.halftime.away,
            } : undefined,
            final: {
              homeTeam: liveFixture.goals.home,
              awayTeam: liveFixture.goals.away,
            },
            finalAfterPenalties: liveFixture.score.penalty.home !== null && liveFixture.score.penalty.away !== null ? {
              homeTeam: liveFixture.score.penalty.home,
              awayTeam: liveFixture.score.penalty.away,
            } : undefined,
          } : undefined;

          localMatch.status = apiFootballService.mapApiStatusToMatchStatus(liveFixture.fixture.status.long);
        }
      }

      await StorageService.saveMatches(matches);
      console.log('Scores en direct synchronisés');
    } catch (error) {
      console.error('Erreur lors de la synchronisation des scores:', error);
    }
  }

  // Obtenir le statut de synchronisation
  static getSyncStatus(): {
    isActive: boolean;
    lastSync?: Date;
  } {
    return {
      isActive: this.syncTimer !== null,
      lastSync: new Date(), // Tu pourrais stocker la date du dernier sync
    };
  }
}

export default AutoSyncService;

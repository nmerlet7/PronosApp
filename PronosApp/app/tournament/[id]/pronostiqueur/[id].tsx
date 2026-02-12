import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pronostiqueur, Pronostic, Match, Team } from '@/types';
import { StorageService } from '@/utils/storage';

export default function PronostiqueurDetailScreen() {
  const { id: tournamentId, id: pronostiqueurId } = useLocalSearchParams();
  const [pronostiqueur, setPronostiqueur] = useState<Pronostiqueur | null>(null);
  const [pronostics, setPronostics] = useState<Pronostic[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [tournamentId, pronostiqueurId]);

  const loadData = async () => {
    try {
      const [pronostiqueurs, pronosticsData, matchesData, teamsData] = await Promise.all([
        StorageService.getPronostiqueurs(),
        StorageService.getPronostics(),
        StorageService.getMatches(tournamentId as string),
        StorageService.getTeams(),
      ]);

      const pronostiqueurData = pronostiqueurs.find(p => p.id === pronostiqueurId);
      if (!pronostiqueurData) {
        Alert.alert('Erreur', 'Pronostiqueur non trouvé');
        router.back();
        return;
      }

      setPronostiqueur(pronostiqueurData);
      setTeams(teamsData);

      const pronostiqueurPronostics = pronosticsData.filter(p => p.pronostiqueurId === pronostiqueurId);
      setPronostics(pronostiqueurPronostics);
      setMatches(matchesData);
    } catch (error) {
      console.error('Error loading pronostiqueur data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données du pronostiqueur');
    } finally {
      setLoading(false);
    }
  };

  const getMatchInfo = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    return match;
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'Équipe inconnue';
  };

  const getWinnerText = (winner: 'home' | 'away' | 'draw', match?: Match) => {
    switch (winner) {
      case 'home':
        return match ? match.homeTeam.name : 'Domicile';
      case 'away':
        return match ? match.awayTeam.name : 'Extérieur';
      case 'draw':
        return 'Match nul';
      default:
        return winner;
    }
  };

  const getMatchStatusText = (status: Match['status']) => {
    switch (status) {
      case 'upcoming':
        return 'À venir';
      case 'in_progress':
        return 'En cours';
      case 'finished':
        return 'Terminé';
      default:
        return status;
    }
  };

  const getTotalPoints = () => {
    return pronostics.reduce((total, pronostic) => total + (pronostic.points || 0), 0);
  };

  const getCorrectPredictions = () => {
    return pronostics.filter(p => (p.points || 0) > 0).length;
  };

  const renderPronostic = (pronostic: Pronostic) => {
    const match = getMatchInfo(pronostic.matchId);
    if (!match) return null;

    return (
      <View key={pronostic.id} style={styles.pronosticCard}>
        <View style={styles.pronosticHeader}>
          <View style={styles.matchInfo}>
            <Text style={styles.matchName}>
              {match.name || `${getTeamName(match.homeTeam.id)} vs ${getTeamName(match.awayTeam.id)}`}
            </Text>
            <Text style={styles.matchDate}>
              {getMatchStatusText(match.status)}
            </Text>
          </View>
          <View style={[styles.pointsBadge, { 
            backgroundColor: (pronostic.points || 0) > 0 ? '#10B981' : 
                             (pronostic.points || 0) < 0 ? '#EF4444' : '#6B7280' 
          }]}>
            <Text style={styles.pointsText}>{pronostic.points || 0} pts</Text>
          </View>
        </View>

        <View style={styles.pronosticDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vainqueur:</Text>
            <Text style={styles.detailValue}>{getWinnerText(pronostic.winner, match)}</Text>
          </View>

          {pronostic.halftimeScore && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mi-temps:</Text>
              <Text style={styles.detailValue}>
                {pronostic.halftimeScore.homeTeam} - {pronostic.halftimeScore.awayTeam}
              </Text>
            </View>
          )}

          {pronostic.finalScore && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Score final:</Text>
              <Text style={styles.detailValue}>
                {pronostic.finalScore.homeTeam} - {pronostic.finalScore.awayTeam}
              </Text>
            </View>
          )}

          {match.scores?.final && (
            <View style={styles.resultSection}>
              <Text style={styles.resultLabel}>Résultat réel:</Text>
              <Text style={styles.resultValue}>
                {match.scores.final.homeTeam} - {match.scores.final.awayTeam}
              </Text>
              {match.scores.halftime && (
                <Text style={styles.halftimeResult}>
                  Mi-temps: {match.scores.halftime.homeTeam} - {match.scores.halftime.awayTeam}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pronostiqueur) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Pronostiqueur non trouvé</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerSection}>
          <View style={styles.pronostiqueurInfo}>
            <View style={styles.avatarContainer}>
              {pronostiqueur.photo ? (
                <Image source={{ uri: pronostiqueur.photo }} style={styles.avatar} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Ionicons name="person" size={40} color="#9CA3AF" />
                </View>
              )}
            </View>
            <Text style={styles.pronostiqueurName}>{pronostiqueur.name}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getTotalPoints()}</Text>
              <Text style={styles.statLabel}>Points totaux</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{pronostics.length}</Text>
              <Text style={styles.statLabel}>Pronostics</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getCorrectPredictions()}</Text>
              <Text style={styles.statLabel}>Corrects</Text>
            </View>
          </View>
        </View>

        <View style={styles.pronosticsSection}>
          <Text style={styles.sectionTitle}>Pronostics ({pronostics.length})</Text>
          
          {pronostics.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="analytics-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyText}>Aucun pronostic</Text>
              <Text style={styles.emptySubtext}>
                Ce pronostiqueur n'a pas encore fait de pronostics
              </Text>
            </View>
          ) : (
            pronostics.map(renderPronostic)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  pronostiqueurInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  defaultAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pronostiqueurName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  pronosticsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  pronosticCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pronosticHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  matchInfo: {
    flex: 1,
    marginRight: 12,
  },
  matchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  matchDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  pointsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  pronosticDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  resultSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  resultLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  halftimeResult: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});

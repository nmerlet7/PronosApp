import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Match, Team } from '@/types';
import { StorageService } from '@/utils/storage';

interface MatchesScreenProps {
  tournamentId: string;
}

export default function MatchesScreen({ tournamentId }: MatchesScreenProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'in_progress' | 'finished'>('all');

  useEffect(() => {
    loadData();
  }, [tournamentId]);

  const loadData = async () => {
    try {
      const [matchesData, teamsData] = await Promise.all([
        StorageService.getMatches(tournamentId),
        StorageService.getTeams(),
      ]);
      setMatches(matchesData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading matches:', error);
      Alert.alert('Erreur', 'Impossible de charger les matchs');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMatches = () => {
    if (filter === 'all') return matches;
    return matches.filter(match => match.status === filter);
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'Équipe inconnue';
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

  const getMatchStatusColor = (status: Match['status']) => {
    switch (status) {
      case 'upcoming':
        return '#10B981';
      case 'in_progress':
        return '#F59E0B';
      case 'finished':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const formatScore = (match: Match) => {
    if (!match.scores?.final) {
      return 'vs';
    }
    return `${match.scores.final.homeTeam} - ${match.scores.final.awayTeam}`;
  };

  const handleMatchPress = (matchId: string) => {
    router.push(`/tournament/${tournamentId}/match/${matchId}`);
  };

  const renderFilterButton = (filterType: typeof filter, title: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterType && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === filterType && styles.filterButtonTextActive,
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderMatch = ({ item }: { item: Match }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => handleMatchPress(item.id)}
    >
      <View style={styles.matchHeader}>
        <Text style={styles.matchName}>
          {item.name || `${getTeamName(item.homeTeam.id)} vs ${getTeamName(item.awayTeam.id)}`}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getMatchStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getMatchStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.teamsContainer}>
        <View style={styles.team}>
          <Text style={styles.teamName}>{getTeamName(item.homeTeam.id)}</Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{formatScore(item)}</Text>
        </View>

        <View style={styles.team}>
          <Text style={styles.teamName}>{getTeamName(item.awayTeam.id)}</Text>
        </View>
      </View>

      {item.scores?.halftime && (
        <Text style={styles.halftimeScore}>
          Mi-temps: {item.scores.halftime.homeTeam} - {item.scores.halftime.awayTeam}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Chargement des matchs...</Text>
      </View>
    );
  }

  const filteredMatches = getFilteredMatches();

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        {renderFilterButton('all', 'Tous')}
        {renderFilterButton('upcoming', 'À venir')}
        {renderFilterButton('in_progress', 'En cours')}
        {renderFilterButton('finished', 'Terminés')}
      </View>

      {filteredMatches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="football-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>Aucun match</Text>
          <Text style={styles.emptySubtext}>
            {filter === 'all' 
              ? 'Ajoutez des matchs pour commencer' 
              : `Aucun match ${getMatchStatusText(filter as Match['status']).toLowerCase()}`
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMatches}
          renderItem={renderMatch}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/modal?match=new')}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.fab, styles.pronosticFab]}
        onPress={() => router.push('/modal?pronostic=new')}
      >
        <Ionicons name="trophy" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.fab, styles.teamFab]}
        onPress={() => router.push('/modal?team=new')}
      >
        <Ionicons name="people" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.fab, styles.apiFab]}
        onPress={() => router.push(`/tournament/${tournamentId}/api-matches`)}
      >
        <Ionicons name="cloud-download" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.fab, styles.syncFab]}
        onPress={() => router.push(`/tournament/${tournamentId}/sync`)}
      >
        <Ionicons name="sync" size={24} color="white" />
      </TouchableOpacity>
    </View>
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
  filtersContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
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
  list: {
    padding: 16,
  },
  matchCard: {
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
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  team: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  scoreContainer: {
    paddingHorizontal: 20,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  halftimeScore: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  pronosticFab: {
    bottom: 90,
    backgroundColor: '#10B981',
  },
  teamFab: {
    bottom: 156,
    backgroundColor: '#F59E0B',
  },
  apiFab: {
    bottom: 222,
    backgroundColor: '#8B5CF6',
  },
  syncFab: {
    bottom: 288,
    backgroundColor: '#10B981',
  },
});

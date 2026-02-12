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
import { Pronostiqueur, RankingEntry, Pronostic } from '@/types';
import { StorageService } from '@/utils/storage';
import { PointsCalculator } from '@/utils/points';

interface RankingScreenProps {
  tournamentId: string;
}

export default function RankingScreen({ tournamentId }: RankingScreenProps) {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRanking();
  }, [tournamentId]);

  const loadRanking = async () => {
    try {
      const [pronostiqueurs, matches, pronostics] = await Promise.all([
        StorageService.getPronostiqueurs(),
        StorageService.getMatches(tournamentId),
        StorageService.getPronostics(),
      ]);

      const tournamentPronostics = pronostics.filter(p => 
        matches.some(m => m.id === p.matchId)
      );

      const updatedPronostics = PointsCalculator.updatePronosticPoints(tournamentPronostics, matches);

      const rankingEntries: RankingEntry[] = pronostiqueurs.map(pronostiqueur => {
        const pronostiqueurPronostics = updatedPronostics.filter(p => p.pronostiqueurId === pronostiqueur.id);
        const totalPoints = pronostiqueurPronostics.reduce((sum, p) => sum + (p.points || 0), 0);

        return {
          pronostiqueur,
          totalPoints,
          pronostics: pronostiqueurPronostics,
        };
      });

      rankingEntries.sort((a, b) => b.totalPoints - a.totalPoints);
      setRanking(rankingEntries);
    } catch (error) {
      console.error('Error loading ranking:', error);
      Alert.alert('Erreur', 'Impossible de charger le classement');
    } finally {
      setLoading(false);
    }
  };

  const handlePronostiqueurPress = (pronostiqueurId: string) => {
    router.push(`/tournament/${tournamentId}/pronostiqueur/${pronostiqueurId}`);
  };

  const getRankingIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const renderRankingItem = ({ item, index }: { item: RankingEntry; index: number }) => (
    <TouchableOpacity
      style={styles.rankingItem}
      onPress={() => handlePronostiqueurPress(item.pronostiqueur.id)}
    >
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>{getRankingIcon(index + 1)}</Text>
      </View>
      
      <View style={styles.pronostiqueurInfo}>
        <Text style={styles.pronostiqueurName}>{item.pronostiqueur.name}</Text>
        <Text style={styles.pronosticsCount}>
          {item.pronostics.length} pronostic{item.pronostics.length > 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.pointsContainer}>
        <Text style={styles.pointsText}>{item.totalPoints}</Text>
        <Text style={styles.pointsLabel}>points</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Chargement du classement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {ranking.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="podium-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>Aucun pronostiqueur</Text>
          <Text style={styles.emptySubtext}>
            Ajoutez des pronostiqueurs pour voir le classement
          </Text>
        </View>
      ) : (
        <FlatList
          data={ranking}
          renderItem={renderRankingItem}
          keyExtractor={(item) => item.pronostiqueur.id}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/modal?pronostiqueur=new')}
      >
        <Ionicons name="person-add" size={24} color="white" />
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
  rankingItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  pronostiqueurInfo: {
    flex: 1,
    marginLeft: 16,
  },
  pronostiqueurName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  pronosticsCount: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  pointsContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  pointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#6B7280',
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
});

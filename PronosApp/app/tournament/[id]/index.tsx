import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Tournament, Match, Pronostiqueur, RankingEntry } from '@/types';
import { StorageService } from '@/utils/storage';
import { PointsCalculator } from '@/utils/points';
import RankingScreen from './ranking';
import MatchesScreen from './matches';

export default function TournamentScreen() {
  const { id } = useLocalSearchParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'ranking', title: 'Classement' },
    { key: 'matches', title: 'Matchs' },
  ]);

  useEffect(() => {
    initializeAndLoadTournaments();
  }, [id]);

  const loadTournament = async () => {
    try {
      const tournaments = await StorageService.getTournaments();
      const tournamentData = tournaments.find((t: Tournament) => t.id === id);
      setTournament(tournamentData || null);
    } catch (error) {
      console.error('Error loading tournament:', error);
    }
  };

  const renderScene = SceneMap({
    ranking: () => <RankingScreen tournamentId={id as string} />,
    matches: () => <MatchesScreen tournamentId={id as string} />,
  });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: '#3B82F6' }}
      style={{ backgroundColor: 'white' }}
      activeColor="#3B82F6"
      inactiveColor="#9CA3AF"
      labelStyle={{ fontWeight: '600' }}
    />
  );

  if (!tournament) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Chargement du tournoi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tournamentName}>{tournament.name}</Text>
        <View style={[styles.statusBadge, { 
          backgroundColor: tournament.status === 'upcoming' ? '#10B981' : 
                           tournament.status === 'in_progress' ? '#F59E0B' : '#6B7280' 
        }]}>
          <Text style={styles.statusText}>
            {tournament.status === 'upcoming' ? 'À venir' : 
             tournament.status === 'in_progress' ? 'En cours' : 'Terminé'}
          </Text>
        </View>
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={renderTabBar}
        style={styles.tabView}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tournamentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabView: {
    flex: 1,
  },
});
function initializeAndLoadTournaments() {
  throw new Error('Function not implemented.');
}


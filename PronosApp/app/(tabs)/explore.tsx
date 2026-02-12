import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Tournament, Match, Team, Pronostiqueur, Pronostic } from '@/types';
import { StorageService } from '@/utils/storage';

export default function TabExploreScreen() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [pronostiqueurs, setPronostiqueurs] = useState<Pronostiqueur[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tournaments' | 'teams' | 'players'>('tournaments');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tournamentsData, teamsData, pronostiqueursData] = await Promise.all([
        StorageService.getTournaments(),
        StorageService.getTeams(),
        StorageService.getPronostiqueurs(),
      ]);

      setTournaments(tournamentsData);
      setTeams(teamsData);
      setPronostiqueurs(pronostiqueursData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentPress = async (tournamentId: string) => {
    await StorageService.setCurrentTournament(tournamentId);
    router.replace(`/tournament/${tournamentId}`);
  };

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'upcoming': return '#10B981';
      case 'in_progress': return '#F59E0B';
      case 'finished': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: Tournament['status']) => {
    switch (status) {
      case 'upcoming': return 'À venir';
      case 'in_progress': return 'En cours';
      case 'finished': return 'Terminé';
      default: return status;
    }
  };

  const renderTournament = ({ item }: { item: Tournament }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleTournamentPress(item.id)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      <Text style={styles.cardSubtitle}>
        Créé le {new Date(item.createdAt).toLocaleDateString('fr-FR')}
      </Text>
    </TouchableOpacity>
  );

  const renderTeam = ({ item }: { item: Team }) => (
    <View style={styles.card}>
      <View style={styles.teamInfo}>
        <View style={styles.teamIcon}>
          <Ionicons name="shield-outline" size={24} color="#3B82F6" />
        </View>
        <View style={styles.teamDetails}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          {item.image && (
            <Text style={styles.cardSubtitle}>Image disponible</Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderPronostiqueur = ({ item }: { item: Pronostiqueur }) => (
    <View style={styles.card}>
      <View style={styles.playerInfo}>
        <View style={styles.playerIcon}>
          <Ionicons name="person-outline" size={24} color="#10B981" />
        </View>
        <View style={styles.playerDetails}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          {item.photo && (
            <Text style={styles.cardSubtitle}>Photo disponible</Text>
          )}
        </View>
      </View>
    </View>
  );

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorer</Text>
        <Text style={styles.subtitle}>Découvrez tous les éléments</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tournaments' && styles.activeTab]}
          onPress={() => setActiveTab('tournaments')}
        >
          <Ionicons 
            name="trophy-outline" 
            size={20} 
            color={activeTab === 'tournaments' ? '#3B82F6' : '#6B7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'tournaments' && styles.activeTabText]}>
            Tournois
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'teams' && styles.activeTab]}
          onPress={() => setActiveTab('teams')}
        >
          <Ionicons 
            name="shield-outline" 
            size={20} 
            color={activeTab === 'teams' ? '#3B82F6' : '#6B7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'teams' && styles.activeTabText]}>
            Équipes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'players' && styles.activeTab]}
          onPress={() => setActiveTab('players')}
        >
          <Ionicons 
            name="people-outline" 
            size={20} 
            color={activeTab === 'players' ? '#3B82F6' : '#6B7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'players' && styles.activeTabText]}>
            Joueurs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'tournaments' && (
          <View>
            {tournaments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="trophy-outline" size={60} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>Aucun tournoi</Text>
                <Text style={styles.emptyText}>
                  Créez votre premier tournoi pour commencer
                </Text>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push('/modal?tournament=new')}
                >
                  <Text style={styles.actionButtonText}>Créer un tournoi</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={tournaments}
                renderItem={renderTournament}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        )}

        {activeTab === 'teams' && (
          <View>
            {teams.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="shield-outline" size={60} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>Aucune équipe</Text>
                <Text style={styles.emptyText}>
                  Ajoutez des équipes pour créer des matchs
                </Text>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push('/modal?team=new')}
                >
                  <Text style={styles.actionButtonText}>Ajouter une équipe</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={teams}
                renderItem={renderTeam}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        )}

        {activeTab === 'players' && (
          <View>
            {pronostiqueurs.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={60} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>Aucun joueur</Text>
                <Text style={styles.emptyText}>
                  Ajoutez des pronostiqueurs pour faire des paris
                </Text>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push('/modal?pronostiqueur=new')}
                >
                  <Text style={styles.actionButtonText}>Ajouter un joueur</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={pronostiqueurs}
                renderItem={renderPronostiqueur}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    paddingTop: 32,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#EBF5FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#3B82F6',
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  teamDetails: {
    flex: 1,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerDetails: {
    flex: 1,
  },
});

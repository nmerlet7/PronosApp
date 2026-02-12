import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Tournament, Match, Pronostiqueur, Pronostic } from '@/types';
import { StorageService } from '@/utils/storage';

const { width } = Dimensions.get('window');

export default function TabHomeScreen() {
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [topPronostiqueurs, setTopPronostiqueurs] = useState<Pronostiqueur[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const loadDashboardData = async () => {
    try {
      const tournamentId = await StorageService.getCurrentTournament();
      
      if (tournamentId) {
        const [tournament, matches, pronostiqueurs, pronostics] = await Promise.all([
          StorageService.getTournaments().then(tournaments => 
            tournaments.find(t => t.id === tournamentId) || null
          ),
          StorageService.getMatches(tournamentId),
          StorageService.getPronostiqueurs(),
          StorageService.getPronostics(),
        ]);

        if (!tournament) {
          setCurrentTournament(null);
          return;
        }

        setCurrentTournament(tournament);
        
        // Get recent matches (last 5)
        const sortedMatches = matches
          .sort((a: Match, b: Match) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
          .slice(0, 5);
        setRecentMatches(sortedMatches);

        // Calculate top pronostiqueurs
        const pronostiqueurPoints = pronostiqueurs.map((pronostiqueur: Pronostiqueur) => {
          const userPronostics = pronostics.filter((p: Pronostic) => p.pronostiqueurId === pronostiqueur.id);
          const totalPoints = userPronostics.reduce((sum: number, p: Pronostic) => sum + (p.points || 0), 0);
          return { ...pronostiqueur, totalPoints };
        });
        
        const sortedPronostiqueurs = pronostiqueurPoints
          .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
          .slice(0, 3);
        setTopPronostiqueurs(sortedPronostiqueurs);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Match['status']) => {
    switch (status) {
      case 'upcoming': return '#10B981';
      case 'in_progress': return '#F59E0B';
      case 'finished': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: Match['status']) => {
    switch (status) {
      case 'upcoming': return 'À venir';
      case 'in_progress': return 'En cours';
      case 'finished': return 'Terminé';
      default: return status;
    }
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

  if (!currentTournament) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.header}>
              <Text style={styles.title}>Tableau de bord</Text>
              <Text style={styles.subtitle}>Bienvenue sur PronosApp</Text>
            </View>

            <View style={styles.welcomeCard}>
              <Ionicons name="football-outline" size={60} color="#3B82F6" />
              <Text style={styles.welcomeTitle}>Commencez maintenant !</Text>
              <Text style={styles.welcomeText}>
                Créez ou rejoignez un tournoi pour commencer à faire des pronostics
              </Text>
              <TouchableOpacity
                style={styles.welcomeButton}
                onPress={() => router.push('/')}
              >
                <Text style={styles.welcomeButtonText}>Voir les tournois</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Tableau de bord</Text>
            <Text style={styles.subtitle}>{currentTournament.name}</Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/modal?match=new')}
            >
              <Ionicons name="add-circle-outline" size={24} color="#3B82F6" />
              <Text style={styles.actionTitle}>Nouveau match</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/modal?pronostic=new')}
            >
              <Ionicons name="clipboard-outline" size={24} color="#10B981" />
              <Text style={styles.actionTitle}>Faire un pronostic</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/modal?pronostiqueur=new')}
            >
              <Ionicons name="person-add-outline" size={24} color="#F59E0B" />
              <Text style={styles.actionTitle}>Ajouter un joueur</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Matches */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Matchs récents</Text>
            {recentMatches.length === 0 ? (
              <View style={styles.emptySection}>
                <Ionicons name="calendar-outline" size={40} color="#9CA3AF" />
                <Text style={styles.emptyText}>Aucun match</Text>
              </View>
            ) : (
              recentMatches.map((match) => (
                <TouchableOpacity
                  key={match.id}
                  style={styles.matchCard}
                  onPress={() => router.push(`/tournament/${currentTournament.id}`)}
                >
                  <View style={styles.matchTeams}>
                    <Text style={styles.teamName}>{match.homeTeam.name}</Text>
                    <Text style={styles.vs}>VS</Text>
                    <Text style={styles.teamName}>{match.awayTeam.name}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(match.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(match.status)}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Top Pronostiqueurs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Classement</Text>
            {topPronostiqueurs.length === 0 ? (
              <View style={styles.emptySection}>
                <Ionicons name="podium-outline" size={40} color="#9CA3AF" />
                <Text style={styles.emptyText}>Aucun pronostic</Text>
              </View>
            ) : (
              topPronostiqueurs.map((pronostiqueur, index) => (
                <View key={pronostiqueur.id} style={styles.rankingCard}>
                  <View style={styles.rankingPosition}>
                    <Text style={styles.positionNumber}>#{index + 1}</Text>
                  </View>
                  <View style={styles.rankingInfo}>
                    <Text style={styles.rankingName}>{pronostiqueur.name}</Text>
                    <Text style={styles.rankingPoints}>{(pronostiqueur as any).totalPoints} points</Text>
                  </View>
                  {index === 0 && <Ionicons name="trophy" size={20} color="#F59E0B" />}
                </View>
              ))
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
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
  welcomeCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  welcomeButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  welcomeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  emptySection: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  matchCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  vs: {
    fontSize: 12,
    color: '#6B7280',
    marginHorizontal: 8,
    fontWeight: '500',
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
  rankingCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  rankingPosition: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  positionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  rankingInfo: {
    flex: 1,
  },
  rankingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  rankingPoints: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
});

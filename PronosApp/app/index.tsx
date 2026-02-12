import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Tournament } from '@/types';
import { StorageService } from '@/utils/storage';
import { initializeApp } from '@/utils/init';

export default function HomeScreen() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [fabMenuVisible, setFabMenuVisible] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const fabMenuAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeAndLoadTournaments();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  useEffect(() => {
    if (fabMenuVisible) {
      Animated.timing(fabMenuAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fabMenuAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [fabMenuVisible]);

  const initializeAndLoadTournaments = async () => {
    await initializeApp();
    loadTournaments();
  };

  const loadTournaments = async () => {
    try {
      const currentTournamentId = await StorageService.getCurrentTournament();
      if (currentTournamentId) {
        router.replace(`/tournament/${currentTournamentId}`);
        return;
      }

      const storedTournaments = await StorageService.getTournaments();
      setTournaments(storedTournaments);
    } catch (error) {
      console.error('Error loading tournaments:', error);
      Alert.alert('Erreur', 'Impossible de charger les tournois');
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentPress = async (tournamentId: string) => {
    await StorageService.setCurrentTournament(tournamentId);
    router.push(`/tournament/${tournamentId}`);
  };

  const toggleFabMenu = () => {
    setFabMenuVisible(!fabMenuVisible);
  };

  const handleCreateTournament = () => {
    setFabMenuVisible(false);
    router.push('/modal?tournament=new');
  };

  const handleMakeBet = () => {
    setFabMenuVisible(false);
    if (tournaments.length === 0) {
      Alert.alert('Aucun tournoi', 'Veuillez d\'abord créer un tournoi pour faire des paris');
      return;
    }
    router.push('/modal?bet=new');
  };

  const handleAddPlayer = () => {
    setFabMenuVisible(false);
    if (tournaments.length === 0) {
      Alert.alert('Aucun tournoi', 'Veuillez d\'abord créer un tournoi pour ajouter des joueurs');
      return;
    }
    router.push('/modal?player=new');
  };

  const getStatusColor = (status: Tournament['status']) => {
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

  const getStatusText = (status: Tournament['status']) => {
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

  const renderTournament = ({ item, index }: { item: Tournament; index: number }) => (
    <Animated.View
      style={[
        styles.tournamentCard,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.tournamentCardContent}
        onPress={() => handleTournamentPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.tournamentHeader}>
          <View style={styles.tournamentInfo}>
            <Text style={styles.tournamentName}>{item.name}</Text>
            <Text style={styles.tournamentDate}>
              Créé le {new Date(item.createdAt).toLocaleDateString('fr-FR')}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        <View style={styles.tournamentFooter}>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    </Animated.View>
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
        <Text style={styles.title}>PronosApp</Text>
        <Text style={styles.subtitle}>Gérez vos tournois de paris sportifs</Text>
      </View>

      {tournaments.length === 0 ? (
        <Animated.View
          style={[
            styles.emptyContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.emptyIconContainer}>
            <Ionicons name="trophy-outline" size={80} color="#3B82F6" />
          </View>
          <Text style={styles.emptyTitle}>Bienvenue dans PronosApp !</Text>
          <Text style={styles.emptyText}>Aucun tournoi pour le moment</Text>
          <Text style={styles.emptySubtext}>
            Créez votre premier tournoi et commencez à faire des pronostics avec vos amis
          </Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => router.push('/modal?tournament=new')}
          >
            <Ionicons name="add-circle-outline" size={24} color="white" />
            <Text style={styles.createFirstButtonText}>Créer mon premier tournoi</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes tournois</Text>
            <Text style={styles.sectionSubtitle}>{tournaments.length} tournoi{tournaments.length > 1 ? 's' : ''}</Text>
          </View>
          <FlatList
            data={tournaments}
            renderItem={renderTournament}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      )}

      {tournaments.length > 0 && (
        <>
          <TouchableOpacity
            style={[styles.fab, fabMenuVisible && styles.fabRotated]}
            onPress={toggleFabMenu}
            activeOpacity={0.8}
          >
            <Ionicons name={fabMenuVisible ? "close" : "add"} size={28} color="white" />
          </TouchableOpacity>

          {fabMenuVisible && (
            <Animated.View style={[styles.fabMenu, { opacity: fabMenuAnimation }]}>
              <TouchableOpacity
                style={styles.fabMenuItem}
                onPress={handleCreateTournament}
                activeOpacity={0.8}
              >
                <View style={styles.fabMenuItemIcon}>
                  <Ionicons name="trophy-outline" size={24} color="white" />
                </View>
                <Text style={styles.fabMenuItemText}>Créer un tournoi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.fabMenuItem}
                onPress={handleMakeBet}
                activeOpacity={0.8}
              >
                <View style={styles.fabMenuItemIcon}>
                  <Ionicons name="football-outline" size={24} color="white" />
                </View>
                <Text style={styles.fabMenuItemText}>Faire un pari</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.fabMenuItem}
                onPress={handleAddPlayer}
                activeOpacity={0.8}
              >
                <View style={styles.fabMenuItemIcon}>
                  <Ionicons name="person-add-outline" size={24} color="white" />
                </View>
                <Text style={styles.fabMenuItemText}>Ajouter un joueur</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
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
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    maxWidth: 280,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  createFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  list: {
    padding: 16,
  },
  tournamentCard: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tournamentCardContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tournamentInfo: {
    flex: 1,
    marginRight: 12,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  tournamentDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  tournamentFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  fabRotated: {
    transform: [{ rotate: '45deg' }],
  },
  fabMenu: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 180,
  },
  fabMenuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fabMenuItemText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

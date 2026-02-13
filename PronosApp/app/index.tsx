import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useData } from '@/context/DataContext';
import { Bettor, Competition, Team, Match } from '@/types';

interface Tournament {
  id: string;
  name: string;
  status: 'upcoming' | 'in_progress' | 'finished';
  createdAt: string;
}

export default function SimpleHomeScreen() {
  console.log('Rendering app/index.tsx');
  const router = useRouter();
  const { addBettor, competitions } = useData();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [tournamentName, setTournamentName] = useState('');
  const [bettorName, setBettorName] = useState('');
  const [modalMode, setModalMode] = useState<'tournament' | 'bettor' | 'match'>('tournament');
  
  // États pour la création de match
  const [selectedCompetition, setSelectedCompetition] = useState<string>('');
  const [homeTeamName, setHomeTeamName] = useState('');
  const [awayTeamName, setAwayTeamName] = useState('');
  const [matchDate, setMatchDate] = useState('');

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const stored = await AsyncStorage.getItem('tournaments');
      if (stored) {
        setTournaments(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTournaments = async (newTournaments: Tournament[]) => {
    try {
      await AsyncStorage.setItem('tournaments', JSON.stringify(newTournaments));
      setTournaments(newTournaments);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder');
    }
  };

  const createTournament = () => {
    if (!tournamentName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom');
      return;
    }

    const newTournament: Tournament = {
      id: Date.now().toString(),
      name: tournamentName.trim(),
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    };

    const updated = [...tournaments, newTournament];
    saveTournaments(updated);
    
    setTournamentName('');
    setShowModal(false);
  };

  const createBettor = () => {
    if (!bettorName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom');
      return;
    }

    const newBettor: Bettor = {
      id: Date.now(),
      name: bettorName.trim(),
      totalPoints: 0
    };

    addBettor(newBettor);
    
    setBettorName('');
    setShowModal(false);
    
    Alert.alert('Succès', `Utilisateur ${newBettor.name} créé avec succès`);
  };

  const createMatch = () => {
    if (!selectedCompetition || !homeTeamName.trim() || !awayTeamName.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    const competition = competitions.find(c => c.id === parseInt(selectedCompetition));
    if (!competition) {
      Alert.alert('Erreur', 'Compétition non trouvée');
      return;
    }

    const newMatch: Match = {
      id: Date.now(),
      home: { name: homeTeamName.trim(), id: Date.now() },
      away: { name: awayTeamName.trim(), id: Date.now() + 1 },
      date: matchDate || new Date().toISOString(),
    };

    // TODO: Ajouter le match à la compétition
    console.log('Match créé:', newMatch);
    
    setSelectedCompetition('');
    setHomeTeamName('');
    setAwayTeamName('');
    setMatchDate('');
    setShowModal(false);
    
    Alert.alert('Succès', `Match ${newMatch.home.name} vs ${newMatch.away.name} créé`);
  };

  const deleteTournament = (id: string) => {
    Alert.alert(
      'Supprimer',
      'Êtes-vous sûr ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            const updated = tournaments.filter(t => t.id !== id);
            saveTournaments(updated);
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#10B981';
      case 'in_progress': return '#F59E0B';
      case 'finished': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
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
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 PronosApp</Text>
        <Text style={styles.subtitle}>Tournois créés: {tournaments.length}</Text>
      </View>

      {tournaments.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>🎯</View>
          <Text style={styles.emptyText}>Aucun tournoi</Text>
          <Text style={styles.emptySubtext}>Créez votre premier tournoi pour commencer</Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.primaryButtonText}>✨ Créer un tournoi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tournaments}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>🏆 {item.name}</Text>
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateIcon}>📅</Text>
                    <Text style={styles.cardDate}>
                      {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                </View>
                <View style={[styles.status, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => {
                    setTournamentName(item.name);
                    setModalMode('tournament');
                    setShowModal(true);
                  }}
                >
                  <Text style={styles.editButtonText}>✏️ Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    deleteTournament(item.id);
                  }}
                >
                  <Text style={styles.deleteButtonText}>🗑️ Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowActionMenu(true)}
      >
        <Text style={styles.fabText}>➕</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalMode === 'tournament' ? 'Nouveau tournoi' : 
               modalMode === 'bettor' ? 'Nouvel utilisateur' : 'Nouveau match'}
            </Text>
            
            {modalMode === 'tournament' && (
              <TextInput
                style={styles.input}
                value={tournamentName}
                onChangeText={setTournamentName}
                placeholder="Nom du tournoi"
                autoFocus
              />
            )}
            
            {modalMode === 'bettor' && (
              <TextInput
                style={styles.input}
                value={bettorName}
                onChangeText={setBettorName}
                placeholder="Nom de l'utilisateur"
                autoFocus
              />
            )}
            
            {modalMode === 'match' && (
              <View>
                <TextInput
                  style={[styles.input, { marginBottom: 12 }]}
                  value={homeTeamName}
                  onChangeText={setHomeTeamName}
                  placeholder="Équipe domicile"
                  autoFocus
                />
                <TextInput
                  style={[styles.input, { marginBottom: 12 }]}
                  value={awayTeamName}
                  onChangeText={setAwayTeamName}
                  placeholder="Équipe extérieur"
                />
                <TextInput
                  style={[styles.input, { marginBottom: 12 }]}
                  value={matchDate}
                  onChangeText={setMatchDate}
                  placeholder="Date (YYYY-MM-DD)"
                />
                <TextInput
                  style={styles.input}
                  value={selectedCompetition}
                  onChangeText={setSelectedCompetition}
                  placeholder="ID de la compétition"
                />
              </View>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowModal(false);
                  setTournamentName('');
                  setBettorName('');
                  setSelectedCompetition('');
                  setHomeTeamName('');
                  setAwayTeamName('');
                  setMatchDate('');
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={modalMode === 'tournament' ? createTournament : 
                        modalMode === 'bettor' ? createBettor : createMatch}
              >
                <Text style={styles.createButtonText}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showActionMenu} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.actionMenuOverlay}
          activeOpacity={1}
          onPress={() => setShowActionMenu(false)}
        >
          <View style={styles.actionMenu}>
            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => {
                setShowActionMenu(false);
                setModalMode('tournament');
                setShowModal(true);
              }}
            >
              <Text style={styles.actionMenuText}>🏆 Créer un tournoi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => {
                setShowActionMenu(false);
                setModalMode('bettor');
                setShowModal(true);
              }}
            >
              <Text style={styles.actionMenuText}>👤 Créer un utilisateur</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => {
                setShowActionMenu(false);
                setModalMode('match');
                setShowModal(true);
              }}
            >
              <Text style={styles.actionMenuText}>⚽ Créer un match</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderRadius: 16,
    margin: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '500',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 24,
    color: '#1F2937',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ scale: 1 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  cardDate: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  status: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  fabText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  createButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actionMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  actionMenu: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  actionMenuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionMenuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
});
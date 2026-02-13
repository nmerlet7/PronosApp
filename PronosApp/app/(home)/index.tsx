import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '@/context/DataContext';
import { useRouter } from "expo-router";
import { Bettor, Match } from '@/types';

interface Tournament {
  id: string;
  name: string;
  status: 'upcoming' | 'in_progress' | 'finished';
  createdAt: string;
  matches?: Match[];
}

export default function HomeScreen() {
  const { addBettor, competitions } = useData();
  const router = useRouter();
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
  
  // États pour les matchs du tournoi
  const [tournamentMatches, setTournamentMatches] = useState<Match[]>([]);
  const [matchHomeName, setMatchHomeName] = useState('');
  const [matchAwayName, setMatchAwayName] = useState('');
  const [matchDateInput, setMatchDateInput] = useState('');

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
      console.log('Tentative de sauvegarde:', newTournaments);
      await AsyncStorage.setItem('tournaments', JSON.stringify(newTournaments));
      console.log('Sauvegarde réussie');
      setTournaments(newTournaments);
      console.log('State mis à jour');
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
      matches: tournamentMatches
    };

    const updated = [...tournaments, newTournament];
    saveTournaments(updated);
    
    setTournamentName('');
    setTournamentMatches([]);
    setShowModal(false);
  };
  
  const addMatchToTournament = () => {
    if (!matchHomeName.trim() || !matchAwayName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer les noms des équipes');
      return;
    }

    const newMatch: Match = {
      id: Date.now(),
      home: { name: matchHomeName.trim(), id: Date.now() },
      away: { name: matchAwayName.trim(), id: Date.now() + 1 },
      date: matchDateInput || new Date().toISOString(),
    };

    setTournamentMatches([...tournamentMatches, newMatch]);
    setMatchHomeName('');
    setMatchAwayName('');
    setMatchDateInput('');
  };
  
  const removeMatchFromTournament = (matchId: number) => {
    setTournamentMatches(tournamentMatches.filter(m => m.id !== matchId));
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
    console.log('Tentative de suppression du tournoi:', id);
    console.log('Tournois actuels:', tournaments);
    
    Alert.alert(
      'Supprimer',
      'Êtes-vous sûr ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            console.log('Confirmation de suppression pour:', id);
            const updated = tournaments.filter(t => t.id !== id);
            console.log('Tournois après filtrage:', updated);
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
        <Text style={styles.title}>PronosApp</Text>
        <Text style={styles.subtitle}>Tournois: {tournaments.length}</Text>
      </View>

      {tournaments.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aucun tournoi</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => {
              setModalMode('tournament');
              setShowModal(true);
            }}
          >
            <Text style={styles.buttonText}>Créer un tournoi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tournaments}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push(`/tournaments/${item.id}` as any)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardDate}>
                    {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                <View style={[styles.status, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  deleteTournament(item.id);
                }}
              >
                <Text style={styles.deleteButtonText}>Supprimer</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.deleteButton, { backgroundColor: '#10B981', marginLeft: 8 }]}
                onPress={(e) => {
                  e.stopPropagation();
                  router.push(`/tournaments/${item.id}/ranking` as any);
                }}
              >
                <Text style={styles.deleteButtonText}>🏆 Classement</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowActionMenu(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalMode === 'tournament' ? 'Nouveau tournoi' : 
               modalMode === 'bettor' ? 'Nouvel utilisateur' : 'Nouveau match'}
            </Text>
            
            {modalMode === 'tournament' && (
              <View>
                <TextInput
                  style={styles.input}
                  value={tournamentName}
                  onChangeText={setTournamentName}
                  placeholder="Nom du tournoi"
                  autoFocus
                />
                
                <Text style={styles.sectionTitle}>Matchs du tournoi</Text>
                
                <View style={styles.matchInputContainer}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 8 }]}
                    value={matchHomeName}
                    onChangeText={setMatchHomeName}
                    placeholder="Équipe domicile"
                  />
                  <Text style={styles.vsText}>vs</Text>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 8 }]}
                    value={matchAwayName}
                    onChangeText={setMatchAwayName}
                    placeholder="Équipe extérieur"
                  />
                </View>
                
                <TextInput
                  style={[styles.input, { marginBottom: 12 }]}
                  value={matchDateInput}
                  onChangeText={setMatchDateInput}
                  placeholder="Date (YYYY-MM-DD)"
                />
                
                <TouchableOpacity
                  style={styles.addMatchButton}
                  onPress={addMatchToTournament}
                >
                  <Text style={styles.addMatchButtonText}>+ Ajouter ce match</Text>
                </TouchableOpacity>
                
                {tournamentMatches.length > 0 && (
                  <View style={styles.matchesList}>
                    <Text style={styles.matchesListTitle}>Matchs ajoutés ({tournamentMatches.length})</Text>
                    {tournamentMatches.map((match, index) => (
                      <View key={match.id} style={styles.matchItem}>
                        <Text style={styles.matchText}>
                          {match.home.name} vs {match.away.name}
                        </Text>
                        <TouchableOpacity
                          style={styles.removeMatchButton}
                          onPress={() => removeMatchFromTournament(match.id!)}
                        >
                          <Text style={styles.removeMatchButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
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
                  setTournamentMatches([]);
                  setMatchHomeName('');
                  setMatchAwayName('');
                  setMatchDateInput('');
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
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
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#6B7280',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 20,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  status: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EF4444',
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: 'white',
    fontSize: 24,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 12,
  },
  matchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vsText: {
    fontSize: 16,
    color: '#6B7280',
    marginHorizontal: 12,
    fontWeight: 'bold',
  },
  addMatchButton: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addMatchButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  matchesList: {
    marginTop: 16,
  },
  matchesListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  matchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  matchText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  removeMatchButton: {
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMatchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

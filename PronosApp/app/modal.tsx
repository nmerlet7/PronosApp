import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Tournament, Team, Pronostiqueur, Match, PronosticWinner, MatchScore } from '@/types';
import { StorageService } from '@/utils/storage';
import { v4 as uuidv4 } from 'uuid';
import { Picker } from '@react-native-picker/picker';

export default function ModalScreen() {
  const { tournament, pronostiqueur, match, team, pronostic } = useLocalSearchParams();
  const [modalType, setModalType] = useState<'tournament' | 'pronostiqueur' | 'match' | 'team' | 'pronostic' | null>(null);

  const [tournamentName, setTournamentName] = useState('');
  const [pronostiqueurName, setPronostiqueurName] = useState('');
  const [pronostiqueurPhoto, setPronostiqueurPhoto] = useState('');

  const [matchName, setMatchName] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [currentTournamentId, setCurrentTournamentId] = useState('');

  // Team management
  const [teamName, setTeamName] = useState('');
  const [teamImage, setTeamImage] = useState('');

  // Pronostic management
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [selectedPronostiqueurId, setSelectedPronostiqueurId] = useState('');
  const [winner, setWinner] = useState<'home' | 'away' | 'draw'>('home');
  const [halftimeScore, setHalftimeScore] = useState({ homeTeam: '', awayTeam: '' });
  const [finalScore, setFinalScore] = useState({ homeTeam: '', awayTeam: '' });
  const [availableMatches, setAvailableMatches] = useState<Match[]>([]);
  const [availablePronostiqueurs, setAvailablePronostiqueurs] = useState<Pronostiqueur[]>([]);

  useEffect(() => {
    if (tournament === 'new') {
      setModalType('tournament');
    } else if (pronostiqueur === 'new') {
      setModalType('pronostiqueur');
      loadCurrentTournament();
    } else if (match === 'new') {
      setModalType('match');
      loadCurrentTournament();
      loadTeams();
    } else if (team === 'new') {
      setModalType('team');
    } else if (pronostic === 'new') {
      setModalType('pronostic');
      loadCurrentTournament();
      loadPronosticData();
    }
  }, [tournament, pronostiqueur, match, team, pronostic]);

  const loadCurrentTournament = async () => {
    const tournamentId = await StorageService.getCurrentTournament();
    setCurrentTournamentId(tournamentId || '');
  };

  const loadTeams = async () => {
    const teamsData = await StorageService.getTeams();
    setTeams(teamsData);
  };

  const loadPronosticData = async () => {
    try {
      const tournamentId = await StorageService.getCurrentTournament();
      if (tournamentId) {
        const [matchesData, pronostiqueursData] = await Promise.all([
          StorageService.getMatches(tournamentId),
          StorageService.getPronostiqueurs(),
        ]);
        
        // Filtrer les matchs qui n'ont pas encore commencé ou sont en cours
        const availableMatches = matchesData.filter(m => m.status !== 'finished');
        setAvailableMatches(availableMatches);
        setAvailablePronostiqueurs(pronostiqueursData);
      }
    } catch (error) {
      console.error('Error loading pronostic data:', error);
    }
  };

  const handleSaveTournament = async () => {
    if (!tournamentName.trim()) {
      Alert.alert('Erreur', 'Le nom du tournoi est requis');
      return;
    }

    try {
      const tournaments = await StorageService.getTournaments();
      const newTournament: Tournament = {
        id: uuidv4(),
        name: tournamentName.trim(),
        status: 'upcoming',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      tournaments.push(newTournament);
      await StorageService.saveTournaments(tournaments);
      
      Alert.alert('Succès', 'Tournoi créé avec succès');
      router.dismiss();
    } catch (error) {
      console.error('Error saving tournament:', error);
      Alert.alert('Erreur', 'Impossible de créer le tournoi');
    }
  };

  const handleSavePronostiqueur = async () => {
    if (!pronostiqueurName.trim()) {
      Alert.alert('Erreur', 'Le nom du pronostiqueur est requis');
      return;
    }

    try {
      const pronostiqueurs = await StorageService.getPronostiqueurs();
      const newPronostiqueur: Pronostiqueur = {
        id: uuidv4(),
        name: pronostiqueurName.trim(),
        photo: pronostiqueurPhoto.trim() || undefined,
      };

      pronostiqueurs.push(newPronostiqueur);
      await StorageService.savePronostiqueurs(pronostiqueurs);
      
      Alert.alert('Succès', 'Pronostiqueur ajouté avec succès');
      router.dismiss();
    } catch (error) {
      console.error('Error saving pronostiqueur:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le pronostiqueur');
    }
  };

  const handleSaveMatch = async () => {
    if (!homeTeamId || !awayTeamId || homeTeamId === awayTeamId) {
      Alert.alert('Erreur', 'Veuillez sélectionner deux équipes différentes');
      return;
    }

    if (!currentTournamentId) {
      Alert.alert('Erreur', 'Aucun tournoi sélectionné');
      return;
    }

    try {
      const matches = await StorageService.getMatches(currentTournamentId);
      const homeTeam = teams.find(t => t.id === homeTeamId);
      const awayTeam = teams.find(t => t.id === awayTeamId);

      if (!homeTeam || !awayTeam) {
        Alert.alert('Erreur', 'Équipes non trouvées');
        return;
      }

      const newMatch: Match = {
        id: uuidv4(),
        name: matchName.trim() || undefined,
        homeTeam,
        awayTeam,
        tournamentId: currentTournamentId,
        status: 'upcoming',
      };

      matches.push(newMatch);
      await StorageService.saveMatches(matches);
      
      Alert.alert('Succès', 'Match créé avec succès');
      router.dismiss();
    } catch (error) {
      console.error('Error saving match:', error);
      Alert.alert('Erreur', 'Impossible de créer le match');
    }
  };

  const handleSaveTeam = async () => {
    if (!teamName.trim()) {
      Alert.alert('Erreur', 'Le nom de l\'équipe est requis');
      return;
    }

    try {
      const teams = await StorageService.getTeams();
      const newTeam: Team = {
        id: uuidv4(),
        name: teamName.trim(),
        image: teamImage.trim() || undefined,
      };

      teams.push(newTeam);
      await StorageService.saveTeams(teams);
      
      Alert.alert('Succès', 'Équipe créée avec succès');
      router.dismiss();
    } catch (error) {
      console.error('Error saving team:', error);
      Alert.alert('Erreur', 'Impossible de créer l\'équipe');
    }
  };

  const handleSavePronostic = async () => {
    if (!selectedMatchId || !selectedPronostiqueurId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un match et un pronostiqueur');
      return;
    }

    try {
      const pronostics = await StorageService.getPronostics();
      
      // Vérifier si un pronostic existe déjà pour ce match/pronostiqueur
      const existingPronostic = pronostics.find(
        p => p.matchId === selectedMatchId && p.pronostiqueurId === selectedPronostiqueurId
      );
      
      if (existingPronostic) {
        Alert.alert('Erreur', 'Un pronostic existe déjà pour ce match');
        return;
      }

      const newPronostic = {
        id: uuidv4(),
        pronostiqueurId: selectedPronostiqueurId,
        matchId: selectedMatchId,
        winner,
        halftimeScore: halftimeScore.homeTeam && halftimeScore.awayTeam ? {
          homeTeam: parseInt(halftimeScore.homeTeam),
          awayTeam: parseInt(halftimeScore.awayTeam),
        } : undefined,
        finalScore: finalScore.homeTeam && finalScore.awayTeam ? {
          homeTeam: parseInt(finalScore.homeTeam),
          awayTeam: parseInt(finalScore.awayTeam),
        } : undefined,
      };

      pronostics.push(newPronostic);
      await StorageService.savePronostics(pronostics);
      
      Alert.alert('Succès', 'Pronostic ajouté avec succès');
      router.dismiss();
    } catch (error) {
      console.error('Error saving pronostic:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le pronostic');
    }
  };

  const renderTournamentForm = () => (
    <View style={styles.form}>
      <Text style={styles.title}>Créer un tournoi</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nom du tournoi *</Text>
        <TextInput
          style={styles.input}
          value={tournamentName}
          onChangeText={setTournamentName}
          placeholder="Ex: Coupe du Monde 2024"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.dismiss()}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveTournament}>
          <Text style={styles.saveButtonText}>Créer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPronostiqueurForm = () => (
    <View style={styles.form}>
      <Text style={styles.title}>Ajouter un pronostiqueur</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nom *</Text>
        <TextInput
          style={styles.input}
          value={pronostiqueurName}
          onChangeText={setPronostiqueurName}
          placeholder="Ex: Jean Dupont"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Photo (URL)</Text>
        <TextInput
          style={styles.input}
          value={pronostiqueurPhoto}
          onChangeText={setPronostiqueurPhoto}
          placeholder="https://example.com/photo.jpg"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.dismiss()}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSavePronostiqueur}>
          <Text style={styles.saveButtonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMatchForm = () => (
    <ScrollView style={styles.form}>
      <Text style={styles.title}>Créer un match</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nom du match (optionnel)</Text>
        <TextInput
          style={styles.input}
          value={matchName}
          onChangeText={setMatchName}
          placeholder="Ex: Finale - 1ère journée"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Équipe à domicile *</Text>
        <Picker
          selectedValue={homeTeamId}
          onValueChange={setHomeTeamId}
          style={styles.picker}
        >
          <Picker.Item label="Sélectionner une équipe" value="" />
          {teams.map(team => (
            <Picker.Item key={team.id} label={team.name} value={team.id} />
          ))}
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Équipe à l'extérieur *</Text>
        <Picker
          selectedValue={awayTeamId}
          onValueChange={setAwayTeamId}
          style={styles.picker}
        >
          <Picker.Item label="Sélectionner une équipe" value="" />
          {teams.map(team => (
            <Picker.Item key={team.id} label={team.name} value={team.id} />
          ))}
        </Picker>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.dismiss()}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveMatch}>
          <Text style={styles.saveButtonText}>Créer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderTeamForm = () => (
    <ScrollView style={styles.form}>
      <Text style={styles.title}>Ajouter une équipe</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nom de l'équipe *</Text>
        <TextInput
          style={styles.input}
          value={teamName}
          onChangeText={setTeamName}
          placeholder="Ex: France"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Image (URL)</Text>
        <TextInput
          style={styles.input}
          value={teamImage}
          onChangeText={setTeamImage}
          placeholder="URL de l'image (optionnel)"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.dismiss()}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveTeam}>
          <Text style={styles.saveButtonText}>Créer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderPronosticForm = () => (
    <ScrollView style={styles.form}>
      <Text style={styles.title}>Ajouter un pronostic</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Match *</Text>
        {availableMatches.length === 0 ? (
          <View style={styles.noMatchesContainer}>
            <Ionicons name="information-circle-outline" size={24} color="#9CA3AF" />
            <Text style={styles.noMatchesText}>
              Aucun match disponible pour les pronostics. Tous les matchs sont terminés.
            </Text>
          </View>
        ) : (
          <Picker
            selectedValue={selectedMatchId}
            onValueChange={setSelectedMatchId}
            style={styles.picker}
          >
            <Picker.Item label="Sélectionner un match" value="" />
            {availableMatches.map(match => (
              <Picker.Item key={match.id} label={`${match.homeTeam.name} vs ${match.awayTeam.name}`} value={match.id} />
            ))}
          </Picker>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pronostiqueur *</Text>
        <Picker
          selectedValue={selectedPronostiqueurId}
          onValueChange={setSelectedPronostiqueurId}
          style={styles.picker}
        >
          <Picker.Item label="Sélectionner un pronostiqueur" value="" />
          {availablePronostiqueurs.map(pronostiqueur => (
            <Picker.Item key={pronostiqueur.id} label={pronostiqueur.name} value={pronostiqueur.id} />
          ))}
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vainqueur *</Text>
        <Picker
          selectedValue={winner}
          onValueChange={(value: 'home' | 'away' | 'draw') => setWinner(value)}
          style={styles.picker}
        >
          <Picker.Item label="Équipe à domicile" value="home" />
          <Picker.Item label="Match nul" value="draw" />
          <Picker.Item label="Équipe à l'extérieur" value="away" />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Score mi-temps (optionnel)</Text>
        <View style={styles.scoreInputContainer}>
          <TextInput
            style={[styles.input, styles.scoreInput]}
            value={halftimeScore.homeTeam}
            onChangeText={(text) => setHalftimeScore(prev => ({ ...prev, homeTeam: text }))}
            placeholder="0"
            keyboardType="numeric"
          />
          <Text style={styles.scoreSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.scoreInput]}
            value={halftimeScore.awayTeam}
            onChangeText={(text) => setHalftimeScore(prev => ({ ...prev, awayTeam: text }))}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Score final (optionnel)</Text>
        <View style={styles.scoreInputContainer}>
          <TextInput
            style={[styles.input, styles.scoreInput]}
            value={finalScore.homeTeam}
            onChangeText={(text) => setFinalScore(prev => ({ ...prev, homeTeam: text }))}
            placeholder="0"
            keyboardType="numeric"
          />
          <Text style={styles.scoreSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.scoreInput]}
            value={finalScore.awayTeam}
            onChangeText={(text) => setFinalScore(prev => ({ ...prev, awayTeam: text }))}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.dismiss()}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSavePronostic}>
          <Text style={styles.saveButtonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  if (!modalType) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.dismiss()}>
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {modalType === 'tournament' && renderTournamentForm()}
      {modalType === 'pronostiqueur' && renderPronostiqueurForm()}
      {modalType === 'match' && renderMatchForm()}
      {modalType === 'team' && renderTeamForm()}
      {modalType === 'pronostic' && renderPronosticForm()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginLeft: 12,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  scoreInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreInput: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  scoreSeparator: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginHorizontal: 8,
  },
  noMatchesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  noMatchesText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    textAlign: 'center',
  },
});

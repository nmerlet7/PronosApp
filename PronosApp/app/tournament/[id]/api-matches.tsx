import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ApiLeague, ApiFixture, apiFootballService, setApiKey } from '@/utils/api-football';
import { StorageService } from '@/utils/storage';

interface ApiMatchesScreenProps {
  tournamentId: string;
}

export default function ApiMatchesScreen({ tournamentId }: ApiMatchesScreenProps) {
  const [apiKey, setApiKeyState] = useState('');
  const [leagues, setLeagues] = useState<ApiLeague[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<ApiLeague | null>(null);
  const [fixtures, setFixtures] = useState<ApiFixture[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'config' | 'leagues' | 'fixtures'>('config');

  useEffect(() => {
    loadSavedApiKey();
  }, []);

  const loadSavedApiKey = async () => {
    try {
      const savedKey = await StorageService.getApiKey();
      if (savedKey) {
        setApiKeyState(savedKey);
        setApiKey(savedKey);
        setStep('leagues');
        loadLeagues();
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une clé API valide');
      return;
    }

    try {
      await StorageService.saveApiKey(apiKey.trim());
      setApiKey(apiKey.trim());
      setStep('leagues');
      loadLeagues();
      Alert.alert('Succès', 'Clé API enregistrée');
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer la clé API');
    }
  };

  const loadLeagues = async () => {
    setLoading(true);
    try {
      const leaguesData = await apiFootballService.getLeagues();
      // Filtrer les championnats principaux
      const popularLeagues = leaguesData.filter(league => 
        league.type === 'league' && 
        [39, 140, 135, 78, 61, 2].includes(league.id) // Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League
      );
      setLeagues(popularLeagues);
    } catch (error) {
      console.error('Error loading leagues:', error);
      Alert.alert('Erreur', 'Impossible de charger les championnats. Vérifiez votre clé API.');
    } finally {
      setLoading(false);
    }
  };

  const loadFixtures = async (league: ApiLeague) => {
    setLoading(true);
    try {
      const currentSeason = league.seasons.find(s => s.current);
      if (!currentSeason) {
        Alert.alert('Erreur', 'Aucune saison en cours pour ce championnat');
        return;
      }

      const fixturesData = await apiFootballService.getUpcomingFixtures(league.id, currentSeason.year);
      setFixtures(fixturesData);
      setSelectedLeague(league);
      setStep('fixtures');
    } catch (error) {
      console.error('Error loading fixtures:', error);
      Alert.alert('Erreur', 'Impossible de charger les matchs');
    } finally {
      setLoading(false);
    }
  };

  const importFixture = async (fixture: ApiFixture) => {
    try {
      const matches = await StorageService.getMatches(tournamentId);
      const existingMatch = matches.find(m => m.externalId === fixture.fixture.id);
      
      if (existingMatch) {
        Alert.alert('Info', 'Ce match est déjà importé');
        return;
      }

      const newMatch = apiFootballService.convertApiFixtureToMatch(fixture, tournamentId);
      matches.push(newMatch);
      await StorageService.saveMatches(matches);
      
      Alert.alert('Succès', 'Match importé avec succès');
    } catch (error) {
      console.error('Error importing fixture:', error);
      Alert.alert('Erreur', 'Impossible d\'importer le match');
    }
  };

  const importAllFixtures = async () => {
    try {
      const matches = await StorageService.getMatches(tournamentId);
      const newFixtures = fixtures.filter(fixture => 
        !matches.some(m => m.externalId === fixture.fixture.id)
      );

      if (newFixtures.length === 0) {
        Alert.alert('Info', 'Tous les matchs sont déjà importés');
        return;
      }

      const newMatches = newFixtures.map(fixture => 
        apiFootballService.convertApiFixtureToMatch(fixture, tournamentId)
      );
      
      matches.push(...newMatches);
      await StorageService.saveMatches(matches);
      
      Alert.alert('Succès', `${newFixtures.length} matchs importés avec succès`);
    } catch (error) {
      console.error('Error importing fixtures:', error);
      Alert.alert('Erreur', 'Impossible d\'importer les matchs');
    }
  };

  const renderConfigStep = () => (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Configuration API Football</Text>
        <Text style={styles.description}>
          Entrez votre clé API gratuite de api-football.com pour récupérer les matchs réels.
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Clé API *</Text>
          <TextInput
            style={styles.input}
            value={apiKey}
            onChangeText={setApiKeyState}
            placeholder="votre_clé_api_ici"
            multiline
          />
        </View>

        <Text style={styles.helpText}>
          1. Inscrivez-vous sur api-football.com
          2. Obtenez votre clé API gratuite
          3. Copiez-collez votre clé ici
        </Text>

        <TouchableOpacity style={styles.button} onPress={saveApiKey}>
          <Text style={styles.buttonText}>Enregistrer la clé</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderLeaguesStep = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Championnats disponibles</Text>
        <TouchableOpacity onPress={() => setStep('config')}>
          <Ionicons name="settings" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Chargement des championnats...</Text>
        </View>
      ) : (
        <FlatList
          data={leagues}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.leagueCard}
              onPress={() => loadFixtures(item)}
            >
              <Image source={{ uri: item.logo }} style={styles.leagueLogo} />
              <View style={styles.leagueInfo}>
                <Text style={styles.leagueName}>{item.name}</Text>
                <Text style={styles.leagueCountry}>{item.country}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );

  const renderFixturesStep = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setStep('leagues')}>
          <Ionicons name="arrow-back" size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.title}>{selectedLeague?.name}</Text>
        <TouchableOpacity onPress={importAllFixtures}>
          <Ionicons name="download" size={24} color="#10B981" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Chargement des matchs...</Text>
        </View>
      ) : (
        <FlatList
          data={fixtures}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.fixtureCard}
              onPress={() => importFixture(item)}
            >
              <View style={styles.teamsContainer}>
                <View style={styles.team}>
                  <Image source={{ uri: item.teams.home.logo }} style={styles.teamLogo} />
                  <Text style={styles.teamName}>{item.teams.home.name}</Text>
                </View>
                
                <View style={styles.vsContainer}>
                  <Text style={styles.vsText}>VS</Text>
                  <Text style={styles.dateText}>
                    {new Date(item.fixture.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                
                <View style={styles.team}>
                  <Image source={{ uri: item.teams.away.logo }} style={styles.teamLogo} />
                  <Text style={styles.teamName}>{item.teams.away.name}</Text>
                </View>
              </View>
              
              <Ionicons name="add-circle" size={24} color="#10B981" />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.fixture.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );

  if (step === 'config') return renderConfigStep();
  if (step === 'leagues') return renderLeaguesStep();
  return renderFixturesStep();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  form: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  list: {
    padding: 16,
  },
  leagueCard: {
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
  leagueLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  leagueInfo: {
    flex: 1,
  },
  leagueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  leagueCountry: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  fixtureCard: {
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
  teamsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  team: {
    flex: 1,
    alignItems: 'center',
  },
  teamLogo: {
    width: 32,
    height: 32,
    marginBottom: 4,
  },
  teamName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  vsContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  vsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

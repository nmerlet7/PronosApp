import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ApiService, Competition } from '@/utils/api';
import { StorageService } from '@/utils/storage';

interface Team {
  id: string;
  name: string;
  logo: string;
  leagueId: number;
  leagueName: string;
}

interface Section {
  title: string;
  data: Team[];
}

export default function TeamsScreen() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    loadApiKeyAndTeams();
  }, []);

  const loadApiKeyAndTeams = async () => {
    try {
      const storedApiKey = await StorageService.getApiKey();
      if (!storedApiKey) {
        Alert.alert(
          'Clé API requise',
          'Pour accéder aux équipes, vous devez configurer une clé API api-football.com',
          [
            {
              text: 'Annuler',
              style: 'cancel',
            },
            {
              text: 'Configurer',
              onPress: () => configureApiKey(),
            },
          ]
        );
        setLoading(false);
        return;
      }
      setApiKey(storedApiKey);
      ApiService.setApiKey(storedApiKey);
      loadTeams();
    } catch (error) {
      console.error('Error loading API key:', error);
      Alert.alert('Erreur', 'Impossible de charger la clé API');
      setLoading(false);
    }
  };

  const configureApiKey = () => {
    Alert.prompt(
      'Clé API api-football.com',
      'Entrez votre clé API (disponible sur api-football.com)',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Valider',
          onPress: async (value?: string) => {
            if (value && value.trim()) {
              try {
                await StorageService.saveApiKey(value.trim());
                setApiKey(value.trim());
                ApiService.setApiKey(value.trim());
                Alert.alert('Succès', 'Clé API configurée avec succès');
                loadTeams();
              } catch (error) {
                Alert.alert('Erreur', 'Impossible de sauvegarder la clé API');
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const loadTeams = async () => {
    if (!apiKey) return;

    try {
      setLoading(true);
      const competitions = ApiService.getPopularCompetitions();
      const allTeams: Team[] = [];

      for (const competition of competitions) {
        try {
          const matches = await ApiService.getMatchesByCompetition(competition.id);
          const teamsMap = new Map<string, Team>();

          matches.forEach(match => {
            // Ajouter l'équipe domicile
            if (!teamsMap.has(match.teams.home.id.toString())) {
              teamsMap.set(match.teams.home.id.toString(), {
                id: match.teams.home.id.toString(),
                name: match.teams.home.name,
                logo: match.teams.home.logo,
                leagueId: competition.id,
                leagueName: competition.name,
              });
            }

            // Ajouter l'équipe extérieur
            if (!teamsMap.has(match.teams.away.id.toString())) {
              teamsMap.set(match.teams.away.id.toString(), {
                id: match.teams.away.id.toString(),
                name: match.teams.away.name,
                logo: match.teams.away.logo,
                leagueId: competition.id,
                leagueName: competition.name,
              });
            }
          });

          allTeams.push(...Array.from(teamsMap.values()));
        } catch (error) {
          console.warn(`Could not fetch teams for ${competition.name}:`, error);
        }
      }

      // Organiser par championnat
      const teamsByLeague = new Map<string, Team[]>();
      allTeams.forEach(team => {
        if (!teamsByLeague.has(team.leagueName)) {
          teamsByLeague.set(team.leagueName, []);
        }
        teamsByLeague.get(team.leagueName)!.push(team);
      });

      // Trier les équipes dans chaque championnat
      teamsByLeague.forEach(leagueTeams => {
        leagueTeams.sort((a, b) => a.name.localeCompare(b.name));
      });

      // Créer les sections pour SectionList
      const sectionData: Section[] = Array.from(teamsByLeague.entries())
        .map(([leagueName, leagueTeams]) => ({
          title: leagueName,
          data: leagueTeams,
        }))
        .sort((a, b) => a.title.localeCompare(b.title));

      setTeams(allTeams);
      setSections(sectionData);
    } catch (error) {
      console.error('Error loading teams:', error);
      Alert.alert('Erreur', 'Impossible de charger les équipes');
    } finally {
      setLoading(false);
    }
  };

  const renderTeam = ({ item }: { item: Team }) => (
    <TouchableOpacity style={styles.teamCard}>
      <View style={styles.teamLogoContainer}>
        {item.logo ? (
          <Image source={{ uri: item.logo }} style={styles.teamLogo} />
        ) : (
          <View style={styles.teamLogoPlaceholder}>
            <Ionicons name="shield-outline" size={24} color="#9CA3AF" />
          </View>
        )}
      </View>
      <Text style={styles.teamName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.teamCount}>{section.data.length} équipes</Text>
    </View>
  );

  if (!apiKey) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Équipes</Text>
        </View>
        
        <View style={styles.noApiKeyContainer}>
          <Ionicons name="key-outline" size={80} color="#3B82F6" />
          <Text style={styles.noApiKeyTitle}>Configuration requise</Text>
          <Text style={styles.noApiKeyText}>
            Configurez votre clé API api-football.com pour accéder aux équipes
          </Text>
          <TouchableOpacity style={styles.configureButton} onPress={configureApiKey}>
            <Ionicons name="settings-outline" size={24} color="white" />
            <Text style={styles.configureButtonText}>Configurer la clé API</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Équipes</Text>
        <TouchableOpacity onPress={configureApiKey}>
          <Ionicons name="settings-outline" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Chargement des équipes...</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderTeam}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled
        />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 32,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  teamCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  teamLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  teamLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  teamLogoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  noApiKeyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noApiKeyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  noApiKeyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  configureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  configureButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

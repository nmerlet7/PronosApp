import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Match, Team } from '@/types';
import { ApiService } from '@/utils/api';
import { StorageService } from '@/utils/storage';

const { width } = Dimensions.get('window');

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<number | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    loadApiKeyAndMatches();
  }, []);

  useEffect(() => {
    if (apiKey) {
      loadMatches();
    }
  }, [selectedCompetition, apiKey]);

  const loadApiKeyAndMatches = async () => {
    try {
      const storedApiKey = await StorageService.getApiKey();
      if (!storedApiKey) {
        Alert.alert(
          'Clé API requise',
          'Pour accéder aux matchs en direct, vous devez configurer une clé API api-football.com',
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

  const loadMatches = async () => {
    if (!apiKey) return;

    try {
      setLoading(true);
      let apiMatches;

      if (selectedCompetition) {
        apiMatches = await ApiService.getMatchesByCompetition(selectedCompetition);
      } else {
        apiMatches = await ApiService.getThisWeekMatches();
      }

      // Convertir les matchs API en format interne
      const convertedMatches = apiMatches.map(apiMatch => 
        ApiService.convertApiMatchToMatch(apiMatch, 'temp')
      );

      setMatches(convertedMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
      Alert.alert('Erreur', 'Impossible de charger les matchs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMatches();
  };

  const getStatusColor = (status: Match['status']) => {
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

  const getStatusText = (status: Match['status']) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTeam = (team: Team) => (
    <View style={styles.teamContainer}>
      {team.image ? (
        <Image source={{ uri: team.image }} style={styles.teamLogo} />
      ) : (
        <View style={styles.teamLogoPlaceholder}>
          <Ionicons name="shield-outline" size={24} color="#9CA3AF" />
        </View>
      )}
      <Text style={styles.teamName} numberOfLines={1}>
        {team.name}
      </Text>
    </View>
  );

  const renderMatch = ({ item }: { item: Match }) => (
    <TouchableOpacity style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <Text style={styles.matchDate}>
          {item.date ? formatDate(item.date) : 'Date non définie'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.matchContent}>
        {renderTeam(item.homeTeam)}
        
        <View style={styles.scoreContainer}>
          {item.scores?.final ? (
            <View style={styles.score}>
              <Text style={styles.scoreText}>{item.scores.final.homeTeam}</Text>
              <Text style={styles.scoreSeparator}>-</Text>
              <Text style={styles.scoreText}>{item.scores.final.awayTeam}</Text>
            </View>
          ) : (
            <Text style={styles.vsText}>VS</Text>
          )}
          
          {item.scores?.halftime && (
            <Text style={styles.halftimeScore}>
              MT: {item.scores.halftime.homeTeam} - {item.scores.halftime.awayTeam}
            </Text>
          )}
        </View>

        {renderTeam(item.awayTeam)}
      </View>

      {item.name && (
        <Text style={styles.competitionName} numberOfLines={1}>
          {item.name}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderCompetitionFilter = () => {
    const competitions = ApiService.getPopularCompetitions();
    
    return (
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedCompetition === null && styles.filterButtonActive]}
          onPress={() => setSelectedCompetition(null)}
        >
          <Text style={[styles.filterButtonText, selectedCompetition === null && styles.filterButtonTextActive]}>
            Tous
          </Text>
        </TouchableOpacity>
        
        {competitions.slice(0, 4).map(comp => (
          <TouchableOpacity
            key={comp.id}
            style={[styles.filterButton, selectedCompetition === comp.id && styles.filterButtonActive]}
            onPress={() => setSelectedCompetition(comp.id)}
          >
            {comp.logo ? (
              <Image source={{ uri: comp.logo }} style={styles.competitionLogo} />
            ) : (
              <Text style={[styles.filterButtonText, selectedCompetition === comp.id && styles.filterButtonTextActive]}>
                {comp.name}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (!apiKey) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Matchs</Text>
        </View>
        
        <View style={styles.noApiKeyContainer}>
          <Ionicons name="key-outline" size={80} color="#3B82F6" />
          <Text style={styles.noApiKeyTitle}>Configuration requise</Text>
          <Text style={styles.noApiKeyText}>
            Configurez votre clé API api-football.com pour accéder aux matchs en direct
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
        <Text style={styles.title}>Matchs</Text>
        <TouchableOpacity onPress={configureApiKey}>
          <Ionicons name="settings-outline" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {renderCompetitionFilter()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Chargement des matchs...</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatch}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={60} color="#9CA3AF" />
              <Text style={styles.emptyText}>Aucun match trouvé</Text>
              <Text style={styles.emptySubtext}>
                Essayez de sélectionner une autre compétition
              </Text>
            </View>
          }
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  competitionLogo: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
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
  matchCard: {
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
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchDate: {
    fontSize: 12,
    color: '#6B7280',
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
  matchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
  },
  teamLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  teamLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  teamName: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  score: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scoreSeparator: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginHorizontal: 8,
  },
  vsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  halftimeScore: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },
  competitionName: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});

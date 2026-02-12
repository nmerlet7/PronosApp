import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Match, Pronostic, PronosticWinner, Pronostiqueur, MatchScore } from '@/types';
import { StorageService } from '@/utils/storage';
import { PointsCalculator } from '@/utils/points';

export default function MatchDetailScreen() {
  const { id: tournamentId, id: matchId } = useLocalSearchParams();
  const [match, setMatch] = useState<Match | null>(null);
  const [pronostics, setPronostics] = useState<Pronostic[]>([]);
  const [pronostiqueurs, setPronostiqueurs] = useState<Pronostiqueur[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingScore, setEditingScore] = useState(false);

  const [halftimeScore, setHalftimeScore] = useState({ homeTeam: '', awayTeam: '' });
  const [finalScore, setFinalScore] = useState({ homeTeam: '', awayTeam: '' });
  const [penaltiesScore, setPenaltiesScore] = useState({ homeTeam: '', awayTeam: '' });

  useEffect(() => {
    loadData();
  }, [tournamentId, matchId]);

  const loadData = async () => {
    try {
      const [matchesData, pronosticsData, pronostiqueursData] = await Promise.all([
        StorageService.getMatches(tournamentId as string),
        StorageService.getPronostics(),
        StorageService.getPronostiqueurs(),
      ]);

      const matchData = matchesData.find(m => m.id === matchId);
      if (!matchData) {
        Alert.alert('Erreur', 'Match non trouvé');
        router.back();
        return;
      }

      setMatch(matchData);
      
      const matchPronostics = pronosticsData.filter(p => p.matchId === matchId);
      const updatedPronostics = PointsCalculator.updatePronosticPoints(matchPronostics, [matchData]);
      setPronostics(updatedPronostics);
      setPronostiqueurs(pronostiqueursData);

      if (matchData.scores?.halftime) {
        setHalftimeScore({
          homeTeam: matchData.scores.halftime.homeTeam.toString(),
          awayTeam: matchData.scores.halftime.awayTeam.toString(),
        });
      }

      if (matchData.scores?.final) {
        setFinalScore({
          homeTeam: matchData.scores.final.homeTeam.toString(),
          awayTeam: matchData.scores.final.awayTeam.toString(),
        });
      }

      if (matchData.scores?.finalAfterPenalties) {
        setPenaltiesScore({
          homeTeam: matchData.scores.finalAfterPenalties.homeTeam.toString(),
          awayTeam: matchData.scores.finalAfterPenalties.awayTeam.toString(),
        });
      }
    } catch (error) {
      console.error('Error loading match data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données du match');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveScore = async () => {
    if (!match) return;

    try {
      const matches = await StorageService.getMatches(tournamentId as string);
      const matchIndex = matches.findIndex(m => m.id === matchId);
      
      if (matchIndex === -1) {
        Alert.alert('Erreur', 'Match non trouvé');
        return;
      }

      const updatedMatch = { ...matches[matchIndex] };
      updatedMatch.status = 'finished';
      updatedMatch.scores = {};

      if (halftimeScore.homeTeam && halftimeScore.awayTeam) {
        updatedMatch.scores.halftime = {
          homeTeam: parseInt(halftimeScore.homeTeam),
          awayTeam: parseInt(halftimeScore.awayTeam),
        };
      }

      if (finalScore.homeTeam && finalScore.awayTeam) {
        updatedMatch.scores.final = {
          homeTeam: parseInt(finalScore.homeTeam),
          awayTeam: parseInt(finalScore.awayTeam),
        };
      }

      if (penaltiesScore.homeTeam && penaltiesScore.awayTeam) {
        updatedMatch.scores.finalAfterPenalties = {
          homeTeam: parseInt(penaltiesScore.homeTeam),
          awayTeam: parseInt(penaltiesScore.awayTeam),
        };
      }

      // Mettre à jour le statut du match
      if (updatedMatch.scores.final) {
        updatedMatch.status = 'finished';
      }

      matches[matchIndex] = updatedMatch;
      await StorageService.saveMatches(matches);

      setMatch(updatedMatch);
      setEditingScore(false);
      
      const pronosticsData = await StorageService.getPronostics();
      const matchPronostics = pronosticsData.filter(p => p.matchId === matchId);
      const updatedPronostics = PointsCalculator.updatePronosticPoints(matchPronostics, [updatedMatch]);
      setPronostics(updatedPronostics);

      Alert.alert('Succès', 'Score enregistré avec succès');
    } catch (error) {
      console.error('Error saving score:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer le score');
    }
  };

  const getPronostiqueurName = (pronostiqueurId: string) => {
    const pronostiqueur = pronostiqueurs.find(p => p.id === pronostiqueurId);
    return pronostiqueur?.name || 'Inconnu';
  };

  const getWinnerText = (winner: PronosticWinner) => {
    switch (winner) {
      case 'home':
        return match?.homeTeam.name || 'Domicile';
      case 'away':
        return match?.awayTeam.name || 'Extérieur';
      case 'draw':
        return 'Match nul';
      default:
        return winner;
    }
  };

  const renderScoreForm = () => (
    <View style={styles.scoreForm}>
      <Text style={styles.formTitle}>Enregistrer le score</Text>
      
      <View style={styles.scoreInputGroup}>
        <Text style={styles.scoreLabel}>Mi-temps</Text>
        <View style={styles.scoreRow}>
          <TextInput
            style={styles.scoreInput}
            value={halftimeScore.homeTeam}
            onChangeText={(text) => setHalftimeScore(prev => ({ ...prev, homeTeam: text }))}
            placeholder="0"
            keyboardType="numeric"
          />
          <Text style={styles.scoreSeparator}>-</Text>
          <TextInput
            style={styles.scoreInput}
            value={halftimeScore.awayTeam}
            onChangeText={(text) => setHalftimeScore(prev => ({ ...prev, awayTeam: text }))}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.scoreInputGroup}>
        <Text style={styles.scoreLabel}>Score final</Text>
        <View style={styles.scoreRow}>
          <TextInput
            style={styles.scoreInput}
            value={finalScore.homeTeam}
            onChangeText={(text) => setFinalScore(prev => ({ ...prev, homeTeam: text }))}
            placeholder="0"
            keyboardType="numeric"
          />
          <Text style={styles.scoreSeparator}>-</Text>
          <TextInput
            style={styles.scoreInput}
            value={finalScore.awayTeam}
            onChangeText={(text) => setFinalScore(prev => ({ ...prev, awayTeam: text }))}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.scoreInputGroup}>
        <Text style={styles.scoreLabel}>Tirs-au-but (si match nul)</Text>
        <View style={styles.scoreRow}>
          <TextInput
            style={styles.scoreInput}
            value={penaltiesScore.homeTeam}
            onChangeText={(text) => setPenaltiesScore(prev => ({ ...prev, homeTeam: text }))}
            placeholder="0"
            keyboardType="numeric"
          />
          <Text style={styles.scoreSeparator}>-</Text>
          <TextInput
            style={styles.scoreInput}
            value={penaltiesScore.awayTeam}
            onChangeText={(text) => setPenaltiesScore(prev => ({ ...prev, awayTeam: text }))}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.formButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setEditingScore(false)}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveScore}
        >
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPronostic = (pronostic: Pronostic) => (
    <View key={pronostic.id} style={styles.pronosticCard}>
      <View style={styles.pronosticHeader}>
        <Text style={styles.pronostiqueurName}>{getPronostiqueurName(pronostic.pronostiqueurId)}</Text>
        <View style={[styles.pointsBadge, { 
          backgroundColor: (pronostic.points || 0) > 0 ? '#10B981' : 
                           (pronostic.points || 0) < 0 ? '#EF4444' : '#6B7280' 
        }]}>
          <Text style={styles.pointsText}>{pronostic.points || 0} pts</Text>
        </View>
      </View>

      <View style={styles.pronosticDetails}>
        <Text style={styles.pronosticLabel}>Vainqueur: <Text style={styles.pronosticValue}>{getWinnerText(pronostic.winner)}</Text></Text>
        
        {pronostic.halftimeScore && (
          <Text style={styles.pronosticLabel}>
            Mi-temps: <Text style={styles.pronosticValue}>{pronostic.halftimeScore.homeTeam} - {pronostic.halftimeScore.awayTeam}</Text>
          </Text>
        )}
        
        {pronostic.finalScore && (
          <Text style={styles.pronosticLabel}>
            Score final: <Text style={styles.pronosticValue}>{pronostic.finalScore.homeTeam} - {pronostic.finalScore.awayTeam}</Text>
          </Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Chargement...</Text>
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Match non trouvé</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.matchInfo}>
          <Text style={styles.matchTitle}>{match.name || 'Match'}</Text>
          <Text style={styles.teamsText}>{match.homeTeam.name} vs {match.awayTeam.name}</Text>
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Statut: </Text>
            <Text style={[styles.statusValue, { 
              color: match.status === 'upcoming' ? '#10B981' : 
                     match.status === 'in_progress' ? '#F59E0B' : '#6B7280' 
            }]}>
              {match.status === 'upcoming' ? 'À venir' : 
               match.status === 'in_progress' ? 'En cours' : 'Terminé'}
            </Text>
          </View>

          {match.scores?.final && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreDisplay}>
                {match.scores.final.homeTeam} - {match.scores.final.awayTeam}
              </Text>
              {match.scores.halftime && (
                <Text style={styles.halftimeDisplay}>
                  Mi-temps: {match.scores.halftime.homeTeam} - {match.scores.halftime.awayTeam}
                </Text>
              )}
            </View>
          )}

          {match.status !== 'finished' && !editingScore && (
            <TouchableOpacity
              style={styles.editScoreButton}
              onPress={() => setEditingScore(true)}
            >
              <Ionicons name="create" size={16} color="white" />
              <Text style={styles.editScoreButtonText}>Enregistrer le score</Text>
            </TouchableOpacity>
          )}
        </View>

        {editingScore && renderScoreForm()}

        <View style={styles.pronosticsSection}>
          <Text style={styles.sectionTitle}>Pronostics ({pronostics.length})</Text>
          
          {pronostics.length === 0 ? (
            <Text style={styles.noPronostics}>Aucun pronostic pour ce match</Text>
          ) : (
            pronostics.map(renderPronostic)
          )}
        </View>
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
  matchInfo: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  matchTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  teamsText: {
    fontSize: 18,
    color: '#374151',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreDisplay: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  halftimeDisplay: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  editScoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  editScoreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  scoreForm: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreInputGroup: {
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    width: 80,
  },
  scoreSeparator: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginHorizontal: 16,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 8,
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
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  pronosticsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  noPronostics: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  pronosticCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pronosticHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pronostiqueurName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  pointsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  pronosticDetails: {
    gap: 4,
  },
  pronosticLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  pronosticValue: {
    color: '#1F2937',
    fontWeight: '500',
  },
});

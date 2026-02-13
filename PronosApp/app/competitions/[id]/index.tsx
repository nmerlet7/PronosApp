import { useData } from "@/context/DataContext";
import { styles } from "@/styles";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Text, View, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { useState } from "react";
import { Bettor, RankingEntry, PointsBreakdown } from "@/types";

export default function CompetitionRanking() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { competitions, bettors } = useData();
  
  const [selectedBettor, setSelectedBettor] = useState<Bettor | null>(null);
  const [showBettorModal, setShowBettorModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBettorName, setNewBettorName] = useState('');
  
  const competition = competitions.find(c => c.id === parseInt(id));
  
  if (!competition) {
    return (
      <View style={styles.container}>
        <Text>Competition not found</Text>
      </View>
    );
  }

  const calculatePoints = (bettor: Bettor): PointsBreakdown => {
    let breakdown: PointsBreakdown = {
      winnerCorrect: 0,
      halfTimeScoreCorrect: 0,
      fullTimeScoreCorrect: 0,
      halfTimeGoalsPenalty: 0,
      fullTimeGoalsPenalty: 0,
      total: 0
    };

    competition.bets?.forEach(bet => {
      if (bet.bettor.id === bettor.id && bet.match.result) {
        const prediction = bet.result;
        const actual = bet.match.result;

        // Vainqueur correct
        if (prediction.winner?.id === actual.winner?.id) {
          breakdown.winnerCorrect += 1;
        } else if (prediction.winner && actual.winner && prediction.winner.id !== actual.winner.id) {
          breakdown.total -= 1;
        }

        // Score mi-temps correct
        if (prediction.halfTime && actual.halfTime) {
          if (prediction.halfTime.home === actual.halfTime.home && 
              prediction.halfTime.away === actual.halfTime.away) {
            breakdown.halfTimeScoreCorrect += 1;
          } else {
            const predictedGoals = prediction.halfTime.home + prediction.halfTime.away;
            const actualGoals = actual.halfTime.home + actual.halfTime.away;
            if (Math.abs(predictedGoals - actualGoals) >= 3) {
              breakdown.halfTimeGoalsPenalty -= 1;
            }
          }
        }

        // Score final correct
        if (prediction.fullTime && actual.fullTime) {
          if (prediction.fullTime.home === actual.fullTime.home && 
              prediction.fullTime.away === actual.fullTime.away) {
            breakdown.fullTimeScoreCorrect += 2;
          } else {
            const predictedGoals = prediction.fullTime.home + prediction.fullTime.away;
            const actualGoals = actual.fullTime.home + actual.fullTime.away;
            if (Math.abs(predictedGoals - actualGoals) >= 5) {
              breakdown.fullTimeGoalsPenalty -= 1;
            }
          }
        }
      }
    });

    breakdown.total = breakdown.winnerCorrect + 
                     breakdown.halfTimeScoreCorrect + 
                     breakdown.fullTimeScoreCorrect + 
                     breakdown.halfTimeGoalsPenalty + 
                     breakdown.fullTimeGoalsPenalty;

    return breakdown;
  };

  const getRanking = (): RankingEntry[] => {
    const ranking: RankingEntry[] = bettors.map(bettor => {
      const breakdown = calculatePoints(bettor);
      return {
        bettor,
        points: breakdown.total,
        position: 0
      };
    });

    ranking.sort((a, b) => b.points - a.points);
    
    ranking.forEach((entry, index) => {
      entry.position = index + 1;
    });

    return ranking;
  };

  const handleCreateBettor = () => {
    if (!newBettorName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom');
      return;
    }

    const newBettor: Bettor = {
      id: Date.now(),
      name: newBettorName.trim(),
      totalPoints: 0
    };

    // TODO: Add bettor to data context
    console.log('Creating bettor:', newBettor);
    
    setNewBettorName('');
    setShowCreateModal(false);
  };

  const ranking = getRanking();

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>{competition.name}</Text>
      <Text style={styles.h2}>Classement général</Text>
      
      <FlatList
        data={ranking}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.padded, { 
              backgroundColor: 'white', 
              marginVertical: 4, 
              borderRadius: 8,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }]}
            onPress={() => setSelectedBettor(item.bettor)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: item.position === 1 ? '#FFD700' : 
                               item.position === 2 ? '#C0C0C0' : 
                               item.position === 3 ? '#CD7F32' : '#E5E7EB',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12
              }}>
                <Text style={{ 
                  fontWeight: 'bold', 
                  fontSize: 12,
                  color: item.position <= 3 ? 'white' : '#666'
                }}>
                  {item.position}
                </Text>
              </View>
              <View>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.bettor.name}</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>
                  {item.points} point{item.points !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold',
                color: item.points >= 0 ? '#10B981' : '#EF4444'
              }}>
                {item.points > 0 ? '+' : ''}{item.points}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.bettor.id?.toString() || ''}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text>Aucun pronostiqueur pour cette compétition</Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={{
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
        }}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>+</Text>
      </TouchableOpacity>

      {/* Bettor Details Modal */}
      <Modal visible={!!selectedBettor} transparent animationType="slide">
        {selectedBettor && (
          <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '90%', maxWidth: 400 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
                {selectedBettor.name}
              </Text>
              
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Points totaux:</Text>
                <Text style={{ fontSize: 18, textAlign: 'center' }}>
                  {calculatePoints(selectedBettor).total} point{calculatePoints(selectedBettor).total !== 1 ? 's' : ''}
                </Text>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Détail des points:</Text>
                <Text>• Vainqueur correct: {calculatePoints(selectedBettor).winnerCorrect}</Text>
                <Text>• Score mi-temps correct: {calculatePoints(selectedBettor).halfTimeScoreCorrect}</Text>
                <Text>• Score final correct: {calculatePoints(selectedBettor).fullTimeScoreCorrect}</Text>
                <Text>• Pénalités mi-temps: {calculatePoints(selectedBettor).halfTimeGoalsPenalty}</Text>
                <Text>• Pénalités final: {calculatePoints(selectedBettor).fullTimeGoalsPenalty}</Text>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Pronostics ({competition.bets?.filter(b => b.bettor.id === selectedBettor.id).length || 0}):</Text>
                {competition.bets?.filter(b => b.bettor.id === selectedBettor.id).map((bet, index) => (
                  <View key={bet.id || index} style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                    <Text>{bet.match.home.name} vs {bet.match.away.name}</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>
                      Prono: {bet.result.fullTime?.home} - {bet.result.fullTime?.away}
                    </Text>
                    {bet.match.result && (
                      <Text style={{ fontSize: 12, color: '#666' }}>
                        Résultat: {bet.match.result.fullTime?.home} - {bet.match.result.fullTime?.away}
                      </Text>
                    )}
                  </View>
                )) || <Text style={{ color: '#666' }}>Aucun pronostic</Text>}
              </View>

              <TouchableOpacity
                style={{ backgroundColor: '#3B82F6', padding: 12, borderRadius: 8, alignItems: 'center' }}
                onPress={() => setSelectedBettor(null)}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      {/* Create Bettor Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '90%', maxWidth: 320 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
              Nouveau pronostiqueur
            </Text>
            
            <TextInput
              style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20 }}
              value={newBettorName}
              onChangeText={setNewBettorName}
              placeholder="Nom du pronostiqueur"
              autoFocus
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#E5E7EB', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewBettorName('');
                }}
              >
                <Text style={{ color: '#6B7280', fontSize: 16, fontWeight: '600' }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#3B82F6', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}
                onPress={handleCreateBettor}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

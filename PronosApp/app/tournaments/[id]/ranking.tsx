import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { useData } from "@/context/DataContext";
import { styles } from "@/styles";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Text, View, TouchableOpacity } from "react-native";
import { RankingEntry } from "@/types";

interface Tournament {
  id: string;
  name: string;
  status: 'upcoming' | 'in_progress' | 'finished';
  createdAt: string;
  matches?: any[];
}

export default function TournamentRanking() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { bettors } = useData();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournament();
  }, [id]);

  const loadTournament = async () => {
    try {
      const stored = await AsyncStorage.getItem('tournaments');
      if (stored) {
        const tournaments = JSON.parse(stored);
        const foundTournament = tournaments.find((t: Tournament) => t.id === id);
        setTournament(foundTournament || null);
      }
    } catch (error) {
      console.error('Erreur chargement tournoi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculer le classement pour ce tournoi
  const calculateRanking = (): RankingEntry[] => {
    if (!tournament || !tournament.matches) {
      return [];
    }

    const bettorPoints: Record<number, number> = {};
    
    // Initialiser tous les parieurs avec 0 points
    bettors.forEach(bettor => {
      if (bettor.id) {
        bettorPoints[bettor.id] = 0;
      }
    });
    
    // Calculer les points pour chaque pari dans les matchs du tournoi selon le système de l'énoncé
    tournament.matches.forEach(match => {
      if (match.result && match.bets) {
        const actualScore = match.result.fullTime;
        const actualHalfTime = match.result.halfTime;
        const actualWinner = match.result.winner;
        
        match.bets.forEach((bet: any) => {
          if (bet.bettor.id && bet.result.fullTime) {
            const predictedScore = bet.result.fullTime;
            const predictedHalfTime = bet.result.halfTime;
            let points = 0;
            
            // 1. Vainqueur du match correct (après t-a-b) : 1 point
            if (actualWinner && bet.result.winner) {
              if (actualWinner.id === bet.result.winner.id) {
                points += 1; // Vainqueur correct
              } else {
                // Vainqueur incorrect : -1 point (sauf si nul)
                const actualResult = actualScore ? 
                  (actualScore.home > actualScore.away ? 'home' : 
                   actualScore.home < actualScore.away ? 'away' : 'draw') : 'draw';
                const predictedResult = predictedScore ? 
                  (predictedScore.home > predictedScore.away ? 'home' : 
                   predictedScore.home < predictedScore.away ? 'away' : 'draw') : 'draw';
                
                if (actualResult !== 'draw' && predictedResult !== 'draw' && actualResult !== predictedResult) {
                  points -= 1; // Vainqueur incorrect (pas de pénalité pour nul)
                }
              }
            }
            
            // 2. Score à la mi-temps correct : 1 point
            if (actualHalfTime && predictedHalfTime) {
              if (actualHalfTime.home === predictedHalfTime.home && 
                  actualHalfTime.away === predictedHalfTime.away) {
                points += 1; // Mi-temps correcte
              }
            }
            
            // 3. Malus : nombre de buts mi-temps incorrect de +3 buts ou plus : -1 point
            if (actualHalfTime && predictedHalfTime) {
              const actualHalfGoals = actualHalfTime.home + actualHalfTime.away;
              const predictedHalfGoals = predictedHalfTime.home + predictedHalfTime.away;
              const deltaHalf = Math.abs(actualHalfGoals - predictedHalfGoals);
              
              if (deltaHalf >= 3) {
                points -= 1; // Malus mi-temps
              }
            }
            
            // 4. Score final avant t-a-b correct : 2 points
            if (actualScore && predictedScore) {
              if (actualScore.home === predictedScore.home && 
                  actualScore.away === predictedScore.away) {
                points += 2; // Score final exact
              }
            }
            
            // 5. Malus : nombre de buts final incorrect de +5 buts ou plus : -1 point
            if (actualScore && predictedScore) {
              const actualGoals = actualScore.home + actualScore.away;
              const predictedGoals = predictedScore.home + predictedScore.away;
              const delta = Math.abs(actualGoals - predictedGoals);
              
              if (delta >= 5) {
                points -= 1; // Malus final
              }
            }
            
            bettorPoints[bet.bettor.id] = (bettorPoints[bet.bettor.id] || 0) + points;
          }
        });
      }
    });
    
    // Convertir en tableau et trier
    const ranking: RankingEntry[] = Object.entries(bettorPoints)
      .map(([bettorId, points], index) => {
        const bettor = bettors.find(b => b.id === parseInt(bettorId));
        return {
          bettor: bettor || { id: parseInt(bettorId), name: 'Inconnu' },
          points,
          position: 0 // Sera mis à jour après le tri
        };
      })
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({ ...entry, position: index + 1 }));
    
    return ranking;
  };

  const ranking = calculateRanking();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.h3}>Chargement...</Text>
      </View>
    );
  }

  if (!tournament) {
    return (
      <View style={styles.container}>
        <Text style={styles.h3}>Tournoi non trouvé</Text>
        <TouchableOpacity 
          style={[styles.padded, { backgroundColor: '#3B82F6', borderRadius: 8, marginTop: 20 }]}
          onPress={() => router.back()}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>🏆 Classement</Text>
      <Text style={styles.h2}>{tournament.name}</Text>
      <Text style={styles.h3}>
        {tournament.status === 'upcoming' ? 'À venir' : 
         tournament.status === 'in_progress' ? 'En cours' : 'Terminé'}
      </Text>
      <Text style={styles.h3}>{ranking.length} parieurs</Text>
      
      {ranking.length === 0 ? (
        <View style={styles.padded}>
          <Text style={styles.h3}>Aucun pari enregistré</Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={ranking}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.padded, 
                { 
                  backgroundColor: 'white', 
                  marginVertical: 4, 
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }
              ]}
              onPress={() => {
                if (item.bettor.id) {
                  router.push(`/bettors/${item.bettor.id.toString()}` as any);
                }
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                    fontSize: 14,
                    color: item.position <= 3 ? 'white' : '#6B7280'
                  }}>
                    {item.position}
                  </Text>
                </View>
                <View>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                    {item.bettor.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>
                    {item.points} points
                  </Text>
                </View>
              </View>
              
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ 
                  fontSize: 20, 
                  fontWeight: 'bold',
                  color: item.position === 1 ? '#FFD700' : 
                         item.position === 2 ? '#6B7280' : 
                         item.position === 3 ? '#CD7F32' : '#1F2937'
                }}>
                  {item.points}
                </Text>
                <Text style={{ fontSize: 10, color: '#6B7280' }}>
                  pts
                </Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.bettor.id?.toString() || item.position.toString()}
        />
      )}
      
      <TouchableOpacity 
        style={[styles.padded, { backgroundColor: '#6B7280', borderRadius: 8, margin: 16 }]}
        onPress={() => router.back()}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Retour</Text>
      </TouchableOpacity>
    </View>
  );
}

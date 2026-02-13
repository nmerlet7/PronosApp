import { useData } from "@/context/DataContext";
import { styles } from "@/styles";
import { useLocalSearchParams } from "expo-router";
import { FlatList, Text, View } from "react-native";
import { Bet } from "@/types";

export default function BettorDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bettors, competitions } = useData();
  
  const bettor = bettors.find(b => b.id === parseInt(id));
  
  if (!bettor) {
    return (
      <View style={styles.container}>
        <Text>Bettor not found</Text>
      </View>
    );
  }

  // Récupérer tous les paris de ce bettor
  const bettorBets: (Bet & { competitionName: string })[] = [];
  competitions.forEach(competition => {
    competition.bets?.forEach(bet => {
      if (bet.bettor.id === bettor.id) {
        bettorBets.push({
          ...bet,
          competitionName: competition.name
        });
      }
    });
    competition.matches.forEach(match => {
      match.bets?.forEach(bet => {
        if (bet.bettor.id === bettor.id) {
          bettorBets.push({
            ...bet,
            competitionName: competition.name
          });
        }
      });
    });
  });

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>{bettor.name}</Text>
      <Text style={styles.h2}>Paris ({bettorBets.length})</Text>
      
      {bettorBets.length === 0 ? (
        <Text style={styles.h3}>Aucun pari trouvé</Text>
      ) : (
        <FlatList
          data={bettorBets}
          renderItem={({ item }) => (
            <View style={[styles.padded, { backgroundColor: 'white', marginVertical: 4, borderRadius: 8 }]}>
              <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
                {item.competitionName}
              </Text>
              <Text style={{ marginBottom: 4 }}>
                {item.match.home.name} vs {item.match.away.name}
              </Text>
              <Text style={{ fontSize: 14, color: '#666' }}>
                Prono: {item.result.fullTime?.home} - {item.result.fullTime?.away}
              </Text>
              {item.match.result && (
                <Text style={{ fontSize: 12, color: '#10B981' }}>
                  Résultat: {item.match.result.fullTime?.home} - {item.match.result.fullTime?.away}
                </Text>
              )}
              <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
                Points: {item.points || 0}
              </Text>
            </View>
          )}
          keyExtractor={(item) => item.id?.toString() || ''}
        />
      )}
    </View>
  );
}
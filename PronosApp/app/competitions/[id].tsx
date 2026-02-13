import { useData } from "@/context/DataContext";
import { styles } from "@/styles";
import { useLocalSearchParams } from "expo-router";
import { FlatList, Text, View } from "react-native";

export default function CompetitionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { competitions } = useData();
  
  const competition = competitions.find(c => c.id === parseInt(id));
  
  if (!competition) {
    return (
      <View style={styles.container}>
        <Text>Competition not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>{competition.name}</Text>
      
      <Text style={styles.h2}>Teams</Text>
      <FlatList
        data={competition.teams}
        renderItem={({ item }) => (
          <View style={styles.padded}>
            <Text>{item.name}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id?.toString() || ''}
      />
      
      <Text style={styles.h2}>Matches</Text>
      <FlatList
        data={competition.matches}
        renderItem={({ item }) => (
          <View style={styles.padded}>
            <Text>{item.home.name} vs {item.away.name}</Text>
            <Text>Date: {item.date?.toString()}</Text>
            {item.result && (
              <Text>Result: {item.result.fullTime?.home} - {item.result.fullTime?.away}</Text>
            )}
          </View>
        )}
        keyExtractor={(item) => item.id?.toString() || ''}
      />
    </View>
  );
}

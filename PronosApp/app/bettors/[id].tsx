import { useData } from "@/context/DataContext";
import { styles } from "@/styles";
import { useLocalSearchParams } from "expo-router";
import { FlatList, Text, View } from "react-native";

export default function BettorDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bettors } = useData();
  
  const bettor = bettors.find(b => b.id === parseInt(id));
  
  if (!bettor) {
    return (
      <View style={styles.container}>
        <Text>Bettor not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>{bettor.name}</Text>
      <Text style={styles.h2}>Bets</Text>
      <Text style={styles.h3}>No bets available yet</Text>
    </View>
  );
}

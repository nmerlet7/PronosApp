import { useData } from "@/context/DataContext";
import { styles } from "@/styles";
import { useRouter } from "expo-router";
import { Button, FlatList, Text, View } from "react-native";

export default function Competitions() {
  const router = useRouter();
  const { competitions } = useData();
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>PronosApp</Text>
      <Text style={styles.h2}>Tournois: {competitions.length}</Text>
      
      {competitions.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text>Aucune compétition</Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={competitions}
          renderItem={({ item }) => (
            <View style={styles.padded}>
              <Button
                title={item.name}
                onPress={() => {
                  if (item.id) {
                    router.push(`/competitions/${item.id}`);
                    console.log("go to " + item.name);
                  }
                }}
              />
            </View>
          )}
          keyExtractor={(item) => item.id?.toString() || ''}
        />
      )}
    </View>
  );
}

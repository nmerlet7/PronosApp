import { useData } from "@/context/DataContext";
import { styles } from "@/styles";
import { useRouter } from "expo-router";
import { Button, FlatList, Text, View, TouchableOpacity } from "react-native";

export default function CompetitionsPage() {
  const router = useRouter();
  const { competitions } = useData();
  
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Compétitions</Text>
      <Text style={styles.h2}>Championnats: {competitions.length}</Text>
      
      {competitions.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text>Aucune compétition</Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={competitions}
          renderItem={({ item }) => (
            <View style={[styles.padded, { backgroundColor: 'white', marginVertical: 4, borderRadius: 8 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3B82F6' }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    {item.teams.length} équipes • {item.matches.length} matchs
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#10B981',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6
                    }}
                    onPress={() => {
                      if (item.id) {
                        router.push(`/competitions/ranking/${item.id}`);
                      }
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                      🏆 Classement
                    </Text>
                  </TouchableOpacity>
                  <Button
                    title="Détails"
                    onPress={() => {
                      if (item.id) {
                        router.push(`/competitions/${item.id}`);
                      }
                    }}
                  />
                </View>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id?.toString() || ''}
        />
      )}
    </View>
  );
}
import { useData } from "@/context/DataContext";
import { styles } from "@/styles";
import { useRouter } from "expo-router";
import { FlatList, Text, View, TouchableOpacity } from "react-native";

export default function CompetitionsList() {
  const router = useRouter();
  const { competitions } = useData();
  
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Compétitions</Text>
      
      {competitions.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text>Aucune compétition trouvée</Text>
        </View>
      ) : (
        <FlatList
          data={competitions}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.padded, { backgroundColor: 'white', marginVertical: 4, borderRadius: 8 }]}
              onPress={() => router.push(`/competitions/${item.id}`)}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3B82F6' }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    {item.teams.length} équipes • {item.matches.length} matchs
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#10B981',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6
                  }}
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push(`/competitions/ranking/${item.id}`);
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                    🏆 Classement
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id?.toString() || ''}
        />
      )}
    </View>
  );
}
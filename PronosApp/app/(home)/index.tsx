import { useData } from "@/context/DataContext";
import { styles } from "@/styles";
import { useRouter } from "expo-router";
import { Button, FlatList, Text, View } from "react-native";

export default function Competitions() {
  const router = useRouter();
  const { competitions } = useData();
  return (
    <View style={styles.container}>
      {competitions.length === 0 && <Text>No competitions found!</Text>}
      <FlatList
        style={styles.list}
        data={competitions}
        renderItem={({ item }) => {
          console.log("rendering button for " + item.name);
          return (
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
          );
        }}
      />
    </View>
  );
}

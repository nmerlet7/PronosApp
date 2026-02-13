import { useData } from "@/context/DataContext";
import { styles } from "@/styles";
import { useRouter } from "expo-router";
import { Button, FlatList, Text, View } from "react-native";

export default function BettorsPage() {
  const router = useRouter();
  const { bettors } = useData();
  return (
    <View style={styles.container}>
      {bettors.length === 0 && <Text>No bettors found!</Text>}
      <FlatList
        style={styles.list}
        data={bettors}
        renderItem={({ item }) => {
          console.log("rendering button for " + item.name);
          return (
            <View style={styles.padded}>
              <Button
                title={item.name}
                onPress={() => {
                  if (item.id) {
                    router.push(`/bettors/${item.id.toString()}` as any);
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

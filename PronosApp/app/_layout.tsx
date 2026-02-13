import { DataProvider } from "@/context/DataContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <DataProvider>
      <Stack>
        <Stack.Screen name="(home)" options={{ headerShown: false }} />
        <Stack.Screen
          name="competitions/[id]"
          options={{ headerShown: true, title: "Competition" }}
        />
        <Stack.Screen
          name="bettors/[id]"
          options={{ headerShown: true, title: "Bettor" }}
        />
      </Stack>
    </DataProvider>
  );
}

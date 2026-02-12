import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '@/utils/storage';
import { router } from 'expo-router';

export default function TournamentLayout() {
  const handleBack = async () => {
    await StorageService.setCurrentTournament('');
    router.replace('/');
  };

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          title: 'Tournoi',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={{ marginLeft: 16 }}>
              <Ionicons name="arrow-back" size={24} color="#3B82F6" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="ranking"
        options={{
          title: 'Classement',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="matches"
        options={{
          title: 'Matchs',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="match/[id]"
        options={{
          title: 'Détails du match',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="pronostiqueur/[id]"
        options={{
          title: 'Détails du pronostiqueur',
          headerShown: true,
        }}
      />
    </Stack>
  );
}

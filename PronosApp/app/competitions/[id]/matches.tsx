import { useData } from "@/context/DataContext";
import { styles } from "@/styles";
import { useLocalSearchParams, useGlobalSearchParams, useRouter } from "expo-router";
import { FlatList, Text, View, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from "react-native";
import { useState } from "react";
import { Match, Team, Result, Score } from "@/types";

export default function CompetitionMatches() {
  const { id: localId } = useLocalSearchParams<{ id: string }>();
  const globalParams = useGlobalSearchParams();
  const id = localId || globalParams.id as string;
  
  console.log('[MATCHES] Local ID:', localId);
  console.log('[MATCHES] Global ID:', globalParams.id);
  console.log('[MATCHES] Final ID:', id);
  const router = useRouter();
  const { competitions } = useData();
  
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMatch, setNewMatch] = useState({
    name: '',
    homeTeamId: '',
    awayTeamId: '',
    date: ''
  });

  const updateNewMatch = (field: string, value: string) => {
    setNewMatch(prev => ({ ...prev, [field]: value }));
  };
  
  const competition = competitions.find(c => c.id === parseInt(id));
  
  console.log('ID from params:', id);
  console.log('Parsed ID:', parseInt(id));
  console.log('Available competitions:', competitions.map(c => ({ id: c.id, name: c.name })));
  console.log('Competition found:', competition?.name);
  console.log('Matches count:', competition?.matches.length);
  console.log('Matches:', competition?.matches);
  
  if (!competition) {
    return (
      <View style={styles.container}>
        <Text>Competition not found</Text>
      </View>
    );
  }

  const handleMatchPress = (match: Match) => {
    console.log('Match clicked:', match);
    console.log('Has result:', !!match.result);
    console.log('Match status:', getMatchStatus(match));
    console.log('Should show bet button?', !match.result);
    setSelectedMatch(match);
  };

  const handleCreateMatch = () => {
    if (!newMatch.homeTeamId || !newMatch.awayTeamId) {
      Alert.alert('Erreur', 'Veuillez sélectionner deux équipes');
      return;
    }

    const homeTeam = competition.teams.find(t => t.id === parseInt(newMatch.homeTeamId));
    const awayTeam = competition.teams.find(t => t.id === parseInt(newMatch.awayTeamId));
    
    if (!homeTeam || !awayTeam) {
      Alert.alert('Erreur', 'Équipes non trouvées');
      return;
    }

    // Ajouter le match à la compétition
    const newMatchObj = {
      id: Date.now(),
      home: homeTeam,
      away: awayTeam,
      date: newMatch.date || new Date().toISOString(),
      name: newMatch.name
    };
    
    competition.matches.push(newMatchObj);
    console.log('Match created and added:', newMatchObj);
    
    setNewMatch({ name: '', homeTeamId: '', awayTeamId: '', date: '' });
    setShowCreateModal(false);
  };

  const getMatchStatus = (match: Match) => {
    if (!match.result) return 'À venir';
    return 'Terminé';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'À venir': return '#10B981';
      case 'Terminé': return '#6B7280';
      default: return '#6B7280';
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <Text style={[styles.h1, { padding: 16, backgroundColor: 'white', marginBottom: 8 }]}>{competition.name}</Text>
      
      <FlatList
        data={competition.matches}
        style={{ flex: 1, paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.padded, { backgroundColor: 'white', marginVertical: 4, borderRadius: 8 }]}
            onPress={() => handleMatchPress(item)}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                {item.name && <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>{item.name}</Text>}
                <Text>{item.home.name} vs {item.away.name}</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>
                  {item.date ? new Date(item.date).toLocaleDateString('fr-FR') : 'Date non définie'}
                </Text>
                {item.result && (
                  <Text style={{ fontSize: 12, color: '#666' }}>
                    Score: {item.result.fullTime?.home} - {item.result.fullTime?.away}
                  </Text>
                )}
              </View>
              <View style={[{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }, { backgroundColor: getStatusColor(getMatchStatus(item)) }]}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                  {getMatchStatus(item)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id?.toString() || ''}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text>Aucun match pour cette compétition</Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#3B82F6',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>+</Text>
      </TouchableOpacity>

      {/* Match Details Modal */}
      <Modal visible={!!selectedMatch} transparent animationType="slide">
        {selectedMatch && (
          <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '90%', maxWidth: 400 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
                {selectedMatch.name || 'Match'}
              </Text>
              
              <Text style={{ fontSize: 16, marginBottom: 8, textAlign: 'center' }}>
                {selectedMatch.home.name} vs {selectedMatch.away.name}
              </Text>
              
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 16, textAlign: 'center' }}>
                {selectedMatch.date ? new Date(selectedMatch.date).toLocaleDateString('fr-FR') : 'Date non définie'}
              </Text>

              {selectedMatch.result ? (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Résultat:</Text>
                  <Text>Score final: {selectedMatch.result.fullTime?.home} - {selectedMatch.result.fullTime?.away}</Text>
                  {selectedMatch.result.halfTime && (
                    <Text>Score mi-temps: {selectedMatch.result.halfTime.home} - {selectedMatch.result.halfTime.away}</Text>
                  )}
                </View>
              ) : (
                <Text style={{ color: '#666', marginBottom: 16 }}>Match non terminé</Text>
              )}

              <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Pronostics ({selectedMatch.bets?.length || 0}):</Text>
              <ScrollView style={{ maxHeight: 150, marginBottom: 16 }}>
                {selectedMatch.bets?.map((bet, index) => (
                  <View key={bet.id || index} style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                    <Text style={{ fontWeight: 'bold' }}>{bet.bettor.name}</Text>
                    <Text style={{ fontSize: 12 }}>
                      Prono: {bet.result.fullTime?.home} - {bet.result.fullTime?.away}
                    </Text>
                  </View>
                )) || <Text style={{ color: '#666' }}>Aucun pronostic</Text>}
              </ScrollView>

              <TouchableOpacity
                style={{ backgroundColor: '#3B82F6', padding: 12, borderRadius: 8, alignItems: 'center' }}
                onPress={() => setSelectedMatch(null)}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Fermer</Text>
              </TouchableOpacity>

              {!selectedMatch.result && (
                <TouchableOpacity
                  style={{ backgroundColor: '#10B981', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 }}
                  onPress={() => {
                    console.log('Betting button pressed for match:', selectedMatch);
                    setSelectedMatch(null);
                    router.push(`/bets/create?id=${selectedMatch.id}&competitionId=${competition.id}`);
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Parier sur ce match</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </Modal>

      {/* Create Match Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '90%', maxWidth: 320 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
              Nouveau match
            </Text>
            
            <TextInput
              style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 }}
              value={newMatch.name}
              onChangeText={(text) => updateNewMatch('name', text)}
              placeholder="Nom du match (optionnel)"
            />

            <Text style={{ marginBottom: 8, fontWeight: 'bold' }}>Équipe à domicile:</Text>
            <ScrollView style={{ maxHeight: 100, marginBottom: 16, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8 }}>
              {competition.teams.map(team => (
                <TouchableOpacity
                  key={team.id}
                  style={{ padding: 12, backgroundColor: newMatch.homeTeamId === team.id?.toString() ? '#E0E7FF' : 'white' }}
                  onPress={() => updateNewMatch('homeTeamId', team.id?.toString() || '')}
                >
                  <Text>{team.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={{ marginBottom: 8, fontWeight: 'bold' }}>Équipe à l'extérieur:</Text>
            <ScrollView style={{ maxHeight: 100, marginBottom: 16, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8 }}>
              {competition.teams.map(team => (
                <TouchableOpacity
                  key={team.id}
                  style={{ padding: 12, backgroundColor: newMatch.awayTeamId === team.id?.toString() ? '#E0E7FF' : 'white' }}
                  onPress={() => updateNewMatch('awayTeamId', team.id?.toString() || '')}
                >
                  <Text>{team.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#E5E7EB', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewMatch({ name: '', homeTeamId: '', awayTeamId: '', date: '' });
                }}
              >
                <Text style={{ color: '#6B7280', fontSize: 16, fontWeight: '600' }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#3B82F6', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}
                onPress={handleCreateMatch}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
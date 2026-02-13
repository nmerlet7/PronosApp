import { useData } from "@/context/DataContext";
import { styles } from "@/styles";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from "react-native";
import { Match, Bettor, Result, Score } from "@/types";

export default function CreateBet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { competitions, bettors } = useData();
  
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedBettor, setSelectedBettor] = useState<Bettor | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showBettorModal, setShowBettorModal] = useState(false);
  
  const [prediction, setPrediction] = useState({
    halfTimeHome: '',
    halfTimeAway: '',
    fullTimeHome: '',
    fullTimeAway: ''
  });

  const competition = competitions.find(c => c.matches.some(m => m.id === parseInt(id)));
  const match = competition?.matches.find(m => m.id === parseInt(id));

  if (!match) {
    return (
      <View style={styles.container}>
        <Text>Match not found</Text>
      </View>
    );
  }

  // Vérifier si le match est déjà terminé
  if (match.result) {
    return (
      <View style={styles.container}>
        <Text style={styles.h1}>Match terminé</Text>
        <Text>Les pronostics ne sont plus possibles pour ce match.</Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#3B82F6', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 20 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const updatePrediction = (field: string, value: string) => {
    setPrediction(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!selectedBettor) {
      Alert.alert('Erreur', 'Veuillez sélectionner un pronostiqueur');
      return;
    }

    if (!prediction.halfTimeHome || !prediction.halfTimeAway || 
        !prediction.fullTimeHome || !prediction.fullTimeAway) {
      Alert.alert('Erreur', 'Veuillez compléter tous les scores');
      return;
    }

    const result: Result = {
      halfTime: {
        home: parseInt(prediction.halfTimeHome),
        away: parseInt(prediction.halfTimeAway)
      },
      fullTime: {
        home: parseInt(prediction.fullTimeHome),
        away: parseInt(prediction.fullTimeAway)
      }
    };

    // Déterminer le vainqueur
    if (result.fullTime && result.fullTime.home > result.fullTime.away) {
      result.winner = match.home;
    } else if (result.fullTime && result.fullTime.away > result.fullTime.home) {
      result.winner = match.away;
    }

    const newBet = {
      id: Date.now(),
      bettor: selectedBettor,
      match: match,
      result: result,
      points: 0,
      isLocked: false
    };

    // TODO: Add bet to competition
    console.log('Creating bet:', newBet);
    
    Alert.alert('Succès', 'Pronostic enregistré avec succès!');
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Nouveau pronostic</Text>
      
      <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          {match.name || 'Match'}
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 4 }}>
          {match.home.name} vs {match.away.name}
        </Text>
        <Text style={{ fontSize: 12, color: '#666' }}>
          {match.date ? new Date(match.date).toLocaleDateString('fr-FR') : 'Date non définie'}
        </Text>
      </View>

      {/* Sélection du pronostiqueur */}
      <TouchableOpacity 
        style={[styles.padded, { 
          backgroundColor: 'white', 
          borderRadius: 8, 
          marginBottom: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }]}
        onPress={() => setShowBettorModal(true)}
      >
        <Text>
          {selectedBettor ? selectedBettor.name : 'Sélectionner un pronostiqueur'}
        </Text>
        <Text style={{ color: '#666' }}>›</Text>
      </TouchableOpacity>

      {/* Formulaire de prédiction */}
      <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 20 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 12 }}>Score à la mi-temps</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TextInput
            style={{ 
              flex: 1, 
              borderWidth: 1, 
              borderColor: '#D1D5DB', 
              borderRadius: 8, 
              padding: 12, 
              textAlign: 'center',
              fontSize: 16,
              fontWeight: 'bold'
            }}
            value={prediction.halfTimeHome}
            onChangeText={(text) => updatePrediction('halfTimeHome', text)}
            placeholder="0"
            keyboardType="numeric"
          />
          <Text style={{ marginHorizontal: 16, fontSize: 16, fontWeight: 'bold' }}>-</Text>
          <TextInput
            style={{ 
              flex: 1, 
              borderWidth: 1, 
              borderColor: '#D1D5DB', 
              borderRadius: 8, 
              padding: 12, 
              textAlign: 'center',
              fontSize: 16,
              fontWeight: 'bold'
            }}
            value={prediction.halfTimeAway}
            onChangeText={(text) => updatePrediction('halfTimeAway', text)}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>

        <Text style={{ fontWeight: 'bold', marginBottom: 12 }}>Score final</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={{ 
              flex: 1, 
              borderWidth: 1, 
              borderColor: '#D1D5DB', 
              borderRadius: 8, 
              padding: 12, 
              textAlign: 'center',
              fontSize: 16,
              fontWeight: 'bold'
            }}
            value={prediction.fullTimeHome}
            onChangeText={(text) => updatePrediction('fullTimeHome', text)}
            placeholder="0"
            keyboardType="numeric"
          />
          <Text style={{ marginHorizontal: 16, fontSize: 16, fontWeight: 'bold' }}>-</Text>
          <TextInput
            style={{ 
              flex: 1, 
              borderWidth: 1, 
              borderColor: '#D1D5DB', 
              borderRadius: 8, 
              padding: 12, 
              textAlign: 'center',
              fontSize: 16,
              fontWeight: 'bold'
            }}
            value={prediction.fullTimeAway}
            onChangeText={(text) => updatePrediction('fullTimeAway', text)}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>
      </View>

      <TouchableOpacity 
        style={{ 
          backgroundColor: '#3B82F6', 
          padding: 16, 
          borderRadius: 8, 
          alignItems: 'center',
          marginBottom: 20
        }}
        onPress={handleSubmit}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          Enregistrer le pronostic
        </Text>
      </TouchableOpacity>

      {/* Modal de sélection des pronostiqueurs */}
      <Modal visible={showBettorModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '90%', maxWidth: 320 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
              Choisir un pronostiqueur
            </Text>
            
            <ScrollView style={{ maxHeight: 200, marginBottom: 20 }}>
              {bettors.map(bettor => (
                <TouchableOpacity
                  key={bettor.id}
                  style={{ 
                    padding: 12, 
                    backgroundColor: selectedBettor?.id === bettor.id ? '#E0E7FF' : 'white',
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee'
                  }}
                  onPress={() => {
                    setSelectedBettor(bettor);
                    setShowBettorModal(false);
                  }}
                >
                  <Text style={{ fontWeight: selectedBettor?.id === bettor.id ? 'bold' : 'normal' }}>
                    {bettor.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={{ backgroundColor: '#E5E7EB', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}
              onPress={() => setShowBettorModal(false)}
            >
              <Text style={{ color: '#6B7280', fontSize: 16, fontWeight: '600' }}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

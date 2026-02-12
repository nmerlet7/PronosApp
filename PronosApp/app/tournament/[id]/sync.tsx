import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AutoSyncService from '@/utils/auto-sync';
import { StorageService } from '@/utils/storage';

interface SyncScreenProps {
  tournamentId: string;
}

export default function SyncScreen({ tournamentId }: SyncScreenProps) {
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<{
    isActive: boolean;
    lastSync?: Date;
  }>({ isActive: false });

  useEffect(() => {
    loadSyncStatus();
  }, []);

  const loadSyncStatus = () => {
    const status = AutoSyncService.getSyncStatus();
    setSyncStatus(status);
    setIsAutoSyncEnabled(status.isActive);
    setLastSync(status.lastSync || null);
  };

  const toggleAutoSync = async (enabled: boolean) => {
    try {
      if (enabled) {
        // Vérifier si la clé API est configurée
        const apiKey = await StorageService.getApiKey();
        if (!apiKey || apiKey === 'YOUR_API_KEY') {
          Alert.alert(
              'Clé API requise',
              'Vous devez d\'abord configurer votre clé API api-football.com',
              [
                {
                  text: 'Configurer',
                  onPress: () => router.push(`/tournament/${tournamentId}/api-matches`),
                },
                {
                  text: 'Annuler',
                  style: 'cancel',
                }
              ]
            );
          return;
        }

        AutoSyncService.startAutoSync(tournamentId);
        Alert.alert('Succès', 'Synchronisation automatique activée');
      } else {
        AutoSyncService.stopAutoSync();
        Alert.alert('Succès', 'Synchronisation automatique désactivée');
      }

      setIsAutoSyncEnabled(enabled);
      loadSyncStatus();
    } catch (error) {
      console.error('Error toggling auto sync:', error);
      Alert.alert('Erreur', 'Impossible de modifier la synchronisation');
    }
  };

  const manualSync = async () => {
    setIsSyncing(true);
    try {
      const success = await AutoSyncService.syncMatches(tournamentId);
      if (success) {
        Alert.alert('Succès', 'Matchs synchronisés avec succès');
        setLastSync(new Date());
      } else {
        Alert.alert('Erreur', 'Échec de la synchronisation');
      }
    } catch (error) {
      console.error('Error during manual sync:', error);
      Alert.alert('Erreur', 'Impossible de synchroniser les matchs');
    } finally {
      setIsSyncing(false);
    }
  };

  const syncLiveScores = async () => {
    setIsSyncing(true);
    try {
      await AutoSyncService.syncLiveScores(tournamentId);
      Alert.alert('Succès', 'Scores en direct synchronisés');
    } catch (error) {
      console.error('Error syncing live scores:', error);
      Alert.alert('Erreur', 'Impossible de synchroniser les scores');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.title}>Synchronisation automatique</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sync" size={24} color="#3B82F6" />
            <Text style={styles.cardTitle}>Synchronisation automatique</Text>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>
              {isAutoSyncEnabled ? 'Activée' : 'Désactivée'}
            </Text>
            <Switch
              value={isAutoSyncEnabled}
              onValueChange={toggleAutoSync}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              thumbColor={isAutoSyncEnabled ? '#10B981' : '#F3F4F6'}
            />
          </View>

          <Text style={styles.settingDescription}>
            {isAutoSyncEnabled 
              ? 'Les matchs seront synchronisés automatiquement toutes les heures.'
              : 'Activez la synchronisation pour récupérer automatiquement les nouveaux matchs.'
            }
          </Text>

          {lastSync && (
            <Text style={styles.lastSyncText}>
              Dernière synchronisation : {lastSync.toLocaleString('fr-FR')}
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="refresh" size={24} color="#3B82F6" />
            <Text style={styles.cardTitle}>Synchronisation manuelle</Text>
          </View>

          <TouchableOpacity
            style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
            onPress={manualSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="download" size={20} color="white" />
                <Text style={styles.syncButtonText}>Synchroniser les matchs</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.syncButton, styles.liveButton, isSyncing && styles.syncButtonDisabled]}
            onPress={syncLiveScores}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="time" size={20} color="white" />
                <Text style={styles.syncButtonText}>Synchroniser les scores en direct</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.settingDescription}>
            Synchronisez manuellement les matchs ou mettez à jour les scores des matchs en cours.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color="#F59E0B" />
            <Text style={styles.cardTitle}>Information</Text>
          </View>

          <Text style={styles.infoText}>
            • La synchronisation utilise l&apos;API api-football.com
          </Text>
          <Text style={styles.infoText}>
            • Les matchs sont récupérés pour les championnats principaux européens
          </Text>
          <Text style={styles.infoText}>
            • La synchronisation automatique s&apos;exécute toutes les heures
          </Text>
          <Text style={styles.infoText}>
            • Les scores en direct sont mis à jour en temps réel
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#374151',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  lastSyncText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    fontStyle: 'italic',
  },
  syncButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  syncButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  liveButton: {
    backgroundColor: '#10B981',
  },
  syncButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
});

import { useState, useEffect, useCallback } from 'react';
import { Tournament } from '@/types';
import { StorageService } from '@/services/storage.service';
import { useApi } from './useApi';

export function useTournaments() {
  const {
    data: tournaments,
    loading,
    error,
    refetch
  } = useApi<Tournament[]>(() => StorageService.getTournaments());

  const createTournament = useCallback(async (tournamentData: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTournament: Tournament = {
      ...tournamentData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedTournaments = [...(tournaments || []), newTournament];
    await StorageService.saveTournaments(updatedTournaments);
    await refetch();
    
    return newTournament;
  }, [tournaments, refetch]);

  const updateTournament = useCallback(async (tournamentId: string, updates: Partial<Tournament>) => {
    if (!tournaments) return null;

    const updatedTournaments = tournaments.map(tournament =>
      tournament.id === tournamentId
        ? { ...tournament, ...updates, updatedAt: new Date() }
        : tournament
    );

    await StorageService.saveTournaments(updatedTournaments);
    await refetch();
    
    return updatedTournaments.find(t => t.id === tournamentId) || null;
  }, [tournaments, refetch]);

  const deleteTournament = useCallback(async (tournamentId: string) => {
    if (!tournaments) return;

    const updatedTournaments = tournaments.filter(tournament => tournament.id !== tournamentId);
    await StorageService.saveTournaments(updatedTournaments);
    await refetch();
  }, [tournaments, refetch]);

  const getTournamentById = useCallback((tournamentId: string) => {
    return tournaments?.find(tournament => tournament.id === tournamentId) || null;
  }, [tournaments]);

  return {
    tournaments,
    loading,
    error,
    refetch,
    createTournament,
    updateTournament,
    deleteTournament,
    getTournamentById,
  };
}

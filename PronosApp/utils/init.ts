import { StorageService } from './storage';
import { DEFAULT_TEAMS } from './constants';

export async function initializeApp() {
  try {
    const existingTeams = await StorageService.getTeams();
    
    if (existingTeams.length === 0) {
      await StorageService.saveTeams(DEFAULT_TEAMS);
      console.log('Default teams initialized');
    }
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

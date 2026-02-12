export const API_CONFIG = {
  BASE_URL: 'https://v3.football.api-sports.io',
  TIMEOUT: 10000,
} as const;

export const STORAGE_KEYS = {
  TOURNAMENTS: 'tournaments',
  MATCHES: 'matches',
  PRONOSTIQUEURS: 'pronostiqueurs',
  TEAMS: 'teams',
  PRONOSTICS: 'pronostics',
  CURRENT_TOURNAMENT: 'current_tournament',
  API_KEY: 'api_key',
} as const;

export const COMPETITIONS = {
  PREMIER_LEAGUE: 39,
  LA_LIGA: 140,
  BUNDESLIGA: 78,
  SERIE_A: 135,
  LIGUE_1: 61,
  EREDIVISIE: 88,
  PRIMEIRA_LIGA: 94,
  SCOTTISH_PREMIERSHIP: 103,
  CHAMPIONS_LEAGUE: 2,
  EUROPA_LEAGUE: 3,
  CONFERENCE_LEAGUE: 848,
} as const;

export const MATCH_STATUS = {
  UPCOMING: 'upcoming',
  IN_PROGRESS: 'in_progress',
  FINISHED: 'finished',
} as const;

export const TOURNAMENT_STATUS = {
  UPCOMING: 'upcoming',
  IN_PROGRESS: 'in_progress',
  FINISHED: 'finished',
} as const;

export const PRONOSTIC_WINNER = {
  HOME: 'home',
  AWAY: 'away',
  DRAW: 'draw',
} as const;

export const COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  GRAY: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const;

export const DIMENSIONS = {
  BORDER_RADIUS: {
    SMALL: 8,
    MEDIUM: 12,
    LARGE: 16,
    XLARGE: 24,
  },
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },
  FONT_SIZE: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 32,
  },
} as const;

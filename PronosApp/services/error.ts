export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const ERROR_CODES = {
  API_KEY_MISSING: 'API_KEY_MISSING',
  API_KEY_INVALID: 'API_KEY_INVALID',
  NETWORK_ERROR: 'NETWORK_ERROR',
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',
  STORAGE_ERROR: 'STORAGE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Une erreur inattendue est survenue';
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof AppError) {
    return error.code === ERROR_CODES.NETWORK_ERROR;
  }
  
  return error instanceof Error && 
    (error.message.includes('network') || 
     error.message.includes('fetch') || 
     error.message.includes('timeout'));
};

export const isAuthError = (error: unknown): boolean => {
  if (error instanceof AppError) {
    return error.code === ERROR_CODES.API_KEY_MISSING || 
           error.code === ERROR_CODES.API_KEY_INVALID;
  }
  
  return false;
};

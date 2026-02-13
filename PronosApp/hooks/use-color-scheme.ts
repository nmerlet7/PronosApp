import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Hook to get the current color scheme (light/dark)
 * Returns 'light', 'dark', or null
 */
export function useColorScheme(): 'light' | 'dark' | null {
  const scheme = useRNColorScheme();
  return scheme === 'light' || scheme === 'dark' ? scheme : null;
}
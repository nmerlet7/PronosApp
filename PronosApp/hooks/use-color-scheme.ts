import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme(): 'light' | 'dark' | null {
  const scheme = useRNColorScheme();
  return scheme === 'light' || scheme === 'dark' ? scheme : null;
}
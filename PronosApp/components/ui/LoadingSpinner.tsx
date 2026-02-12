import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  text?: string;
  color?: string;
}

export function LoadingSpinner({ 
  size = 'large', 
  text, 
  color = COLORS.PRIMARY 
}: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator 
        size={size} 
        color={color} 
        style={styles.spinner} 
      />
      {text && (
        <Text style={[styles.text, { color }]}>
          {text}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  spinner: {
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

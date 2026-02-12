import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DIMENSIONS } from '@/constants';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorDisplay({ 
  message, 
  onRetry, 
  retryText = 'Réessayer' 
}: ErrorDisplayProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={48} color={COLORS.ERROR} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.retryText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DIMENSIONS.SPACING.LG,
  },
  message: {
    fontSize: DIMENSIONS.FONT_SIZE.MD,
    color: COLORS.GRAY[700],
    textAlign: 'center',
    marginTop: DIMENSIONS.SPACING.MD,
    marginBottom: DIMENSIONS.SPACING.LG,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: DIMENSIONS.SPACING.LG,
    paddingVertical: DIMENSIONS.SPACING.MD,
    borderRadius: DIMENSIONS.BORDER_RADIUS.MEDIUM,
  },
  retryText: {
    color: 'white',
    fontSize: DIMENSIONS.FONT_SIZE.MD,
    fontWeight: '600',
    marginLeft: DIMENSIONS.SPACING.SM,
  },
});

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Team } from '@/types/api.types';
import { COLORS, DIMENSIONS } from '@/constants';

interface TeamCardProps {
  team: Team;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export function TeamCard({ team, onPress, size = 'medium' }: TeamCardProps) {
  const cardStyle = [
    styles.card,
    size === 'small' && styles.small,
    size === 'large' && styles.large,
  ];

  const logoSize = size === 'small' ? 32 : size === 'large' ? 56 : 40;
  const logoStyle = [
    styles.logo,
    { width: logoSize, height: logoSize },
  ];

  return (
    <TouchableOpacity 
      style={cardStyle} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={logoStyle}>
        {team.logo ? (
          <Image source={{ uri: team.logo }} style={styles.logoImage} />
        ) : (
          <Ionicons 
            name="shield-outline" 
            size={logoSize * 0.6} 
            color={COLORS.GRAY[400]} 
          />
        )}
      </View>
      <Text style={styles.teamName} numberOfLines={1}>
        {team.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: DIMENSIONS.SPACING.MD,
    marginBottom: DIMENSIONS.SPACING.SM,
    borderRadius: DIMENSIONS.BORDER_RADIUS.MEDIUM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  small: {
    padding: DIMENSIONS.SPACING.SM,
  },
  large: {
    padding: DIMENSIONS.SPACING.LG,
  },
  logo: {
    borderRadius: 28,
    backgroundColor: COLORS.GRAY[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DIMENSIONS.SPACING.MD,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  teamName: {
    fontSize: DIMENSIONS.FONT_SIZE.MD,
    fontWeight: '600',
    color: COLORS.GRAY[800],
    flex: 1,
  },
});

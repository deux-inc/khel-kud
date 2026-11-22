import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'live' | 'success' | 'warning' | 'info' | 'neutral' | 'danger';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral', style }) => {
  return (
    <View style={[styles.base, styles[variant], style]}>
      {variant === 'live' && <View style={styles.livePulse} />}
      <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles]]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  live: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  liveText: {
    color: '#F87171',
  },
  success: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  successText: {
    color: '#34D399',
  },
  warning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  warningText: {
    color: '#FBBF24',
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  dangerText: {
    color: '#FCA5A5',
  },
  info: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  infoText: {
    color: '#60A5FA',
  },
  neutral: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  neutralText: {
    color: '#9CA3AF',
  },
});
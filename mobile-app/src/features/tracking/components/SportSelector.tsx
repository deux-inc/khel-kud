import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SPORTS_CONFIG } from '../../../constants/sports';
import { SportConfig, SportType } from '../../../types/sport';

interface SportSelectorProps {
  selectedSport: SportType;
  onSelect: (sport: SportConfig) => void;
  disabled?: boolean;
}

export const SportSelector: React.FC<SportSelectorProps> = ({
  selectedSport,
  onSelect,
  disabled = false,
}) => {
  const sports = Object.values(SPORTS_CONFIG);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Select Sport & Court</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {sports.map((sport) => {
          const isSelected = sport.id === selectedSport;
          return (
            <TouchableOpacity
              key={sport.id}
              activeOpacity={0.8}
              disabled={disabled}
              onPress={() => onSelect(sport)}
              style={[
                styles.chip,
                isSelected && { borderColor: sport.accentColor, backgroundColor: '#1E293B' },
                disabled && styles.disabled,
              ]}
            >
              <View style={styles.chipHeader}>
                <View style={[styles.indicator, { backgroundColor: sport.accentColor }]} />
                <Text style={[styles.chipTitle, isSelected && styles.chipTitleActive]}>
                  {sport.name}
                </Text>
              </View>
              <Text style={styles.dimensions}>
                {sport.courtLength}m × {sport.courtWidth}m ({sport.category})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  scrollContent: {
    paddingVertical: 4,
    gap: 10,
  },
  chip: {
    backgroundColor: '#111827',
    borderWidth: 1.5,
    borderColor: '#1F2937',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 140,
  },
  disabled: {
    opacity: 0.6,
  },
  chipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  chipTitleActive: {
    color: '#F9FAFB',
  },
  dimensions: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
});

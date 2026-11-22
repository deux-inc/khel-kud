import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from '../../../components/ui/Card';
import { LiveTrackingMetrics } from '../../../types/sensor';

interface CalibrationModeProps {
  metrics: LiveTrackingMetrics;
  onReset: () => void;
}

export const CalibrationMode: React.FC<CalibrationModeProps> = ({ metrics, onReset }) => {
  const [targetSteps, setTargetSteps] = useState(100);
  const [isExpanded, setIsExpanded] = useState(false);

  const hwError =
    targetSteps > 0 && metrics.hardwareSteps > 0
      ? Math.round(((metrics.hardwareSteps - targetSteps) / targetSteps) * 100)
      : null;

  const accelError =
    targetSteps > 0 && metrics.accelSteps > 0
      ? Math.round(((metrics.accelSteps - targetSteps) / targetSteps) * 100)
      : null;

  return (
    <Card style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.header}
      >
        <View>
          <Text style={styles.title}>Step Accuracy Calibration (Skill 6)</Text>
          <Text style={styles.subtitle}>
            {isExpanded ? 'Tap to collapse' : 'Tap to test 100-step walking accuracy'}
          </Text>
        </View>
        <Text style={styles.toggleIcon}>{isExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          <Text style={styles.instructions}>
            Walk physically for exactly <Text style={styles.bold}>{targetSteps} steps</Text> with
            phone in hand or pocket. Check error variance below (target: ±3%).
          </Text>

          <View style={styles.targetRow}>
            <Text style={styles.label}>Target:</Text>
            {[50, 100, 200].map((count) => (
              <TouchableOpacity
                key={count}
                onPress={() => setTargetSteps(count)}
                style={[styles.targetBtn, targetSteps === count && styles.targetBtnActive]}
              >
                <Text
                  style={[styles.targetBtnText, targetSteps === count && styles.targetBtnTextActive]}
                >
                  {count} steps
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.resultsGrid}>
            <View style={styles.resultCol}>
              <Text style={styles.resultLabel}>Hardware Sensor</Text>
              <Text style={styles.resultVal}>{metrics.hardwareSteps}</Text>
              {hwError !== null && (
                <Text style={[styles.errorText, Math.abs(hwError) <= 3 ? styles.good : styles.warn]}>
                  {hwError > 0 ? `+${hwError}%` : `${hwError}%`}
                </Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.resultCol}>
              <Text style={styles.resultLabel}>IMU Accelerometer</Text>
              <Text style={styles.resultVal}>{metrics.accelSteps}</Text>
              {accelError !== null && (
                <Text
                  style={[styles.errorText, Math.abs(accelError) <= 5 ? styles.good : styles.warn]}
                >
                  {accelError > 0 ? `+${accelError}%` : `${accelError}%`}
                </Text>
              )}
            </View>
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  toggleIcon: {
    color: '#94A3B8',
    fontSize: 14,
  },
  content: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 12,
  },
  instructions: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
    marginBottom: 10,
  },
  bold: {
    fontWeight: '700',
    color: '#38BDF8',
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  targetBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  targetBtnActive: {
    backgroundColor: '#38BDF8',
  },
  targetBtnText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  targetBtnTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  resultsGrid: {
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: '#090D16',
    borderRadius: 12,
    padding: 12,
  },
  resultCol: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#1E293B',
  },
  resultLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  resultVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 2,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  good: {
    color: '#34D399',
  },
  warn: {
    color: '#FBBF24',
  },
});

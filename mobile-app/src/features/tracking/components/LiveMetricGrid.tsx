import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { LiveTrackingMetrics } from '../../../types/sensor';

interface LiveMetricGridProps {
  metrics: LiveTrackingMetrics;
  accentColor?: string;
}

export const LiveMetricGrid: React.FC<LiveMetricGridProps> = ({
  metrics,
  accentColor = '#10B981',
}) => {
  // Format seconds to mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getIntensityBadge = (intensity: LiveTrackingMetrics['intensity']) => {
    switch (intensity) {
      case 'sprinting':
        return <Badge label="Sprinting" variant="danger" />;
      case 'jogging':
        return <Badge label="Jogging" variant="warning" />;
      case 'walking':
        return <Badge label="Walking" variant="success" />;
      default:
        return <Badge label="Stationary" variant="neutral" />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Primary Hero Card: Time, Steps, and Movement Intensity */}
      <Card variant="highlight" style={[styles.heroCard, { borderColor: accentColor }]}>
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.heroLabel}>Game Clock</Text>
            <Text style={styles.heroClock}>{formatTime(metrics.durationSeconds)}</Text>
          </View>
          <View style={styles.intensityContainer}>
            {getIntensityBadge(metrics.intensity)}
            <Text style={styles.hzText}>{metrics.samplingRateHz} Hz sampling</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.heroRow}>
          <View>
            <Text style={styles.heroLabel}>Total Steps</Text>
            <Text style={[styles.heroSteps, { color: accentColor }]}>
              {metrics.activeSteps.toLocaleString()}
            </Text>
          </View>
          <View style={styles.stepBreakdown}>
            <Text style={styles.breakdownText}>
              HW Pedometer: <Text style={styles.bold}>{metrics.hardwareSteps}</Text>
            </Text>
            <Text style={styles.breakdownText}>
              IMU Accelerometer: <Text style={styles.bold}>{metrics.accelSteps}</Text>
            </Text>
          </View>
        </View>
      </Card>

      {/* Grid of Secondary Metrics: Cadence, Distance, Speeds, Sprints */}
      <View style={styles.grid}>
        <Card style={styles.gridItem}>
          <Text style={styles.metricLabel}>Cadence</Text>
          <Text style={styles.metricValue}>{metrics.cadence}</Text>
          <Text style={styles.metricUnit}>steps / min</Text>
        </Card>

        <Card style={styles.gridItem}>
          <Text style={styles.metricLabel}>Est. Distance</Text>
          <Text style={styles.metricValue}>
            {metrics.distanceMeters >= 1000
              ? (metrics.distanceMeters / 1000).toFixed(2)
              : metrics.distanceMeters}
          </Text>
          <Text style={styles.metricUnit}>
            {metrics.distanceMeters >= 1000 ? 'kilometers' : 'meters'}
          </Text>
        </Card>

        <Card style={styles.gridItem}>
          <Text style={styles.metricLabel}>Current Speed</Text>
          <Text style={styles.metricValue}>{metrics.currentSpeedKmH}</Text>
          <Text style={styles.metricUnit}>km / h</Text>
        </Card>

        <Card style={styles.gridItem}>
          <Text style={styles.metricLabel}>Top Speed</Text>
          <Text style={styles.metricValue}>{metrics.topSpeedKmH}</Text>
          <Text style={styles.metricUnit}>km / h</Text>
        </Card>

        <Card style={styles.gridItem}>
          <Text style={styles.metricLabel}>Sprint Bursts</Text>
          <Text style={styles.metricValue}>{metrics.sprintCount}</Text>
          <Text style={styles.metricUnit}>bursts detected</Text>
        </Card>

        <Card style={styles.gridItem}>
          <Text style={styles.metricLabel}>Heading</Text>
          <Text style={styles.metricValue}>{metrics.headingDegrees}°</Text>
          <Text style={styles.metricUnit}>azimuth compass</Text>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  intensityContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroClock: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  heroSteps: {
    fontSize: 42,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  stepBreakdown: {
    alignItems: 'flex-end',
    gap: 3,
  },
  breakdownText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  bold: {
    fontWeight: '700',
    color: '#E5E7EB',
  },
  hzText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  gridItem: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    marginVertical: 0,
    backgroundColor: '#111827',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F9FAFB',
    marginTop: 4,
  },
  metricUnit: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
});

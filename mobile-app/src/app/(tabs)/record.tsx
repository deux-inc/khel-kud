import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DEFAULT_SPORT, SPORTS_CONFIG } from '../../constants/sports';
import { CalibrationMode } from '../../features/tracking/components/CalibrationMode';
import { LiveMetricGrid } from '../../features/tracking/components/LiveMetricGrid';
import { SportSelector } from '../../features/tracking/components/SportSelector';
import { sensorManager } from '../../services/sensors/sensorManager';
import { sessionStorage } from '../../services/storage/sessionStorage';
import { LiveTrackingMetrics, SessionState } from '../../types/sensor';
import { SportConfig, SportType } from '../../types/sport';

const initialMetrics: LiveTrackingMetrics = {
  durationSeconds: 0,
  hardwareSteps: 0,
  accelSteps: 0,
  activeSteps: 0,
  cadence: 0,
  distanceMeters: 0,
  currentSpeedKmH: 0,
  topSpeedKmH: 0,
  sprintCount: 0,
  intensity: 'stationary',
  headingDegrees: 0,
  samplingRateHz: 0,
  isHardwarePedometerActive: false,
};

export default function RecordScreen() {
  const [selectedSport, setSelectedSport] = useState<SportType>(DEFAULT_SPORT);
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [metrics, setMetrics] = useState<LiveTrackingMetrics>(initialMetrics);
  const [permissionStatus, setPermissionStatus] = useState<{
    checked: boolean;
    granted: boolean;
    available: boolean;
  }>({
    checked: false,
    granted: false,
    available: false,
  });

  const activeSportConfig: SportConfig = SPORTS_CONFIG[selectedSport];

  useEffect(() => {
    // 1. Check native permissions on mount
    sensorManager.checkPermissions().then((res) => {
      setPermissionStatus({
        checked: true,
        granted: res.pedometerGranted,
        available: res.pedometerAvailable,
      });
    });

    // 2. Attach live metrics listener (throttled at 2Hz from sensorManager)
    sensorManager.setMetricsListener((latestMetrics) => {
      setMetrics(latestMetrics);
      setSessionState(sensorManager.getSessionState());
    });

    return () => {
      // Clean up when unmounting
      if (sensorManager.getSessionState() === 'recording') {
        sensorManager.pauseSession();
      }
    };
  }, []);

  const handleStart = async () => {
    try {
      await sensorManager.startSession(activeSportConfig);
      setSessionState('recording');
    } catch (err: any) {
      Alert.alert('Error', 'Unable to start tracking session: ' + err.message);
    }
  };

  const handlePause = () => {
    sensorManager.pauseSession();
    setSessionState('paused');
  };

  const handleResume = () => {
    sensorManager.resumeSession();
    setSessionState('recording');
  };

  const handleFinish = async () => {
    Alert.alert('Finish Match', 'Are you sure you want to finish this game session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish',
        style: 'destructive',
        onPress: async () => {
          const session = await sensorManager.stopSession();
          await sessionStorage.saveSession(session);
          setSessionState('completed');
          router.push({ pathname: '/session/[id]', params: { id: session.id } });
        },
      },
    ]);
  };

  const handleReset = () => {
    sensorManager.resetSession();
    setSessionState('idle');
    setMetrics(initialMetrics);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.appTitle}>Khel-Kud (खेल-कूद)</Text>
            <Text style={styles.appSubtitle}>Sports Movement Tracker</Text>
          </View>
          {sessionState === 'recording' && <Badge label="LIVE TRACKING" variant="live" />}
          {sessionState === 'paused' && <Badge label="PAUSED" variant="warning" />}
          {sessionState === 'completed' && <Badge label="COMPLETED" variant="success" />}
          {sessionState === 'idle' && <Badge label="READY" variant="neutral" />}
        </View>

        {/* Hardware Status Notice if Pedometer is missing/denied */}
        {permissionStatus.checked && !permissionStatus.available && (
          <Card style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>⚡ IMU Fallback Active</Text>
            <Text style={styles.noticeText}>
              Device lacks hardware step counter. Real-time accelerometer peak detection is running seamlessly.
            </Text>
          </Card>
        )}

        {/* Sport Selection Chips */}
        <SportSelector
          selectedSport={selectedSport}
          onSelect={(sport) => setSelectedSport(sport.id)}
          disabled={sessionState === 'recording' || sessionState === 'paused'}
        />

        {/* Live Metrics Grid */}
        <LiveMetricGrid metrics={metrics} accentColor={activeSportConfig.accentColor} />

        {/* Calibration Mode Drawer for Physical Testing */}
        <CalibrationMode metrics={metrics} onReset={handleReset} />

        {/* Session Action Controls */}
        <View style={styles.actionsContainer}>
          {sessionState === 'idle' && (
            <Button
              title={`Start ${activeSportConfig.name} Match`}
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleStart}
              style={{ backgroundColor: activeSportConfig.accentColor }}
            />
          )}

          {sessionState === 'recording' && (
            <View style={styles.multiActionRow}>
              <Button
                title="Pause Match"
                variant="secondary"
                size="md"
                onPress={handlePause}
                style={styles.flexBtn}
              />
              <Button
                title="Finish Match"
                variant="danger"
                size="md"
                onPress={handleFinish}
                style={styles.flexBtn}
              />
            </View>
          )}

          {sessionState === 'paused' && (
            <View style={styles.multiActionRow}>
              <Button
                title="Resume Match"
                variant="primary"
                size="md"
                onPress={handleResume}
                style={[styles.flexBtn, { backgroundColor: activeSportConfig.accentColor }]}
              />
              <Button
                title="Finish Match"
                variant="danger"
                size="md"
                onPress={handleFinish}
                style={styles.flexBtn}
              />
            </View>
          )}

          {sessionState === 'completed' && (
            <View style={styles.multiActionRow}>
              <Button
                title="View Match Stats"
                variant="primary"
                size="md"
                style={[styles.flexBtn, { backgroundColor: activeSportConfig.accentColor }]}
                onPress={() => {
                  const last = sensorManager.getLastCompletedSession();
                  if (last) {
                    router.push({ pathname: '/session/[id]', params: { id: last.id } });
                  }
                }}
              />
              <Button
                title="New Match"
                variant="outline"
                size="md"
                style={styles.flexBtn}
                onPress={handleReset}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F9FAFB',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  noticeCard: {
    backgroundColor: '#1E1B4B',
    borderColor: '#4338CA',
    marginVertical: 6,
    padding: 12,
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A5B4FC',
    marginBottom: 2,
  },
  noticeText: {
    fontSize: 11,
    color: '#C7D2FE',
    lineHeight: 16,
  },
  actionsContainer: {
    marginTop: 18,
  },
  multiActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flexBtn: {
    flex: 1,
  },
});
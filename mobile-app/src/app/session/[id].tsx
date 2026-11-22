import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SPORTS_CONFIG } from '../../constants/sports';
import { CourtVisualizer } from '../../features/courts/CourtVisualizer';
import { sensorManager } from '../../services/sensors/sensorManager';
import { sessionStorage } from '../../services/storage/sessionStorage';
import { MatchSession } from '../../types/session';
import { SportConfig } from '../../types/sport';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [session, setSession] = useState<MatchSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) {
        setLoading(false);
        return;
      }

      // Check SQLite first, then sensorManager in-memory cache
      const stored = await sessionStorage.getSessionById(id);
      if (stored) {
        setSession(stored);
      } else {
        const lastSession = sensorManager.getLastCompletedSession();
        if (lastSession && lastSession.id === id) {
          setSession(lastSession);
        }
      }
      setLoading(false);
    }

    loadData();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading match analytics...</Text>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Text style={styles.emptyTitle}>Session Not Found</Text>
        <Text style={styles.emptyDesc}>The requested match session could not be retrieved.</Text>
        <Button title="Back to Home" variant="primary" onPress={() => router.replace('/(tabs)')} />
      </SafeAreaView>
    );
  }

  const sportConfig: SportConfig = SPORTS_CONFIG[session.sport] || SPORTS_CONFIG.futsal;
  const m = session.metrics;

  // Format Duration mm:ss or hh:mm:ss
  const formatDuration = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Intensity percentage calculations
  const totalDuration = Math.max(1, session.durationSeconds);
  const sprintPct = Math.round((m.intensityBreakdown.sprintingSeconds / totalDuration) * 100);
  const jogPct = Math.round((m.intensityBreakdown.joggingSeconds / totalDuration) * 100);
  const walkPct = Math.round((m.intensityBreakdown.walkingSeconds / totalDuration) * 100);
  const restPct = Math.max(0, 100 - (sprintPct + jogPct + walkPct));

  const handleShare = async () => {
    try {
      const distance =
        m.distanceMeters >= 1000
          ? `${(m.distanceMeters / 1000).toFixed(2)} km`
          : `${m.distanceMeters} m`;

      await Share.share({
        message: `⚡ Khel-Kud Match Report: ${sportConfig.name}\n` +
          `⏱ Duration: ${formatDuration(session.durationSeconds)}\n` +
          `👟 Steps: ${m.totalSteps.toLocaleString()}\n` +
          `📍 Distance: ${distance}\n` +
          `🚀 Top Speed: ${m.topSpeedKmH} km/h\n` +
          `🔥 Sprints: ${m.sprintCount}\n` +
          `Tracked with Khel-Kud Athletic Kinematics.`,
      });
    } catch (err: any) {
      Alert.alert('Share Error', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/record')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Track Match</Text>
          </TouchableOpacity>
          <Button title="Share" variant="outline" size="sm" onPress={handleShare} />
        </View>

        {/* Hero Match Header */}
        <Card variant="highlight" style={[styles.headerCard, { borderColor: sportConfig.accentColor }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.sportTitle}>{sportConfig.name} Match</Text>
              <Text style={styles.dateText}>{formatDate(session.startTime)}</Text>
            </View>
            <Badge label={sportConfig.category.toUpperCase()} variant="success" />
          </View>

          <View style={styles.durationRow}>
            <View>
              <Text style={styles.statLabel}>MATCH TIME</Text>
              <Text style={[styles.durationVal, { color: sportConfig.accentColor }]}>
                {formatDuration(session.durationSeconds)}
              </Text>
            </View>
            <View style={styles.caloriesBox}>
              <Text style={styles.statLabel}>EST. ENERGY</Text>
              <Text style={styles.caloriesVal}>{m.caloriesBurned} kcal</Text>
            </View>
          </View>
        </Card>

        {/* Key Athletic Performance Metrics Grid */}
        <Text style={styles.sectionHeader}>Match Performance Stats</Text>
        <View style={styles.grid}>
          <Card style={styles.gridCard}>
            <Text style={styles.cardLabel}>Total Steps</Text>
            <Text style={[styles.cardValue, { color: sportConfig.accentColor }]}>
              {m.totalSteps.toLocaleString()}
            </Text>
            <Text style={styles.cardSub}>
              HW: {m.hardwareSteps} | IMU: {m.accelSteps}
            </Text>
          </Card>

          <Card style={styles.gridCard}>
            <Text style={styles.cardLabel}>Distance Covered</Text>
            <Text style={styles.cardValue}>
              {m.distanceMeters >= 1000
                ? (m.distanceMeters / 1000).toFixed(2)
                : m.distanceMeters}
            </Text>
            <Text style={styles.cardSub}>
              {m.distanceMeters >= 1000 ? 'kilometers' : 'meters'}
            </Text>
          </Card>

          <Card style={styles.gridCard}>
            <Text style={styles.cardLabel}>Top Speed</Text>
            <Text style={[styles.cardValue, { color: '#EF4444' }]}>{m.topSpeedKmH}</Text>
            <Text style={styles.cardSub}>km / h peak burst</Text>
          </Card>

          <Card style={styles.gridCard}>
            <Text style={styles.cardLabel}>Avg Speed</Text>
            <Text style={styles.cardValue}>{m.avgSpeedKmH}</Text>
            <Text style={styles.cardSub}>km / h pace</Text>
          </Card>

          <Card style={styles.gridCard}>
            <Text style={styles.cardLabel}>Sprint Bursts</Text>
            <Text style={[styles.cardValue, { color: '#F59E0B' }]}>{m.sprintCount}</Text>
            <Text style={styles.cardSub}>high-intensity efforts</Text>
          </Card>

          <Card style={styles.gridCard}>
            <Text style={styles.cardLabel}>Avg Cadence</Text>
            <Text style={styles.cardValue}>{m.avgCadence}</Text>
            <Text style={styles.cardSub}>steps / minute</Text>
          </Card>
        </View>

        {/* Movement Intensity Distribution */}
        <Card style={styles.intensityCard}>
          <Text style={styles.intensityTitle}>Movement Intensity Distribution</Text>
          <View style={styles.intensityBarContainer}>
            {sprintPct > 0 && (
              <View style={[styles.barSegment, { width: `${sprintPct}%`, backgroundColor: '#EF4444' }]} />
            )}
            {jogPct > 0 && (
              <View style={[styles.barSegment, { width: `${jogPct}%`, backgroundColor: '#F59E0B' }]} />
            )}
            {walkPct > 0 && (
              <View style={[styles.barSegment, { width: `${walkPct}%`, backgroundColor: '#10B981' }]} />
            )}
            {restPct > 0 && (
              <View style={[styles.barSegment, { width: `${restPct}%`, backgroundColor: '#374151' }]} />
            )}
          </View>

          <View style={styles.intensityBreakdownGrid}>
            <View style={styles.breakdownItem}>
              <View style={[styles.pillDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.breakdownLabel}>Sprint ({sprintPct}%)</Text>
              <Text style={styles.breakdownSec}>{formatDuration(m.intensityBreakdown.sprintingSeconds)}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.pillDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.breakdownLabel}>Jog ({jogPct}%)</Text>
              <Text style={styles.breakdownSec}>{formatDuration(m.intensityBreakdown.joggingSeconds)}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.pillDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.breakdownLabel}>Walk ({walkPct}%)</Text>
              <Text style={styles.breakdownSec}>{formatDuration(m.intensityBreakdown.walkingSeconds)}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.pillDot, { backgroundColor: '#374151' }]} />
              <Text style={styles.breakdownLabel}>Stationary ({restPct}%)</Text>
              <Text style={styles.breakdownSec}>{formatDuration(m.intensityBreakdown.stationarySeconds)}</Text>
            </View>
          </View>
        </Card>

        {/* Court Spatial Coverage Heatmap & Trajectory */}
        <CourtVisualizer sport={sportConfig} trajectory={session.trajectory} />

        {/* Footer Actions */}
        <View style={styles.footerActions}>
          <Button
            title="Start Another Match"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.replace('/(tabs)/record')}
            style={{ backgroundColor: sportConfig.accentColor }}
          />
          <Button
            title="View History"
            variant="outline"
            size="md"
            fullWidth
            onPress={() => router.replace('/(tabs)/history')}
            style={styles.historyBtn}
          />
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0B0F17',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#9CA3AF',
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backBtnText: {
    fontSize: 14,
    color: '#38BDF8',
    fontWeight: '700',
  },
  headerCard: {
    backgroundColor: '#0F172A',
    padding: 16,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sportTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F9FAFB',
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 12,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  durationVal: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  caloriesBox: {
    alignItems: 'flex-end',
  },
  caloriesVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F9FAFB',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  gridCard: {
    width: '48%',
    flexGrow: 1,
    padding: 14,
    backgroundColor: '#111827',
    borderColor: '#1F2937',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F9FAFB',
    marginVertical: 4,
  },
  cardSub: {
    fontSize: 10,
    color: '#6B7280',
  },
  intensityCard: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
    padding: 16,
    marginBottom: 16,
  },
  intensityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 12,
  },
  intensityBarContainer: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    marginBottom: 14,
  },
  barSegment: {
    height: '100%',
  },
  intensityBreakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  breakdownItem: {
    width: '48%',
    backgroundColor: '#111827',
    padding: 8,
    borderRadius: 8,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  breakdownSec: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F9FAFB',
    marginTop: 2,
  },
  footerActions: {
    marginTop: 20,
    gap: 10,
  },
  historyBtn: {
    borderColor: '#374151',
  },
});

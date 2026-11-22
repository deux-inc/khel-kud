import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { SPORTS_CONFIG } from '../../constants/sports';
import { sessionStorage } from '../../services/storage/sessionStorage';
import { MatchSession } from '../../types/session';

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<MatchSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadSessions = useCallback(async () => {
    const list = await sessionStorage.getAllSessions();
    setSessions(list);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [loadSessions])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }: { item: MatchSession }) => {
    const sport = SPORTS_CONFIG[item.sport] || SPORTS_CONFIG.futsal;
    const m = item.metrics;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: '/session/[id]', params: { id: item.id } })}
      >
        <Card style={styles.sessionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.sportBadgeRow}>
              <View style={[styles.sportDot, { backgroundColor: sport.accentColor }]} />
              <Text style={styles.sportName}>{sport.name}</Text>
            </View>
            <Text style={styles.dateText}>{formatDate(item.startTime)}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>DURATION</Text>
              <Text style={styles.statVal}>{formatDuration(item.durationSeconds)}</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>STEPS</Text>
              <Text style={[styles.statVal, { color: sport.accentColor }]}>
                {m.totalSteps.toLocaleString()}
              </Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>DISTANCE</Text>
              <Text style={styles.statVal}>
                {m.distanceMeters >= 1000
                  ? `${(m.distanceMeters / 1000).toFixed(2)} km`
                  : `${m.distanceMeters} m`}
              </Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>TOP SPEED</Text>
              <Text style={[styles.statVal, { color: '#EF4444' }]}>{m.topSpeedKmH} km/h</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.viewDetailsText}>View court heatmap & full stats →</Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Match History</Text>
          <Badge label={`${sessions.length} MATCHES`} variant="info" />
        </View>

        {sessions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.icon}>📋</Text>
            <Text style={styles.emptyTitle}>No Recorded Matches Yet</Text>
            <Text style={styles.emptyText}>
              Go to the Track Match tab, play a game, and tap "Finish Match" to view your stats and court heatmap here.
            </Text>
          </Card>
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  container: {
    padding: 16,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F9FAFB',
    letterSpacing: -0.5,
  },
  listContent: {
    paddingBottom: 40,
    gap: 12,
  },
  sessionCard: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sportDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sportName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F9FAFB',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1E293B',
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 2,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F9FAFB',
  },
  cardFooter: {
    marginTop: 10,
  },
  viewDetailsText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
  },
  emptyCard: {
    marginTop: 40,
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

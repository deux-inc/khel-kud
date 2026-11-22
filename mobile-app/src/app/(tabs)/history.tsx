import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Match History</Text>
          <Badge label="PHASE 2" variant="neutral" />
        </View>

        <Card style={styles.emptyCard}>
          <Text style={styles.icon}>📋</Text>
          <Text style={styles.emptyTitle}>No Recorded Sessions Yet</Text>
          <Text style={styles.emptyText}>
            Go to the Track Match tab to record your first game session. Your movement data and step logs will be stored here.
          </Text>
        </Card>
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

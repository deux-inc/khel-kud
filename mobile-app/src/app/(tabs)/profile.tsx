import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F17" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Player Profile</Text>
          <Badge label="LOCAL TESTER" variant="info" />
        </View>

        <Card style={styles.profileCard}>
          <Text style={styles.avatar}>🏃‍♂️</Text>
          <Text style={styles.name}>Athlete</Text>
          <Text style={styles.role}>Khel-Kud Alpha Tester</Text>
        </Card>

        <Card style={styles.settingsCard}>
          <Text style={styles.sectionHeader}>Kinematics Config</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Accelerometer Rate</Text>
            <Text style={styles.settingVal}>40 Hz (25ms)</Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Magnetometer Rate</Text>
            <Text style={styles.settingVal}>10 Hz (100ms)</Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Step Detection Model</Text>
            <Text style={styles.settingVal}>Weinberg Peak Refractory</Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>UI Publish Frequency</Text>
            <Text style={styles.settingVal}>2 Hz (500ms)</Text>
          </View>
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
  profileCard: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 48,
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F9FAFB',
  },
  role: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  settingsCard: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
    padding: 16,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  settingLabel: {
    fontSize: 13,
    color: '#D1D5DB',
  },
  settingVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
});

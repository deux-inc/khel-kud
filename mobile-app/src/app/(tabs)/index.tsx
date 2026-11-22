import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SPORTS_CONFIG } from '../../constants/sports';

export default function HomeScreen() {
  const sports = Object.values(SPORTS_CONFIG);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F17" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.heroSection}>
          <Badge label="BETA PROTOTYPE" variant="success" style={styles.badge} />
          <Text style={styles.heading}>Khel-Kud (खेल-कूद)</Text>
          <Text style={styles.subheading}>
            Kinematic movement & court coverage tracking for indoor and field sports.
          </Text>
        </View>

        {/* Quick Start Card */}
        <Card variant="highlight" style={styles.startCard}>
          <Text style={styles.cardHeader}>Match Tracking Ready</Text>
          <Text style={styles.cardDesc}>
            Put your phone in your pocket or arm band. Real-time IMU peak detection and pedometer sensor fusion will measure steps, cadence, and sprint bursts.
          </Text>
          <Button
            title="Start Match Recording →"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.push('/(tabs)/record')}
            style={styles.startBtn}
          />
        </Card>

        {/* Sports Courts Covered */}
        <Text style={styles.sectionTitle}>Supported Sports & Courts</Text>
        <View style={styles.sportsList}>
          {sports.map((sport) => (
            <Card key={sport.id} style={styles.sportCard}>
              <View style={styles.sportHeader}>
                <View style={[styles.sportDot, { backgroundColor: sport.accentColor }]} />
                <Text style={styles.sportName}>{sport.name}</Text>
                <Badge
                  label={sport.category}
                  variant={sport.category === 'indoor' ? 'info' : 'warning'}
                />
              </View>
              <Text style={styles.sportDetails}>
                Standard dimensions: {sport.courtLength}m × {sport.courtWidth}m
              </Text>
              <Text style={styles.sportStrategy}>
                {sport.category === 'indoor'
                  ? 'Inertial PDR (Dead Reckoning + Boundary Clamping)'
                  : 'Hybrid GPS + Inertial Kinematics'}
              </Text>
            </Card>
          ))}
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
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  heroSection: {
    marginVertical: 14,
  },
  badge: {
    marginBottom: 8,
  },
  heading: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F9FAFB',
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    lineHeight: 20,
  },
  startCard: {
    marginVertical: 12,
    backgroundColor: '#0F172A',
    borderColor: '#10B981',
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 19,
    marginBottom: 16,
  },
  startBtn: {
    backgroundColor: '#10B981',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 10,
  },
  sportsList: {
    gap: 8,
  },
  sportCard: {
    marginVertical: 4,
  },
  sportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sportDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sportName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F1F5F9',
    flex: 1,
  },
  sportDetails: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 2,
  },
  sportStrategy: {
    fontSize: 11,
    color: '#64748B',
  },
});

import { useLocalSearchParams, router } from 'expo-router';
import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F17" />
      <View style={styles.container}>
        <Text style={styles.title}>Session Details</Text>
        <Text style={styles.subtitle}>ID: {id}</Text>

        <Card style={styles.card}>
          <Text style={styles.info}>Session playback and trajectory mapping will be rendered here.</Text>
        </Card>

        <Button title="Back to Home" variant="outline" onPress={() => router.replace('/(tabs)')} />
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
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F9FAFB',
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  card: {
    padding: 16,
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
    marginBottom: 20,
  },
  info: {
    fontSize: 14,
    color: '#D1D5DB',
  },
});

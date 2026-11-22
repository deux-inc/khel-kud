import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

export const Title: React.FC<TextProps> = ({ children, style, ...rest }) => (
  <Text style={[styles.title, style]} {...rest}>
    {children}
  </Text>
);

export const Subtitle: React.FC<TextProps> = ({ children, style, ...rest }) => (
  <Text style={[styles.subtitle, style]} {...rest}>
    {children}
  </Text>
);

export const Body: React.FC<TextProps> = ({ children, style, ...rest }) => (
  <Text style={[styles.body, style]} {...rest}>
    {children}
  </Text>
);

export const StatValue: React.FC<TextProps> = ({ children, style, ...rest }) => (
  <Text style={[styles.statValue, style]} {...rest}>
    {children}
  </Text>
);

export const StatLabel: React.FC<TextProps> = ({ children, style, ...rest }) => (
  <Text style={[styles.statLabel, style]} {...rest}>
    {children}
  </Text>
);

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F9FAFB',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  body: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  statValue: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },
});
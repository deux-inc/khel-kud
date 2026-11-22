import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'highlight' | 'flat';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'default', ...rest }) => {
  return (
    <View style={[styles.base, styles[variant], style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 18,
    padding: 18,
    marginVertical: 6,
  },
  default: {
    backgroundColor: '#111827', // Deep slate
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  highlight: {
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  flat: {
    backgroundColor: '#0F172A',
    borderWidth: 0,
  },
});
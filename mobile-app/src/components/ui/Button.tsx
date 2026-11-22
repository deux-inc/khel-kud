import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  style,
  disabled,
  ...rest
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled}
      {...rest}
    >
      <Text style={[styles.textBase, styles[`${variant}Text` as keyof typeof styles], styles[`${size}Text` as keyof typeof styles]]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },
  // Sizes
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  md: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  lg: {
    paddingVertical: 18,
    paddingHorizontal: 28,
  },
  // Variants
  primary: {
    backgroundColor: '#10B981', // Athletic Emerald
  },
  success: {
    backgroundColor: '#059669',
  },
  secondary: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  danger: {
    backgroundColor: '#EF4444',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#4B5563',
  },
  // Text Styles
  textBase: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  smText: {
    fontSize: 13,
  },
  mdText: {
    fontSize: 16,
  },
  lgText: {
    fontSize: 18,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  successText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#E5E7EB',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#D1D5DB',
  },
});
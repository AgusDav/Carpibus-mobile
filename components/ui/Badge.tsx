import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'small' | 'medium';
}

export function Badge({
  text,
  variant = 'default',
  size = 'medium'
}: BadgeProps) {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return '#28a745';
      case 'warning':
        return '#ffc107';
      case 'danger':
        return '#dc3545';
      case 'info':
        return '#17a2b8';
      default:
        return '#6c757d';
    }
  };

  const getTextColor = () => {
    return variant === 'warning' ? '#000' : '#fff';
  };

  const getSizeStyle = () => {
    return size === 'small'
      ? { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }
      : { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 };
  };

  const getTextSize = () => {
    return size === 'small' ? 10 : 12;
  };

  return (
    <ThemedView
      style={[
        styles.badge,
        getSizeStyle(),
        { backgroundColor: getBackgroundColor() }
      ]}
    >
      <ThemedText
        style={[
          styles.text,
          {
            color: getTextColor(),
            fontSize: getTextSize()
          }
        ]}
      >
        {text}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
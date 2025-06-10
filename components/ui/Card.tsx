import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView, type ThemedViewProps } from '@/components/ThemedView';

interface CardProps extends ThemedViewProps {
  padding?: number;
  shadow?: boolean;
}

export function Card({
  children,
  style,
  padding = 16,
  shadow = true,
  ...props
}: CardProps) {
  return (
    <ThemedView
      style={[
        styles.card,
        { padding },
        shadow && styles.shadow,
        style,
      ]}
      {...props}
    >
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
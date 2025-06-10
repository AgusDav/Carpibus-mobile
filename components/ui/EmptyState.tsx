import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from './Button';
import { useThemeColor } from '@/hooks/useThemeColor';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'information-circle-outline',
  title,
  description,
  actionTitle,
  onAction,
}: EmptyStateProps) {
  const iconColor = useThemeColor({}, 'icon');

  return (
    <ThemedView style={styles.container}>
      <Ionicons name={icon} size={64} color={iconColor} />
      <ThemedText type="title" style={styles.title}>{title}</ThemedText>
      {description && (
        <ThemedText style={styles.description}>{description}</ThemedText>
      )}
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  button: {
    marginTop: 24,
    minWidth: 200,
  },
});
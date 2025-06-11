import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;
}

export function Input({
  label,
  error,
  required,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  // ✅ SOLUCIÓN: Usar useCallback para evitar re-creación de funciones
  const handleFocus = useCallback((e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  const handlePasswordToggle = useCallback(() => {
    setIsPasswordVisible(prev => !prev);
  }, []);

  const isPassword = secureTextEntry;
  const showPassword = isPassword && !isPasswordVisible;

  // ✅ SOLUCIÓN: Memoizar estilos para evitar recreación en cada render
  const inputContainerStyle = React.useMemo(() => [
    styles.inputContainer,
    isFocused && { borderColor: tintColor, shadowColor: tintColor },
    error && { borderColor: '#dc3545' },
  ], [isFocused, tintColor, error]);

  const inputStyle = React.useMemo(() => [
    styles.input,
    { color: textColor },
    style
  ], [textColor, style]);

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText style={styles.label}>
          {label}
          {required && <ThemedText style={[styles.required, { color: '#dc3545' }]}> *</ThemedText>}
        </ThemedText>
      )}

      <ThemedView style={inputContainerStyle}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={iconColor}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={inputStyle}
          secureTextEntry={showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={iconColor}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity onPress={handlePasswordToggle} style={styles.passwordToggle}>
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={iconColor}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons
              name={rightIcon}
              size={20}
              color={iconColor}
            />
          </TouchableOpacity>
        )}
      </ThemedView>

      {error && <ThemedText style={[styles.errorText, { color: '#dc3545' }]}>{error}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  required: {
    color: '#dc3545',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    minHeight: 48,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  leftIcon: {
    marginLeft: 12,
  },
  rightIcon: {
    marginRight: 12,
  },
  passwordToggle: {
    marginRight: 12,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
});
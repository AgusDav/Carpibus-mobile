import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

const SafeHeader = ({ children, style }) => {
  return (
    <View style={[styles.header, style]}>
      {children}
    </View>
  );
};

// Componente para botones táctiles seguros
export const SafeTouchable = ({ children, style, onPress, disabled, ...props }) => {
  return (
    <TouchableOpacity
      style={[styles.safeTouchable, style]}
      onPress={onPress}
      disabled={disabled}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  safeTouchable: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SafeHeader;
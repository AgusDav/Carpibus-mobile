import React from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SafeScreen = ({
  children,
  style,
  statusBarStyle = "dark-content",
  statusBarBackgroundColor = "#f8fafc",
  backgroundColor = "#f8fafc",
  includePaddingBottom = false
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: includePaddingBottom ? insets.bottom : 0,
          backgroundColor
        },
        style
      ]}
    >
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarBackgroundColor}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeScreen;
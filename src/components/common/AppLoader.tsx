import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../theme';

interface AppLoaderProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
}

const AppLoader: React.FC<AppLoaderProps> = ({
  size = 'large',
  color = Colors.blue,
  message,
  fullScreen = false,
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  message: {
    ...Typography.caption,
    color: Colors.gray500,
    marginTop: Spacing.md,
  },
});

export default React.memo(AppLoader);

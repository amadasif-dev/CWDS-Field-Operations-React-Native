import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '../../../theme';

const LoginHeader: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Shield size={48} color={Colors.blue} />
      </View>
      <Text style={styles.title}>CWDS Field</Text>
      <Text style={styles.subtitle}>Field Operations Portal</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.navy,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.gray500,
    marginTop: Spacing.xs,
  },
});

export default React.memo(LoginHeader);

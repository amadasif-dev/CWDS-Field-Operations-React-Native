import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '../../theme';
import AppButton from './AppButton';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        {icon ?? <Inbox size={48} color={Colors.gray300} />}
      </View>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <AppButton
          title={actionLabel}
          onPress={onAction}
          variant="outline"
          size="sm"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  iconWrapper: {
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h3,
    color: Colors.navy,
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    color: Colors.gray500,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  button: {
    marginTop: Spacing.xl,
  },
});

export default React.memo(EmptyState);

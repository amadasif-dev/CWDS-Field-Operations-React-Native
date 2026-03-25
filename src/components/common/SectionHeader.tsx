import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '../../theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.action}
          onPress={onAction}
          activeOpacity={0.7}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
          <ChevronRight size={16} color={Colors.blue} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  title: {
    ...Typography.h3,
    color: Colors.navy,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.gray500,
    marginTop: Spacing.xxs,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLabel: {
    ...Typography.captionBold,
    color: Colors.blue,
    marginRight: Spacing.xxs,
  },
});

export default React.memo(SectionHeader);

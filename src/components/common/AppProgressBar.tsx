import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

interface AppProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showLabel?: boolean;
  height?: number;
  style?: ViewStyle;
  backgroundColor?: string;
  fillColor?: string;
  completeColor?: string;
}

const AppProgressBar: React.FC<AppProgressBarProps> = ({
  current,
  total,
  label,
  showLabel = true,
  height = 6,
  style,
  backgroundColor = 'rgba(255,255,255,0.2)',
  fillColor = Colors.blue,
  completeColor = Colors.green,
}) => {
  const progress = Math.min(Math.max(current / total, 0), 1);
  const percentage = Math.round(progress * 100);
  const isComplete = current >= total;

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <Text style={styles.labelText}>
          {label || `${current} of ${total} completed`}
        </Text>
      )}
      <View style={[styles.progressBar, { height, backgroundColor }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
              backgroundColor: isComplete ? completeColor : fillColor,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  labelText: {
    ...Typography.caption,
    color: Colors.gray300,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  progressBar: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});

export default React.memo(AppProgressBar);

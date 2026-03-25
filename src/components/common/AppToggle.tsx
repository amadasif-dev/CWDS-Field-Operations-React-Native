import React, { useCallback } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../theme';

interface AppToggleProps {
  label?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const TRACK_WIDTH = 48;
const TRACK_HEIGHT = 28;
const THUMB_SIZE = 22;
const THUMB_MARGIN = 3;

const AppToggle: React.FC<AppToggleProps> = ({
  label,
  value,
  onValueChange,
  disabled = false,
}) => {
  const handlePress = useCallback(() => {
    if (!disabled) {
      onValueChange(!value);
    }
  }, [value, disabled, onValueChange]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled}>
      {label && (
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.track,
          value ? styles.trackActive : styles.trackInactive,
          disabled && styles.disabled,
        ]}>
        <View
          style={[
            styles.thumb,
            {
              transform: [
                {
                  translateX: value
                    ? TRACK_WIDTH - THUMB_SIZE - THUMB_MARGIN * 2
                    : 0,
                },
              ],
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  label: {
    ...Typography.body,
    color: Colors.navy,
    flex: 1,
    marginRight: Spacing.md,
  },
  labelDisabled: {
    color: Colors.gray500,
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    padding: THUMB_MARGIN,
    justifyContent: 'center',
  },
  trackActive: {
    backgroundColor: Colors.blue,
  },
  trackInactive: {
    backgroundColor: Colors.gray300,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: Colors.white,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default React.memo(AppToggle);

import React, { useCallback } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

interface AppCheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const AppCheckbox: React.FC<AppCheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
}) => {
  const handlePress = useCallback(() => {
    if (!disabled) {
      onChange(!checked);
    }
  }, [checked, disabled, onChange]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled}>
      <View
        style={[
          styles.box,
          checked && styles.boxChecked,
          disabled && styles.disabled,
        ]}>
        {checked && <Check size={14} color={Colors.white} strokeWidth={3} />}
      </View>
      {label && (
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  boxChecked: {
    backgroundColor: Colors.blue,
    borderColor: Colors.blue,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...Typography.body,
    color: Colors.navy,
    marginLeft: Spacing.md,
    flex: 1,
  },
  labelDisabled: {
    color: Colors.gray500,
  },
});

export default React.memo(AppCheckbox);

import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

interface AppInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  required?: boolean;
}

const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  required = false,
  secureTextEntry,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);
  const toggleSecure = useCallback(() => setIsSecure((prev) => !prev), []);

  const borderColor = error
    ? Colors.red
    : isFocused
      ? Colors.blue
      : Colors.gray300;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View style={[styles.inputWrapper, { borderColor }, inputStyle]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            (rightIcon || secureTextEntry) ? styles.inputWithRightIcon : undefined,
          ]}
          placeholderTextColor={Colors.gray500}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isSecure}
          {...rest}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={toggleSecure} style={styles.iconRight}>
            {isSecure ? (
              <EyeOff size={20} color={Colors.gray500} />
            ) : (
              <Eye size={20} color={Colors.gray500} />
            )}
          </TouchableOpacity>
        )}
        {rightIcon && !secureTextEntry && (
          <View style={styles.iconRight}>{rightIcon}</View>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.captionBold,
    color: Colors.gray700,
    marginBottom: Spacing.xs,
  },
  required: {
    color: Colors.red,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    minHeight: 48,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.navy,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  inputWithLeftIcon: {
    paddingLeft: Spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: Spacing.xs,
  },
  iconLeft: {
    paddingLeft: Spacing.md,
  },
  iconRight: {
    paddingRight: Spacing.md,
  },
  error: {
    ...Typography.small,
    color: Colors.red,
    marginTop: Spacing.xs,
  },
  hint: {
    ...Typography.small,
    color: Colors.gray500,
    marginTop: Spacing.xs,
  },
});

export default React.memo(AppInput);

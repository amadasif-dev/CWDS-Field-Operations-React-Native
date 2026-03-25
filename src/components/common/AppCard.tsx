import React from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Shadow } from '../../theme';

interface AppCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof Spacing;
}

const AppCard: React.FC<AppCardProps> = ({
  children,
  onPress,
  style,
  variant = 'default',
  padding = 'lg',
}) => {
  const cardStyle = [
    styles.base,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    { padding: Spacing[padding] },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
  },
  elevated: {
    ...Shadow.md,
  },
  outlined: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
});

export default React.memo(AppCard);

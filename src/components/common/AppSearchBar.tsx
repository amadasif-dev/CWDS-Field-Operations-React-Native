import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

interface AppSearchBarProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
  showClearButton?: boolean;
}

const AppSearchBar: React.FC<AppSearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  containerStyle,
  showClearButton = true,
  ...rest
}) => {
  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Search size={18} color={Colors.gray500} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={Colors.gray500}
        {...rest}
      />
      {showClearButton && value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <X size={16} color={Colors.gray500} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.gray700,
  },
  clearButton: {
    padding: Spacing.xs,
  },
});

export default React.memo(AppSearchBar);

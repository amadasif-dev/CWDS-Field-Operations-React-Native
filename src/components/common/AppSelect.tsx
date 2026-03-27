// components/common/AppSelect.tsx
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  TextInput,
  Platform,
} from 'react-native';
import {
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Search,
  X,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

interface AppSelectProps {
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  error?: string;
  style?: object;
}

const AppSelect: React.FC<AppSelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  label,
  required = false,
  disabled = false,
  searchable = false,
  error,
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const filteredOptions =
    searchable && searchText
      ? options.filter(opt =>
          opt.toLowerCase().includes(searchText.toLowerCase()),
        )
      : options;

  const handleSelect = useCallback(
    (option: string) => {
      onValueChange(option);
      setModalVisible(false);
      setSearchText('');
    },
    [onValueChange],
  );

  const handleClose = useCallback(() => {
    setModalVisible(false);
    setSearchText('');
  }, []);

  const selectedOption = value || '';

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.selectButton,
          disabled && styles.disabled,
          error && styles.error,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.selectText, !selectedOption && styles.placeholderText]}
          numberOfLines={1}
        >
          {selectedOption || placeholder}
        </Text>
        {modalVisible ? (
          <ChevronUp size={20} color={Colors.gray500} />
        ) : (
          <ChevronDown size={20} color={Colors.gray500} />
        )}
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {label || 'Select Option'}
                  </Text>
                  <TouchableOpacity
                    onPress={handleClose}
                    style={styles.closeButton}
                  >
                    <X size={20} color={Colors.gray700} />
                  </TouchableOpacity>
                </View>
                {searchable && (
                  <View style={styles.searchContainer}>
                    <Search
                      size={18}
                      color={Colors.gray500}
                      style={styles.searchIcon}
                    />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search..."
                      value={searchText}
                      onChangeText={setSearchText}
                      autoFocus
                    />
                    {searchText.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchText('')}>
                        <X size={16} color={Colors.gray500} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                <FlatList
                  data={filteredOptions}
                  keyExtractor={(item, index) => `${item}-${index}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.optionItem,
                        item === selectedOption && styles.optionItemSelected,
                      ]}
                      onPress={() => handleSelect(item)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          item === selectedOption && styles.optionTextSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {item}
                      </Text>
                      {item === selectedOption && (
                        <CheckCheck size={20} color={Colors.green} />
                      )}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No options found</Text>
                    </View>
                  }
                  contentContainerStyle={styles.optionsList}
                  showsVerticalScrollIndicator={true}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelContainer: {
    marginBottom: Spacing.xs,
  },
  label: {
    ...Typography.captionBold,
    color: Colors.gray700,
  },
  required: {
    color: Colors.red,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    minHeight: 48,
  },
  disabled: {
    backgroundColor: Colors.gray100,
    opacity: 0.7,
  },
  error: {
    borderColor: Colors.red,
  },
  selectText: {
    ...Typography.body,
    color: Colors.gray700,
    flex: 1,
  },
  placeholderText: {
    color: Colors.gray500,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.red,
    marginTop: Spacing.xxs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.navy,
    fontSize: 18,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray100,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.sm,
    ...Typography.body,
    color: Colors.gray700,
  },
  optionsList: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.xxs,
  },
  optionItemSelected: {
    backgroundColor: Colors.greenLight,
  },
  optionText: {
    ...Typography.body,
    color: Colors.gray700,
    flex: 1,
  },
  optionTextSelected: {
    color: Colors.blue,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.gray500,
  },
});

export default AppSelect;

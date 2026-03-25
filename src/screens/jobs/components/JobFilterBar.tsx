import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';

interface JobFilterBarProps {
  active: string;
  onFilterChange: (filter: string) => void;
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
];

const JobFilterBar: React.FC<JobFilterBarProps> = ({ active, onFilterChange }) => {
  const renderChip = useCallback(
    (filter: { key: string; label: string }) => {
      const isActive = active === filter.key;
      return (
        <TouchableOpacity
          key={filter.key}
          style={[styles.chip, isActive && styles.chipActive]}
          onPress={() => onFilterChange(filter.key)}
          activeOpacity={0.7}>
          <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      );
    },
    [active, onFilterChange],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {FILTERS.map(renderChip)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  chipActive: {
    backgroundColor: Colors.blue,
    borderColor: Colors.blue,
  },
  chipText: {
    ...Typography.captionBold,
    color: Colors.gray700,
  },
  chipTextActive: {
    color: Colors.white,
  },
});

export default React.memo(JobFilterBar);

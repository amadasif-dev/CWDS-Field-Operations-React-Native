import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setStepData } from '../../../store/slices/attendanceSlice';
import {
  AppButton,
  AppCheckbox,
  AppCard,
  BottomSheetAlert,
} from '../../../components';
import { Colors, Typography, Spacing } from '../../../theme';

interface StepSafetyChecklistProps {
  onNext: () => void;
  onPrev: () => void;
}

const SAFETY_ITEMS = [
  { id: 'area_secured', label: 'Work area secured and marked' },
  { id: 'fire_exits', label: 'Fire exits identified and accessible' },
  { id: 'first_aid', label: 'First aid kit available nearby' },
  { id: 'electrical', label: 'Electrical hazards assessed' },
  { id: 'ventilation', label: 'Proper ventilation confirmed' },
  { id: 'emergency_contacts', label: 'Emergency contacts accessible' },
  { id: 'signage', label: 'Warning signage in place' },
];

const StepSafetyChecklist: React.FC<StepSafetyChecklistProps> = ({
  onNext,
  onPrev,
}) => {
  const dispatch = useAppDispatch();
  const stepData = useAppSelector(state => state.attendance.stepData[4]);

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
    (stepData?.checkedItems as Record<string, boolean>) ?? {},
  );

  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  const toggleItem = useCallback((id: string, checked: boolean) => {
    setCheckedItems(prev => ({ ...prev, [id]: checked }));
  }, []);

  const allChecked = SAFETY_ITEMS.every(item => checkedItems[item.id]);

  const handleNext = useCallback(() => {
    if (!allChecked) {
      setValidationMessage(
        'All safety checks must be completed before proceeding.',
      );
      setShowValidationAlert(true);
      return;
    }

    dispatch(
      setStepData({
        step: 4,
        data: {
          checkedItems,
          safetyCompleted: true,
        },
      }),
    );
    onNext();
  }, [
    allChecked,
    checkedItems,
    dispatch,
    onNext,
    setShowValidationAlert,
    setValidationMessage,
  ]);

  const checkedCount = SAFETY_ITEMS.filter(
    item => checkedItems[item.id],
  ).length;

  const handleValidationClose = useCallback(() => {
    setShowValidationAlert(false);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Safety Checklist</Text>
      <Text style={styles.subtitle}>
        Complete all safety requirements before starting work.
      </Text>

      <View style={styles.progressInfo}>
        <Text style={styles.progressText}>
          {checkedCount} of {SAFETY_ITEMS.length} completed
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(checkedCount / SAFETY_ITEMS.length) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      <AppCard variant="outlined" padding="lg" style={styles.card}>
        <View style={styles.cardHeader}>
          <ShieldCheck size={18} color={Colors.green} />
          <Text style={styles.cardTitle}>Safety Requirements</Text>
        </View>
        <View style={styles.checklist}>
          {SAFETY_ITEMS.map(item => (
            <AppCheckbox
              key={item.id}
              label={item.label}
              checked={checkedItems[item.id] ?? false}
              onChange={checked => toggleItem(item.id, checked)}
            />
          ))}
        </View>
      </AppCard>

      <View style={styles.actions}>
        <AppButton
          title="Previous"
          onPress={onPrev}
          variant="outline"
          style={styles.actionBtn}
        />
        <AppButton title="Next" onPress={handleNext} style={styles.actionBtn} />
      </View>

      <BottomSheetAlert
        visible={showValidationAlert}
        type="warning"
        title="Validation Error"
        message={validationMessage}
        primaryLabel="OK"
        onClose={handleValidationClose}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
  title: {
    ...Typography.h2,
    color: Colors.navy,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.gray500,
    marginBottom: Spacing.xl,
  },
  progressInfo: {
    marginBottom: Spacing.xl,
  },
  progressText: {
    ...Typography.captionBold,
    color: Colors.gray700,
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.gray100,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.green,
    borderRadius: 3,
  },
  card: {
    marginBottom: Spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.bodyBold,
    color: Colors.navy,
  },
  checklist: {
    gap: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionBtn: {
    flex: 1,
  },
});

export default React.memo(StepSafetyChecklist);

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setStepData } from '../../../store/slices/attendanceSlice';
import {
  AppButton,
  AppInput,
  AppCard,
  BottomSheetAlert,
} from '../../../components';
import { Colors, Typography, Spacing } from '../../../theme';

interface StepSiteAssessmentProps {
  onNext: () => void;
  onPrev: () => void;
}

const CONDITION_OPTIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Hazardous'];

const StepSiteAssessment: React.FC<StepSiteAssessmentProps> = ({
  onNext,
  onPrev,
}) => {
  const dispatch = useAppDispatch();
  const stepData = useAppSelector(state => state.attendance.stepData[2]);

  const [siteCondition, setSiteCondition] = useState(
    (stepData?.siteCondition as string) ?? '',
  );
  const [accessNotes, setAccessNotes] = useState(
    (stepData?.accessNotes as string) ?? '',
  );
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [hazards, setHazards] = useState((stepData?.hazards as string) ?? '');

  const handleNext = useCallback(() => {
    if (!siteCondition) {
      setValidationMessage('Please select a site condition.');
      setShowValidationAlert(true);
      return;
    }
    if (!accessNotes.trim()) {
      setValidationMessage('Please provide access notes.');
      setShowValidationAlert(true);
      return;
    }

    dispatch(
      setStepData({
        step: 2,
        data: { siteCondition, accessNotes, hazards },
      }),
    );
    onNext();
  }, [
    siteCondition,
    accessNotes,
    hazards,
    dispatch,
    onNext,
    setShowValidationAlert,
    setValidationMessage,
  ]);

  const handleValidationClose = useCallback(() => {
    setShowValidationAlert(false);
  }, []);
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Site Assessment</Text>
      <Text style={styles.subtitle}>Assess the current site conditions.</Text>

      <Text style={styles.label}>Site Condition *</Text>
      <View style={styles.optionsRow}>
        {CONDITION_OPTIONS.map(option => (
          <AppCard
            key={option}
            onPress={() => setSiteCondition(option)}
            variant={siteCondition === option ? 'elevated' : 'outlined'}
            padding="md"
            style={
              siteCondition === option
                ? [styles.optionCard, styles.optionActive]
                : styles.optionCard
            }
          >
            <Text
              style={[
                styles.optionText,
                siteCondition === option && styles.optionTextActive,
              ]}
            >
              {option}
            </Text>
          </AppCard>
        ))}
      </View>

      <AppInput
        label="Access Notes"
        placeholder="Describe site access details..."
        value={accessNotes}
        onChangeText={setAccessNotes}
        multiline
        numberOfLines={3}
        required
      />

      <AppInput
        label="Hazards Identified"
        placeholder="Describe any hazards (optional)"
        value={hazards}
        onChangeText={setHazards}
        multiline
        numberOfLines={3}
      />

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
  label: {
    ...Typography.captionBold,
    color: Colors.gray700,
    marginBottom: Spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  optionCard: {
    minWidth: 80,
    alignItems: 'center',
  },
  optionActive: {
    borderColor: Colors.blue,
    borderWidth: 2,
    backgroundColor: `${Colors.blue}08`,
  },
  optionText: {
    ...Typography.captionBold,
    color: Colors.gray700,
  },
  optionTextActive: {
    color: Colors.blue,
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

export default React.memo(StepSiteAssessment);

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setStepData } from '../../../store/slices/attendanceSlice';
import { AppButton, AppInput, BottomSheetAlert } from '../../../components';
import { Colors, Typography, Spacing } from '../../../theme';

interface StepWorkDocumentationProps {
  onNext: () => void;
  onPrev: () => void;
}

const StepWorkDocumentation: React.FC<StepWorkDocumentationProps> = ({
  onNext,
  onPrev,
}) => {
  const dispatch = useAppDispatch();
  const stepData = useAppSelector(state => state.attendance.stepData[5]);

  const [workDescription, setWorkDescription] = useState(
    (stepData?.workDescription as string) ?? '',
  );
  const [materialsUsed, setMaterialsUsed] = useState(
    (stepData?.materialsUsed as string) ?? '',
  );
  const [issuesFound, setIssuesFound] = useState(
    (stepData?.issuesFound as string) ?? '',
  );
  const [recommendations, setRecommendations] = useState(
    (stepData?.recommendations as string) ?? '',
  );

  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  const handleNext = useCallback(() => {
    if (!workDescription.trim()) {
      setValidationMessage('Work description is required.');
      setShowValidationAlert(true);
      return;
    }

    dispatch(
      setStepData({
        step: 5,
        data: {
          workDescription,
          materialsUsed,
          issuesFound,
          recommendations,
        },
      }),
    );
    onNext();
  }, [
    workDescription,
    materialsUsed,
    issuesFound,
    recommendations,
    dispatch,
    onNext,
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
      <Text style={styles.title}>Work Documentation</Text>
      <Text style={styles.subtitle}>
        Document the work performed during this job.
      </Text>

      <AppInput
        label="Work Description"
        placeholder="Describe the work performed in detail..."
        value={workDescription}
        onChangeText={setWorkDescription}
        multiline
        numberOfLines={5}
        required
      />

      <AppInput
        label="Materials Used"
        placeholder="List any materials or parts used..."
        value={materialsUsed}
        onChangeText={setMaterialsUsed}
        multiline
        numberOfLines={3}
      />

      <AppInput
        label="Issues Found"
        placeholder="Describe any issues encountered..."
        value={issuesFound}
        onChangeText={setIssuesFound}
        multiline
        numberOfLines={3}
      />

      <AppInput
        label="Recommendations"
        placeholder="Any follow-up recommendations..."
        value={recommendations}
        onChangeText={setRecommendations}
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionBtn: {
    flex: 1,
  },
});

export default React.memo(StepWorkDocumentation);

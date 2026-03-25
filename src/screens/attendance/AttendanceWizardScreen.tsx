import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, BackHandler } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  initAttendance,
  loadDraft,
  saveDraftLocal,
  nextStep,
  prevStep,
  clearAttendance,
} from '../../store/slices/attendanceSlice';
import { Colors, Spacing } from '../../theme';
import { StepProgressBar, AppLoader } from '../../components';
import type { RootStackScreenProps } from '../../types/navigation';
import StepJobConfirmation from './steps/StepJobConfirmation';
import StepSiteAssessment from './steps/StepSiteAssessment';
import StepEquipmentCheck from './steps/StepEquipmentCheck';
import StepSafetyChecklist from './steps/StepSafetyChecklist';
import StepPhotoEvidence from './steps/StepPhotoEvidence';
import StepClientSignature from './steps/StepClientSignature';
import StepSummary from './steps/StepSummary';
import StepWorkDocumentation from './steps/StepWorkDocumentation';

type Props = RootStackScreenProps<'AttendanceWizard'>;

const STEP_LABELS = [
  'Confirm',
  'Site',
  'Equip',
  'Safety',
  'Work',
  'Photos',
  'Sign',
  'Submit',
];

const AttendanceWizardScreen: React.FC<Props> = ({ route, navigation }) => {
  const { jobId, draftId } = route.params;
  const dispatch = useAppDispatch();
  const { currentStep, isDraft, isSubmitting } = useAppSelector(
    (state) => state.attendance,
  );

  useEffect(() => {
    dispatch(initAttendance(jobId));
    if (draftId) {
      dispatch(loadDraft(jobId));
    }
  }, [dispatch, jobId, draftId]);

  // Handle back button — prompt to save draft
  useEffect(() => {
    const onBackPress = () => {
      if (isDraft) {
        Alert.alert(
          'Save Draft?',
          'You have unsaved progress. Would you like to save a draft?',
          [
            {
              text: 'Discard',
              style: 'destructive',
              onPress: () => {
                dispatch(clearAttendance());
                navigation.goBack();
              },
            },
            {
              text: 'Save Draft',
              onPress: async () => {
                await dispatch(saveDraftLocal(jobId));
                navigation.goBack();
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ],
        );
        return true;
      }
      dispatch(clearAttendance());
      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    navigation.setOptions({
      headerLeft: () => null,
      gestureEnabled: false,
    });

    return () => subscription.remove();
  }, [dispatch, navigation, isDraft, jobId]);

  const handleNext = useCallback(() => {
    dispatch(nextStep());
  }, [dispatch]);

  const handlePrev = useCallback(() => {
    dispatch(prevStep());
  }, [dispatch]);

  const handleSaveDraft = useCallback(async () => {
    await dispatch(saveDraftLocal(jobId));
    Alert.alert('Draft Saved', 'Your progress has been saved.');
  }, [dispatch, jobId]);

  if (isSubmitting) {
    return <AppLoader fullScreen message="Submitting report..." />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepJobConfirmation jobId={jobId} onNext={handleNext} />;
      case 2:
        return (
          <StepSiteAssessment onNext={handleNext} onPrev={handlePrev} />
        );
      case 3:
        return (
          <StepEquipmentCheck onNext={handleNext} onPrev={handlePrev} />
        );
      case 4:
        return (
          <StepSafetyChecklist onNext={handleNext} onPrev={handlePrev} />
        );
      case 5:
        return (
          <StepWorkDocumentation onNext={handleNext} onPrev={handlePrev} />
        );
      case 6:
        return (
          <StepPhotoEvidence onNext={handleNext} onPrev={handlePrev} />
        );
      case 7:
        return (
          <StepClientSignature onNext={handleNext} onPrev={handlePrev} />
        );
      case 8:
        return <StepSummary jobId={jobId} onPrev={handlePrev} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StepProgressBar
        currentStep={currentStep}
        totalSteps={8}
        labels={STEP_LABELS}
      />
      <View style={styles.content}>{renderStep()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  content: {
    flex: 1,
  },
});

export default AttendanceWizardScreen;

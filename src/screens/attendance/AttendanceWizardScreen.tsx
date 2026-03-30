// AttendanceWizardScreen.tsx - 8-Step Wizard Implementation
import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, BackHandler, TouchableOpacity } from 'react-native';
import { Save, ArrowLeft } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  initAttendance,
  loadDraft,
  saveDraftLocal,
  fetchAttendanceForm,
  nextStep,
  prevStep,
  clearAttendance,
} from '../../store/slices/attendanceSlice';
import { Colors, Spacing, Typography } from '../../theme';
import { StepProgressBar, AppLoader } from '../../components';
import type { RootStackScreenProps } from '../../types/navigation';
import StepOHSDeclaration from './steps/StepOHSDeclaration';
import StepJSA from './steps/StepJSA';
import StepArrivalCheckIn from './steps/StepArrivalCheckIn';
import StepRoomInspection from './steps/StepRoomInspection';
import StepConsumablesChecklist from './steps/StepConsumablesChecklist';
import StepForm2Signing from './steps/StepForm2Signing';
import StepDepartureTime from './steps/StepDepartureTime';
import StepSummary from './steps/StepSummary';

type Props = RootStackScreenProps<'AttendanceWizard'>;

const STEP_LABELS = [
  'OH&S',
  'JSA',
  'Arrival',
  'Rooms',
  'Consumables',
  'Form 2',
  'Departure',
  'Submit',
];

const AttendanceWizardScreen: React.FC<Props> = ({ route, navigation }) => {
  const { jobId, draftId } = route.params;
  const dispatch = useAppDispatch();
  const { currentStep, isDraft, isSubmitting, isLoadingForm } = useAppSelector(
    (state) => state.attendance,
  );

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

  useEffect(() => {
    dispatch(initAttendance(jobId));
    if (draftId) {
      dispatch(loadDraft(jobId));
    } else {
      dispatch(fetchAttendanceForm({ jobId }));
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
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => onBackPress()}
          style={styles.headerBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ArrowLeft size={22} color={Colors.navy} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSaveDraft}
          style={styles.headerDraftBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Save size={18} color={Colors.blue} />
          <Text style={styles.headerDraftText}>Save Draft</Text>
        </TouchableOpacity>
      ),
      gestureEnabled: false,
    });

    return () => subscription.remove();
  }, [dispatch, navigation, isDraft, jobId, handleSaveDraft]);

  if (isLoadingForm) {
    return <AppLoader fullScreen message="Loading attendance form..." />;
  }

  if (isSubmitting) {
    return <AppLoader fullScreen message="Submitting report..." />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepOHSDeclaration jobId={jobId} onNext={handleNext} />;
      case 2:
        return <StepJSA onNext={handleNext} onPrev={handlePrev} />;
      case 3:
        return <StepArrivalCheckIn onNext={handleNext} onPrev={handlePrev} />;
      case 4:
        return <StepRoomInspection onNext={handleNext} onPrev={handlePrev} />;
      case 5:
        return <StepConsumablesChecklist onNext={handleNext} onPrev={handlePrev} />;
      case 6:
        return <StepForm2Signing onNext={handleNext} onPrev={handlePrev} />;
      case 7:
        return <StepDepartureTime onNext={handleNext} onPrev={handlePrev} />;
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
  headerBtn: {
    padding: Spacing.xs,
  },
  headerDraftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.xs,
  },
  headerDraftText: {
    ...Typography.captionBold,
    color: Colors.blue,
  },
});

export default AttendanceWizardScreen;
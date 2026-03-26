import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { MapPin, Clock, CheckCircle } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setStepData } from '../../../store/slices/attendanceSlice';
import {
  AppButton,
  AppCheckbox,
  AppCard,
  BottomSheetAlert,
} from '../../../components';
import { Colors, Typography, Spacing } from '../../../theme';

interface StepJobConfirmationProps {
  jobId: string;
  onNext: () => void;
}

const StepJobConfirmation: React.FC<StepJobConfirmationProps> = ({
  jobId,
  onNext,
}) => {
  const dispatch = useAppDispatch();
  const stepData = useAppSelector(state => state.attendance.stepData[1]);

  const [confirmed, setConfirmed] = useState(
    (stepData?.confirmed as boolean) ?? false,
  );
  const [arrivedOnSite, setArrivedOnSite] = useState(
    (stepData?.arrivedOnSite as boolean) ?? false,
  );
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  const handleNext = useCallback(() => {
    if (!confirmed) {
      setValidationMessage('You must confirm the job details.');
      setShowValidationAlert(true);
      return;
    }
    if (!arrivedOnSite) {
      setValidationMessage('You must confirm arrival on site.');
      setShowValidationAlert(true);
      return;
    }

    dispatch(
      setStepData({
        step: 1,
        data: {
          confirmed,
          arrivedOnSite,
          arrivalTime: new Date().toISOString(),
        },
      }),
    );
    onNext();
  }, [
    confirmed,
    arrivedOnSite,
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
      <Text style={styles.title}>Job Confirmation</Text>
      <Text style={styles.subtitle}>
        Verify job details and confirm your arrival on site.
      </Text>

      <AppCard variant="outlined" padding="lg" style={styles.card}>
        <View style={styles.infoRow}>
          <MapPin size={16} color={Colors.blue} />
          <Text style={styles.infoText}>123 Main St, Suite 100</Text>
        </View>
        <View style={styles.infoRow}>
          <Clock size={16} color={Colors.blue} />
          <Text style={styles.infoText}>Scheduled: 09:00 AM</Text>
        </View>
      </AppCard>

      <View style={styles.checkboxes}>
        <AppCheckbox
          label="I confirm the job details are correct"
          checked={confirmed}
          onChange={setConfirmed}
        />
        <AppCheckbox
          label="I have arrived on site"
          checked={arrivedOnSite}
          onChange={setArrivedOnSite}
        />
      </View>

      <View style={styles.actions}>
        <AppButton title="Next" onPress={handleNext} fullWidth size="lg" />
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
  card: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoText: {
    ...Typography.body,
    color: Colors.gray700,
  },
  checkboxes: {
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  actions: {
    gap: Spacing.md,
  },
});

export default React.memo(StepJobConfirmation);

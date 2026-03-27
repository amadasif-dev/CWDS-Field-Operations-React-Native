import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import {
  CheckCircle,
  Shield,
  FileText,
  Clock,
  MapPin,
  Package,
  PenTool,
  Camera,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  submitAttendance,
  clearAttendance,
} from '../../../store/slices/attendanceSlice';
import { AppButton, AppCard } from '../../../components';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import BottomSheetAlert from '../../../components/common/BottomSheetAlert';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';

interface StepSummaryProps {
  jobId: string;
  onPrev: () => void;
}

const StepSummary: React.FC<StepSummaryProps> = ({ jobId, onPrev }) => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { stepData, photos, rooms, consumables, signature, isSubmitting } = useAppSelector(
    state => state.attendance,
  );

  const jobDetails = useAppSelector(state => state.jobs.selectedJob);

  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const summaryItems = useMemo(() => [
    {
      icon: <Shield size={18} color={Colors.navy} />,
      title: 'OH&S Declaration',
      status: stepData[1]?.allChecked ? 'All items acknowledged' : 'Incomplete',
      complete: !!stepData[1]?.allChecked,
    },
    {
      icon: <FileText size={18} color={Colors.blue} />,
      title: 'JSA Review',
      status: stepData[2]?.technicianSignature ? 'Reviewed & signed' : 'Incomplete',
      complete: !!stepData[2]?.technicianSignature,
    },
    {
      icon: <Clock size={18} color={Colors.green} />,
      title: 'Arrival Check-in',
      status: stepData[3]?.confirmed
        ? `Arrived: ${stepData[3]?.arrivalTime
            ? new Date(stepData[3].arrivalTime as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : ''}`
        : 'Not confirmed',
      complete: !!stepData[3]?.confirmed,
    },
    {
      icon: <MapPin size={18} color={Colors.gold} />,
      title: 'Room Inspection',
      status: rooms.length > 0
        ? `${rooms.filter(r => r.status === 'complete').length} of ${rooms.length} rooms complete`
        : 'No rooms inspected',
      complete: rooms.length > 0 && rooms.every(r => r.status === 'complete'),
    },
    {
      icon: <Package size={18} color={Colors.accent} />,
      title: 'Consumables',
      status: Object.keys(consumables).length > 0
        ? `${Object.values(consumables).reduce((a, b) => a + b, 0)} items logged`
        : 'None logged',
      complete: true, // Optional step
    },
    {
      icon: <PenTool size={18} color={Colors.navy} />,
      title: 'Form 2 Signing',
      status: stepData[6]?.skipped
        ? 'Not required'
        : stepData[6]?.clientSignature
          ? 'Signed'
          : 'Incomplete',
      complete: stepData[6]?.skipped || !!stepData[6]?.clientSignature,
    },
    {
      icon: <Clock size={18} color={Colors.green} />,
      title: 'Departure Time',
      status: stepData[7]?.confirmed
        ? `${stepData[7]?.totalHours || 0} hrs on site`
        : 'Not confirmed',
      complete: !!stepData[7]?.confirmed,
    },
  ], [stepData, rooms, consumables]);

  const allComplete = summaryItems.every(item => item.complete);

  const handleSubmitConfirm = useCallback(async () => {
    setShowSubmitConfirmation(false);
    try {
      await dispatch(submitAttendance(jobId)).unwrap();
      // Show success alert
      setShowSuccessAlert(true);
    } catch (error: any) {
      setErrorMessage(
        error?.message || 'Failed to submit report. Please try again.',
      );
      setShowErrorAlert(true);
    }
  }, [dispatch, jobId]);

  const handleSuccessClose = useCallback(() => {
    setShowSuccessAlert(false);
    dispatch(clearAttendance());
    navigation.goBack();
  }, [dispatch, navigation]);

  const handleErrorClose = useCallback(() => {
    setShowErrorAlert(false);
    setErrorMessage('');
  }, []);

  const handleSubmitPress = useCallback(() => {
    if (!allComplete) {
      setErrorMessage(
        'Some steps are incomplete. Please go back and complete all required steps before submitting.',
      );
      setShowErrorAlert(true);
      return;
    }
    setShowSubmitConfirmation(true);
  }, [allComplete]);

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Summary & Submit</Text>
        <Text style={styles.subtitle}>
          Review your attendance report before submitting.
        </Text>

        <View style={styles.summaryList}>
          {summaryItems.map((item, index) => (
            <AppCard
              key={index}
              variant="outlined"
              padding="md"
              style={styles.summaryItem}
            >
              <View style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  {item.icon}
                  <View style={styles.summaryContent}>
                    <Text style={styles.summaryTitle}>{item.title}</Text>
                    <Text
                      style={[
                        styles.summaryStatus,
                        item.complete
                          ? styles.statusComplete
                          : styles.statusIncomplete,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
                <CheckCircle
                  size={20}
                  color={item.complete ? Colors.green : Colors.gray300}
                />
              </View>
            </AppCard>
          ))}
        </View>

        {!allComplete && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              Some steps are incomplete. Please go back and complete all
              required steps before submitting.
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <AppButton
            title="Previous"
            onPress={onPrev}
            variant="outline"
            style={styles.actionBtn}
          />
          <AppButton
            title="Submit Report"
            onPress={handleSubmitPress}
            variant={allComplete ? 'primary' : 'secondary'}
            disabled={!allComplete || isSubmitting}
            loading={isSubmitting}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>

      <ConfirmationModal
        visible={showSubmitConfirmation}
        onClose={() => setShowSubmitConfirmation(false)}
        onConfirm={handleSubmitConfirm}
        title="Submit Report"
        message="Are you sure you want to submit this attendance report? This action cannot be undone."
        confirmText="Submit"
        cancelText="Cancel"
        type="warning"
        showDetails={true}
      />

      <BottomSheetAlert
        visible={showSuccessAlert}
        type="success"
        title="Success!"
        message="Attendance report submitted successfully."
        primaryLabel="OK"
        onClose={handleSuccessClose}
      />

      <BottomSheetAlert
        visible={showErrorAlert}
        type="error"
        title="Error"
        message={errorMessage}
        primaryLabel="OK"
        onClose={handleErrorClose}
      />
    </>
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
  summaryList: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  summaryItem: {
    marginBottom: 0,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    ...Typography.bodyBold,
    color: Colors.navy,
  },
  summaryStatus: {
    ...Typography.caption,
    marginTop: Spacing.xxs,
  },
  statusComplete: {
    color: Colors.green,
  },
  statusIncomplete: {
    color: Colors.red,
  },
  warning: {
    backgroundColor: Colors.redLight,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  warningText: {
    ...Typography.caption,
    color: Colors.red,
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

export default React.memo(StepSummary);

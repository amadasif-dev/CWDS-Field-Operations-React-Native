import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {
  CheckCircle,
  Shield,
  FileText,
  Clock,
  MapPin,
  Package,
  PenTool,
  Camera,
  AlertTriangle,
  Wrench,
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
  const { stepData, photos, rooms, consumables, signature, isSubmitting } =
    useAppSelector(state => state.attendance);

  const jobDetails = useAppSelector(state => state.jobs.selectedJob);

  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const arrivalTime = stepData[3]?.arrivalTime as string | undefined;
  const departureTime = stepData[7]?.departureTime as string | undefined;
  const totalHours = stepData[7]?.totalHours as number | undefined;

  const roomsCompleted = rooms.filter(r => r.status === 'complete').length;
  const totalRooms = rooms.length;

  const equipmentCount = useMemo(() => {
    let count = 0;
    rooms.forEach(room => {
      if (room.data?.equipment) {
        room.data.equipment.forEach((eq: { quantity: number }) => {
          count += eq.quantity;
        });
      }
    });
    return count;
  }, [rooms]);

  const consumablesCount = useMemo(() => {
    return Object.values(consumables).reduce((a, b) => a + b, 0);
  }, [consumables]);

  const photoCount = useMemo(() => {
    let count = photos.length;
    rooms.forEach(room => {
      if (room.data?.overviewPhotos) {
        count += room.data.overviewPhotos.length;
      }
      if (room.data?.confirmationPhoto) {
        count += 1;
      }
      if (room.data?.surfaces) {
        const surfaces = room.data.surfaces;
        if (surfaces.ceiling?.moisturePhoto) count += 1;
        if (surfaces.walls?.moisturePhoto) count += 1;
        if (surfaces.flooring?.moisturePhoto) count += 1;
      }
      if (room.data?.moistureMap?.savedImage) {
        count += 1;
      }
    });
    return count;
  }, [photos, rooms]);

  const summaryChecks = useMemo(() => [
    {
      icon: <Shield size={18} color={Colors.navy} />,
      title: 'OH&S Declaration',
      status: stepData[1]?.allChecked
        ? 'All items acknowledged'
        : 'Incomplete',
      complete: !!stepData[1]?.allChecked,
    },
    {
      icon: <FileText size={18} color={Colors.blue} />,
      title: 'JSA Signed',
      status: stepData[2]?.technicianSignature
        ? 'Reviewed & signed'
        : 'Signature missing',
      complete: !!stepData[2]?.technicianSignature,
    },
    {
      icon: <Clock size={18} color={Colors.green} />,
      title: 'Arrival Check-in',
      status: stepData[3]?.confirmed
        ? `Arrived: ${
            arrivalTime
              ? new Date(arrivalTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''
          }`
        : 'Not confirmed',
      complete: !!stepData[3]?.confirmed,
    },
    {
      icon: <MapPin size={18} color={Colors.gold} />,
      title: 'Room Inspection',
      status:
        totalRooms > 0
          ? `${roomsCompleted} of ${totalRooms} rooms complete`
          : 'No rooms inspected',
      complete: totalRooms > 0 && roomsCompleted === totalRooms,
    },
    {
      icon: <Package size={18} color={Colors.accent} />,
      title: 'Consumables',
      status:
        consumablesCount > 0
          ? `${consumablesCount} items logged`
          : 'None logged',
      complete: true,
    },
    {
      icon: <PenTool size={18} color={Colors.navy} />,
      title: 'Form 2',
      status: stepData[6]?.skipped
        ? 'Not required'
        : stepData[6]?.clientSignature
          ? 'Signed'
          : 'Incomplete',
      complete: !!stepData[6]?.skipped || !!stepData[6]?.clientSignature,
    },
    {
      icon: <Clock size={18} color={Colors.green} />,
      title: 'Departure Time',
      status: stepData[7]?.confirmed
        ? `${totalHours || 0} hrs on site`
        : 'Not confirmed',
      complete: !!stepData[7]?.confirmed,
    },
  ], [stepData, rooms, consumables, arrivalTime, totalHours, totalRooms, roomsCompleted, consumablesCount]);

  const blockingWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (!stepData[2]?.technicianSignature) {
      warnings.push('JSA signature is missing');
    }
    if (totalRooms > 0 && roomsCompleted < totalRooms) {
      warnings.push(`${totalRooms - roomsCompleted} room(s) not fully completed`);
    }
    if (!stepData[6]?.skipped && !stepData[6]?.clientSignature) {
      warnings.push('Form 2 signatures missing');
    }
    if (!stepData[7]?.confirmed) {
      warnings.push('Departure time not confirmed');
    }
    return warnings;
  }, [stepData, totalRooms, roomsCompleted]);

  const allComplete = summaryChecks.every(item => item.complete);

  const formatTimeShort = (isoString?: string) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmitConfirm = useCallback(async () => {
    setShowSubmitConfirmation(false);
    setShowUploadProgress(true);
    try {
      await dispatch(submitAttendance(jobId)).unwrap();
      setShowUploadProgress(false);
      setShowSuccessScreen(true);
    } catch (error: any) {
      setShowUploadProgress(false);
      setErrorMessage(
        error?.message || 'Failed to submit attendance. Please try again.',
      );
      setShowErrorAlert(true);
    }
  }, [dispatch, jobId]);

  const handleSuccessDismiss = useCallback(() => {
    setShowSuccessScreen(false);
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
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Review & Submit Attendance</Text>
        <Text style={styles.subtitle}>
          Review your attendance report before submitting.
        </Text>

        {/* Job Info Card */}
        <AppCard variant="elevated" padding="lg" style={styles.jobInfoCard}>
          <Text style={styles.jobNumber}>{jobId}</Text>
          <Text style={styles.jobAddress}>
            {jobDetails?.address || 'Address not available'}
          </Text>
          <Text style={styles.jobDate}>
            {new Date().toLocaleDateString('en-AU', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </AppCard>

        {/* Time Summary Card */}
        <AppCard variant="outlined" padding="lg" style={styles.timeCard}>
          <View style={styles.timeRow}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Arrival</Text>
              <Text style={styles.timeValue}>
                {formatTimeShort(arrivalTime)}
              </Text>
            </View>
            <Text style={styles.timeArrow}>→</Text>
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Departure</Text>
              <Text style={styles.timeValue}>
                {formatTimeShort(departureTime)}
              </Text>
            </View>
            <Text style={styles.timeArrow}>→</Text>
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Total</Text>
              <Text style={styles.timeValueHighlight}>
                {totalHours ?? '--'} hrs
              </Text>
            </View>
          </View>
        </AppCard>

        {/* Counts Row */}
        <View style={styles.countsRow}>
          <AppCard variant="outlined" padding="md" style={styles.countCard}>
            <MapPin size={18} color={Colors.green} />
            <Text style={styles.countValue}>{roomsCompleted}</Text>
            <Text style={styles.countLabel}>Rooms</Text>
          </AppCard>
          <AppCard variant="outlined" padding="md" style={styles.countCard}>
            <Wrench size={18} color={Colors.blue} />
            <Text style={styles.countValue}>{equipmentCount}</Text>
            <Text style={styles.countLabel}>Equipment</Text>
          </AppCard>
          <AppCard variant="outlined" padding="md" style={styles.countCard}>
            <Package size={18} color={Colors.orange} />
            <Text style={styles.countValue}>{consumablesCount}</Text>
            <Text style={styles.countLabel}>Consumables</Text>
          </AppCard>
          <AppCard variant="outlined" padding="md" style={styles.countCard}>
            <Camera size={18} color={Colors.accent} />
            <Text style={styles.countValue}>{photoCount}</Text>
            <Text style={styles.countLabel}>Photos</Text>
          </AppCard>
        </View>

        {/* Step Checklist */}
        <Text style={styles.sectionTitle}>Step Completion</Text>
        <View style={styles.summaryList}>
          {summaryChecks.map((item, index) => (
            <AppCard
              key={index}
              variant="outlined"
              padding="md"
              style={styles.summaryItem}>
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
                      ]}>
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

        {/* Blocking Warnings */}
        {blockingWarnings.length > 0 && (
          <View style={styles.warningBanner}>
            <View style={styles.warningHeader}>
              <AlertTriangle size={18} color={Colors.red} />
              <Text style={styles.warningTitle}>
                Cannot Submit — Issues Found
              </Text>
            </View>
            {blockingWarnings.map((warning, idx) => (
              <Text key={idx} style={styles.warningItem}>
                - {warning}
              </Text>
            ))}
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
            title="Submit Attendance"
            onPress={handleSubmitPress}
            variant={allComplete ? 'primary' : 'secondary'}
            disabled={!allComplete || isSubmitting}
            loading={isSubmitting}
            style={[styles.actionBtn, allComplete && styles.submitBtn]}
          />
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showSubmitConfirmation}
        onClose={() => setShowSubmitConfirmation(false)}
        onConfirm={handleSubmitConfirm}
        title="Submit Attendance"
        message="Are you sure you want to submit this attendance? This cannot be edited after submission."
        confirmText="Confirm"
        cancelText="Cancel"
        type="warning"
        showDetails={true}
      />

      {/* Upload Progress Modal */}
      <Modal
        visible={showUploadProgress}
        transparent
        animationType="fade"
        onRequestClose={() => {}}>
        <View style={styles.progressOverlay}>
          <View style={styles.progressContent}>
            <ActivityIndicator size="large" color={Colors.blue} />
            <Text style={styles.progressTitle}>Uploading Attendance</Text>
            <Text style={styles.progressText}>
              Uploading photos and data...{'\n'}Please do not close the app.
            </Text>
          </View>
        </View>
      </Modal>

      {/* Green Success Screen */}
      <Modal
        visible={showSuccessScreen}
        animationType="slide"
        onRequestClose={handleSuccessDismiss}>
        <View style={styles.successScreen}>
          <View style={styles.successIcon}>
            <CheckCircle size={64} color={Colors.white} />
          </View>
          <Text style={styles.successTitle}>Attendance Submitted</Text>
          <Text style={styles.successSubtitle}>
            Your attendance has been recorded successfully.
          </Text>

          <AppCard
            variant="outlined"
            padding="lg"
            style={styles.successSummaryCard}>
            <Text style={styles.successLabel}>Job</Text>
            <Text style={styles.successValue}>{jobId}</Text>
            <Text style={styles.successLabel}>Date</Text>
            <Text style={styles.successValue}>
              {new Date().toLocaleDateString('en-AU')}
            </Text>
            <Text style={styles.successLabel}>Time on Site</Text>
            <Text style={styles.successValue}>
              {formatTimeShort(arrivalTime)} → {formatTimeShort(departureTime)}{' '}
              ({totalHours ?? 0} hrs)
            </Text>
            <Text style={styles.successLabel}>Rooms Inspected</Text>
            <Text style={styles.successValue}>{roomsCompleted}</Text>
            <Text style={styles.successLabel}>Photos Captured</Text>
            <Text style={styles.successValue}>{photoCount}</Text>
          </AppCard>

          <AppButton
            title="Done"
            onPress={handleSuccessDismiss}
            variant="primary"
            size="lg"
            style={styles.successButton}
          />
        </View>
      </Modal>

      {/* Error Alert */}
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
  jobInfoCard: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.navy,
  },
  jobNumber: {
    ...Typography.captionBold,
    color: Colors.gray300,
    marginBottom: Spacing.xs,
  },
  jobAddress: {
    ...Typography.bodyBold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  jobDate: {
    ...Typography.caption,
    color: Colors.gray300,
  },
  timeCard: {
    marginBottom: Spacing.lg,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeBlock: {
    alignItems: 'center',
    flex: 1,
  },
  timeLabel: {
    ...Typography.caption,
    color: Colors.gray500,
    marginBottom: Spacing.xs,
  },
  timeValue: {
    ...Typography.bodyBold,
    color: Colors.navy,
  },
  timeValueHighlight: {
    ...Typography.bodyBold,
    color: Colors.blue,
  },
  timeArrow: {
    fontSize: 18,
    color: Colors.gray300,
    marginHorizontal: Spacing.xs,
  },
  countsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  countCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  countValue: {
    ...Typography.h3,
    color: Colors.navy,
  },
  countLabel: {
    ...Typography.caption,
    color: Colors.gray500,
    textAlign: 'center',
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.navy,
    marginBottom: Spacing.md,
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
  warningBanner: {
    backgroundColor: Colors.redLight,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.red,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  warningTitle: {
    ...Typography.bodyBold,
    color: Colors.red,
  },
  warningItem: {
    ...Typography.caption,
    color: Colors.red,
    marginLeft: Spacing.lg,
    marginTop: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionBtn: {
    flex: 1,
  },
  submitBtn: {
    backgroundColor: Colors.navy,
  },
  progressOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  progressContent: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxxl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  progressTitle: {
    ...Typography.bodyBold,
    color: Colors.navy,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.gray500,
    textAlign: 'center',
  },
  successScreen: {
    flex: 1,
    backgroundColor: Colors.green,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  successTitle: {
    ...Typography.h2,
    color: Colors.white,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  successSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  successSummaryCard: {
    width: '100%',
    backgroundColor: Colors.white,
    marginBottom: Spacing.xl,
  },
  successLabel: {
    ...Typography.caption,
    color: Colors.gray500,
    marginTop: Spacing.sm,
  },
  successValue: {
    ...Typography.bodyBold,
    color: Colors.navy,
    marginBottom: Spacing.xs,
  },
  successButton: {
    minWidth: 200,
    backgroundColor: Colors.white,
  },
});

export default React.memo(StepSummary);

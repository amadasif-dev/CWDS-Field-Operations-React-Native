// StepDepartureTime.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setStepData } from '../../../store/slices/attendanceSlice';
import {
  AppButton,
  AppCard,
  AppInput,
  BottomSheetAlert,
} from '../../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

interface StepDepartureTimeProps {
  onNext: () => void;
  onPrev: () => void;
}

const StepDepartureTime: React.FC<StepDepartureTimeProps> = ({
  onNext,
  onPrev,
}) => {
  const dispatch = useAppDispatch();
  const stepData = useAppSelector(state => state.attendance.stepData[7]);
  const arrivalData = useAppSelector(state => state.attendance.stepData[3]); // Arrival from Step 3

  const [departureTime, setDepartureTime] = useState<Date | null>(
    stepData?.departureTime ? new Date(stepData.departureTime as string) : null,
  );
  const [isConfirmed, setIsConfirmed] = useState(stepData?.confirmed || false);
  const [hasIssues, setHasIssues] = useState(stepData?.hasIssues || false);
  const [issuesNotes, setIssuesNotes] = useState(
    typeof stepData?.issuesNotes === 'string' ? stepData.issuesNotes : '',
  );
  const [siteClean, setSiteClean] = useState(stepData?.siteClean || false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const arrivalTime = arrivalData?.arrivalTime
    ? new Date(arrivalData.arrivalTime as string)
    : null;

  // Calculate hours on site
  const calculateHours = useCallback(() => {
    if (!arrivalTime || !departureTime) return 0;
    const diffMs = departureTime.getTime() - arrivalTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.round(diffHours * 10) / 10; // Round to 1 decimal
  }, [arrivalTime, departureTime]);

  const totalHours = calculateHours();

  const handleConfirmDeparture = useCallback(() => {
    setShowConfirmation(true);
  }, []);

  const handleConfirmAction = useCallback(() => {
    setDepartureTime(new Date());
    setIsConfirmed(true);
    setShowConfirmation(false);
  }, []);

  const handleNext = useCallback(() => {
    if (!isConfirmed) {
      setValidationMessage('Please confirm departure time before proceeding.');
      setShowValidationAlert(true);
      return;
    }
    if (!siteClean) {
      setValidationMessage(
        'Please confirm the site was left clean and secure.',
      );
      setShowValidationAlert(true);
      return;
    }

    dispatch(
      setStepData({
        step: 7,
        data: {
          departureTime: departureTime?.toISOString(),
          confirmed: isConfirmed,
          hasIssues,
          issuesNotes: hasIssues ? issuesNotes : '',
          siteClean,
          totalHours,
          arrivalTime: arrivalTime?.toISOString(),
        },
      }),
    );
    onNext();
  }, [
    isConfirmed,
    siteClean,
    departureTime,
    hasIssues,
    issuesNotes,
    totalHours,
    arrivalTime,
    dispatch,
    onNext,
  ]);

  const formatTime = (date: Date | null) => {
    if (!date) return '--:-- --';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '--/--/----';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Departure & Time Capture</Text>
        <Text style={styles.subtitle}>
          Record your departure time and finalize the attendance.
        </Text>

        {/* Current Time Display */}
        <AppCard variant="elevated" padding="lg" style={styles.currentTimeCard}>
          <View style={styles.currentTimeHeader}>
            <Clock size={24} color={Colors.blue} />
            <Text style={styles.currentTimeLabel}>Current Time</Text>
          </View>
          <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
          <Text style={styles.currentDate}>{formatDate(currentTime)}</Text>
        </AppCard>

        {/* Arrival & Departure Info */}
        <AppCard variant="outlined" padding="lg" style={styles.timeCard}>
          <View style={styles.timeRow}>
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Arrival Time</Text>
              <Text style={styles.timeValue}>
                {arrivalTime ? formatTime(arrivalTime) : 'Not recorded'}
              </Text>
              <Text style={styles.timeDate}>
                {arrivalTime ? formatDate(arrivalTime) : ''}
              </Text>
            </View>
            <View style={styles.timeDivider}>
              <Text style={styles.dividerText}>→</Text>
            </View>
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Departure Time</Text>
              <Text
                style={[
                  styles.timeValue,
                  isConfirmed && styles.timeValueConfirmed,
                ]}
              >
                {departureTime ? formatTime(departureTime) : 'Not confirmed'}
              </Text>
              <Text style={styles.timeDate}>
                {departureTime ? formatDate(departureTime) : ''}
              </Text>
            </View>
          </View>

          {!isConfirmed && (
            <AppButton
              title="Confirm Departure Time"
              onPress={handleConfirmDeparture}
              variant="primary"
              size="lg"
              style={styles.confirmButton}
            />
          )}

          {isConfirmed && (
            <View style={styles.confirmedBadge}>
              <CheckCircle size={20} color={Colors.green} />
              <Text style={styles.confirmedText}>
                Departure time confirmed at {formatTime(departureTime)}
              </Text>
            </View>
          )}
        </AppCard>

        {/* Total Hours Card */}
        {arrivalTime && departureTime && (
          <AppCard variant="outlined" padding="lg" style={styles.hoursCard}>
            <Text style={styles.hoursLabel}>Total Hours on Site</Text>
            <Text style={styles.hoursValue}>{totalHours} hours</Text>
            <Text style={styles.hoursSubtext}>
              Arrival: {formatTime(arrivalTime)} → Departure:{' '}
              {formatTime(departureTime)}
            </Text>
          </AppCard>
        )}

        {/* Issues Section */}
        <AppCard variant="outlined" padding="lg" style={styles.issuesCard}>
          <Text style={styles.issuesTitle}>Any issues on departure?</Text>
          <View style={styles.toggleGroup}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                hasIssues === true && styles.toggleButtonActive,
              ]}
              onPress={() => setHasIssues(true)}
            >
              <AlertCircle
                size={18}
                color={hasIssues === true ? Colors.white : Colors.gray700}
              />
              <Text
                style={[
                  styles.toggleText,
                  hasIssues === true && styles.toggleTextActive,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                hasIssues === false && styles.toggleButtonActive,
              ]}
              onPress={() => {
                setHasIssues(false);
                setIssuesNotes('');
              }}
            >
              <CheckCircle
                size={18}
                color={hasIssues === false ? Colors.white : Colors.gray700}
              />
              <Text
                style={[
                  styles.toggleText,
                  hasIssues === false && styles.toggleTextActive,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>

          {hasIssues && (
            <View style={styles.issuesInput}>
              <AppInput
                label="Issue Notes"
                placeholder="Please describe any issues encountered..."
                value={issuesNotes}
                onChangeText={setIssuesNotes}
                multiline
                numberOfLines={4}
              />
            </View>
          )}
        </AppCard>

        {/* Site Clean Confirmation */}
        <AppCard variant="outlined" padding="lg" style={styles.cleanCard}>
          <Text style={styles.cleanTitle}>
            Confirm site left clean and secure?
          </Text>
          <View style={styles.toggleGroup}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                siteClean === true && styles.toggleButtonActive,
              ]}
              onPress={() => setSiteClean(true)}
            >
              <CheckCircle
                size={18}
                color={siteClean === true ? Colors.white : Colors.gray700}
              />
              <Text
                style={[
                  styles.toggleText,
                  siteClean === true && styles.toggleTextActive,
                ]}
              >
                Yes, site is clean and secure
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                siteClean === false && styles.toggleButtonActive,
              ]}
              onPress={() => setSiteClean(false)}
            >
              <AlertCircle
                size={18}
                color={siteClean === false ? Colors.white : Colors.gray700}
              />
              <Text
                style={[
                  styles.toggleText,
                  siteClean === false && styles.toggleTextActive,
                ]}
              >
                No, issues remain
              </Text>
            </TouchableOpacity>
          </View>
        </AppCard>

        <View style={styles.actions}>
          <AppButton
            title="Previous"
            onPress={onPrev}
            variant="outline"
            style={styles.actionBtn}
          />
          <AppButton
            title="Next"
            onPress={handleNext}
            variant={isConfirmed && siteClean ? 'primary' : 'secondary'}
            disabled={!isConfirmed || !siteClean}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmAction}
        title="Confirm Departure"
        message="Are you sure you want to confirm departure time? This will lock the arrival and departure times for this attendance."
        confirmText="Confirm"
        cancelText="Cancel"
        type="warning"
        showDetails={false}
      />

      {/* Validation Alert */}
      <BottomSheetAlert
        visible={showValidationAlert}
        type="warning"
        title="Validation Error"
        message={validationMessage}
        primaryLabel="OK"
        onClose={() => setShowValidationAlert(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: Spacing.huge },
  title: { ...Typography.h2, color: Colors.navy, marginBottom: Spacing.xs },
  subtitle: {
    ...Typography.body,
    color: Colors.gray500,
    marginBottom: Spacing.xl,
  },
  currentTimeCard: { marginBottom: Spacing.lg, alignItems: 'center' },
  currentTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  currentTimeLabel: { ...Typography.bodyBold, color: Colors.blue },
  currentTime: {
    ...Typography.displayLarge,
    color: Colors.navy,
    marginBottom: Spacing.xs,
  },
  currentDate: { ...Typography.body, color: Colors.gray500 },
  timeCard: { marginBottom: Spacing.lg },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  timeInfo: { flex: 1, alignItems: 'center' },
  timeLabel: {
    ...Typography.caption,
    color: Colors.gray500,
    marginBottom: Spacing.xs,
  },
  timeValue: {
    ...Typography.h3,
    color: Colors.navy,
    marginBottom: Spacing.xxs,
  },
  timeValueConfirmed: { color: Colors.green },
  timeDate: { ...Typography.caption, color: Colors.gray500 },
  timeDivider: { paddingHorizontal: Spacing.md },
  dividerText: { fontSize: 24, color: Colors.gray500 },
  confirmButton: { marginTop: Spacing.md },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.greenLight,
    borderRadius: BorderRadius.md,
  },
  confirmedText: { ...Typography.body, color: Colors.green },
  hoursCard: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
    backgroundColor: Colors.blueLight,
  },
  hoursLabel: {
    ...Typography.caption,
    color: Colors.gray700,
    marginBottom: Spacing.sm,
  },
  hoursValue: {
    ...Typography.displayMedium,
    color: Colors.blue,
    marginBottom: Spacing.xs,
  },
  hoursSubtext: { ...Typography.caption, color: Colors.gray500 },
  issuesCard: { marginBottom: Spacing.lg },
  issuesTitle: {
    ...Typography.bodyBold,
    color: Colors.navy,
    marginBottom: Spacing.md,
  },
  issuesInput: { marginTop: Spacing.md },
  cleanCard: { marginBottom: Spacing.xl },
  cleanTitle: {
    ...Typography.bodyBold,
    color: Colors.navy,
    marginBottom: Spacing.md,
  },
  toggleGroup: { flexDirection: 'row', gap: Spacing.md },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gray300,
    backgroundColor: Colors.white,
  },
  toggleButtonActive: {
    backgroundColor: Colors.blue,
    borderColor: Colors.blue,
  },
  toggleText: { ...Typography.body, color: Colors.gray700 },
  toggleTextActive: { color: Colors.white },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  actionBtn: { flex: 1 },
});

export default StepDepartureTime;

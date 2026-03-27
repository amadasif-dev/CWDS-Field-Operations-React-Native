import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  User,
} from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setStepData } from '../../../store/slices/attendanceSlice';
import {
  AppButton,
  AppCard,
  AppInput,
  BottomSheetAlert,
} from '../../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';
import type { ArrivalCheckInData } from '../../../types/models';

interface StepArrivalCheckInProps {
  onNext: () => void;
  onPrev: () => void;
}

const StepArrivalCheckIn: React.FC<StepArrivalCheckInProps> = ({
  onNext,
  onPrev,
}) => {
  const dispatch = useAppDispatch();
  const stepData = useAppSelector(state => state.attendance.stepData[3]);
  const jobDetails = useAppSelector(state => state.jobs.selectedJob);

  const [currentTime] = useState(new Date());
  const [arrivalConfirmed, setArrivalConfirmed] = useState(
    (stepData as unknown as ArrivalCheckInData | undefined)?.confirmed || false,
  );
  const [arrivalTime, setArrivalTime] = useState<string | null>(
    (stepData as unknown as ArrivalCheckInData | undefined)?.arrivalTime ||
      null,
  );
  const [siteAccessible, setSiteAccessible] = useState(
    (stepData as unknown as ArrivalCheckInData | undefined)?.siteAccessible ??
      true,
  );
  const [hasHazards, setHasHazards] = useState(
    (stepData as unknown as ArrivalCheckInData | undefined)?.hasHazards ||
      false,
  );
  const [hazardNotes, setHazardNotes] = useState(
    (stepData as unknown as ArrivalCheckInData | undefined)?.hazardNotes || '',
  );
  const [clientOnSite, setClientOnSite] = useState(
    (stepData as unknown as ArrivalCheckInData | undefined)?.clientOnSite ??
      false,
  );
  const [clientName, setClientName] = useState(
    (stepData as unknown as ArrivalCheckInData | undefined)?.clientName || '',
  );
  const [showValidationAlert, setShowValidationAlert] = useState(false);

  const handleConfirmArrival = useCallback(() => {
    const now = new Date().toISOString();
    setArrivalTime(now);
    setArrivalConfirmed(true);
  }, []);

  const handleNext = useCallback(() => {
    if (!arrivalConfirmed) {
      setShowValidationAlert(true);
      return;
    }

    dispatch(
      setStepData({
        step: 3,
        data: {
          arrivalTime,
          confirmed: arrivalConfirmed,
          siteAccessible,
          hasHazards,
          hazardNotes: hasHazards ? hazardNotes : '',
          clientOnSite,
          clientName: clientOnSite ? clientName : '',
          completedAt: new Date().toISOString(),
        },
      }),
    );
    onNext();
  }, [
    arrivalConfirmed,
    arrivalTime,
    siteAccessible,
    hasHazards,
    hazardNotes,
    clientOnSite,
    clientName,
    dispatch,
    onNext,
  ]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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
        <Text style={styles.title}>Arrival Check-in</Text>
        <Text style={styles.subtitle}>
          Record official arrival time and confirm site readiness.
        </Text>
        <AppCard variant="elevated" padding="lg" style={styles.timeCard}>
          <View style={styles.timeHeader}>
            <Clock size={24} color={Colors.blue} />
            <Text style={styles.timeLabel}>Current Date & Time</Text>
          </View>
          <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
          <Text style={styles.currentDate}>{formatDate(currentTime)}</Text>
        </AppCard>

        <AppCard variant="outlined" padding="lg" style={styles.arrivalCard}>
          <Text style={styles.sectionTitle}>Arrival Time</Text>

          {arrivalConfirmed ? (
            <View style={styles.confirmedContainer}>
              <View style={styles.confirmedBadge}>
                <CheckCircle size={20} color={Colors.green} />
                <Text style={styles.confirmedText}>
                  Arrival confirmed at{' '}
                  {arrivalTime ? formatTime(new Date(arrivalTime)) : ''}
                </Text>
              </View>
            </View>
          ) : (
            <AppButton
              title="Confirm Arrival Time"
              onPress={handleConfirmArrival}
              variant="primary"
              size="lg"
              icon={<Clock size={18} color={Colors.white} />}
            />
          )}
        </AppCard>

        {/* Site Readiness */}
        <AppCard variant="outlined" padding="lg" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={Colors.navy} />
            <Text style={styles.sectionTitle}>Site Readiness</Text>
          </View>

          <Text style={styles.question}>Is the site accessible?</Text>
          <View style={styles.toggleGroup}>
            <AppButton
              title="Yes"
              onPress={() => setSiteAccessible(true)}
              variant={siteAccessible ? 'primary' : 'outline'}
              icon={
                <CheckCircle
                  size={18}
                  color={siteAccessible ? Colors.white : Colors.gray700}
                />
              }
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: siteAccessible ? Colors.green : Colors.white,
                },
              ]}
            />
            <AppButton
              title="No"
              onPress={() => setSiteAccessible(false)}
              variant={!siteAccessible ? 'primary' : 'outline'}
              icon={
                <AlertCircle
                  size={18}
                  color={!siteAccessible ? Colors.white : Colors.gray700}
                />
              }
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: !siteAccessible ? Colors.red : Colors.white,
                },
              ]}
            />
          </View>

          <Text style={styles.question}>
            Any immediate hazards not covered in JSA?
          </Text>
          <View style={styles.toggleGroup}>
            <AppButton
              title="Yes"
              onPress={() => setHasHazards(true)}
              variant={hasHazards ? 'primary' : 'outline'}
              icon={
                <AlertCircle
                  size={18}
                  color={hasHazards ? Colors.white : Colors.gray700}
                />
              }
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: hasHazards ? Colors.red : Colors.white,
                },
              ]}
            />
            <AppButton
              title="No"
              onPress={() => {
                setHasHazards(false);
                setHazardNotes('');
              }}
              variant={!hasHazards ? 'primary' : 'outline'}
              icon={
                <CheckCircle
                  size={18}
                  color={!hasHazards ? Colors.white : Colors.gray700}
                />
              }
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: !hasHazards ? Colors.green : Colors.white,
                },
              ]}
            />
          </View>

          {hasHazards && (
            <View style={styles.hazardInput}>
              <AppInput
                label="Hazard Notes"
                placeholder="Describe any immediate hazards..."
                value={hazardNotes}
                onChangeText={setHazardNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          )}
        </AppCard>

        {/* Client/Owner */}
        <AppCard variant="outlined" padding="lg" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <User size={20} color={Colors.navy} />
            <Text style={styles.sectionTitle}>Client / Owner</Text>
          </View>

          <Text style={styles.question}>Is the client/owner on site?</Text>
          <View style={styles.toggleGroup}>
            <AppButton
              title="Yes"
              onPress={() => setClientOnSite(true)}
              variant={clientOnSite ? 'primary' : 'outline'}
              icon={
                <CheckCircle
                  size={18}
                  color={clientOnSite ? Colors.white : Colors.gray700}
                />
              }
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: clientOnSite ? Colors.green : Colors.white,
                },
              ]}
            />
            <AppButton
              title="No"
              onPress={() => {
                setClientOnSite(false);
                setClientName('');
              }}
              variant={!clientOnSite ? 'primary' : 'outline'}
              icon={
                <AlertCircle
                  size={18}
                  color={!clientOnSite ? Colors.white : Colors.gray700}
                />
              }
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: !clientOnSite ? Colors.red : Colors.white,
                },
              ]}
            />
          </View>

          {clientOnSite && (
            <View style={styles.clientInput}>
              <AppInput
                label="Client/Owner Name"
                placeholder="Enter client name..."
                value={clientName}
                onChangeText={setClientName}
              />
            </View>
          )}
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
            variant={arrivalConfirmed ? 'primary' : 'secondary'}
            disabled={!arrivalConfirmed}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>

      <BottomSheetAlert
        visible={showValidationAlert}
        type="warning"
        title="Arrival Not Confirmed"
        message="Please confirm your arrival time before proceeding."
        primaryLabel="OK"
        onClose={() => setShowValidationAlert(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
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
  timeCard: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
    backgroundColor: Colors.navy,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  timeLabel: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
  currentTime: {
    ...Typography.displayMedium,
    color: Colors.white,
  },
  currentDate: {
    ...Typography.body,
    color: Colors.gray500,
    marginTop: Spacing.xs,
  },
  arrivalCard: {
    marginBottom: Spacing.lg,
  },
  sectionCard: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.navy,
    fontSize: 16,
    paddingBottom: Spacing.md,
  },
  confirmedContainer: {
    alignItems: 'center',
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.greenLight,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  confirmedText: {
    ...Typography.bodyBold,
    color: Colors.green,
  },
  question: {
    ...Typography.body,
    color: Colors.gray700,
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  toggleBtn: { flex: 1 },
  hazardInput: {
    marginTop: Spacing.md,
  },
  clientInput: {
    marginTop: Spacing.md,
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

export default React.memo(StepArrivalCheckIn);

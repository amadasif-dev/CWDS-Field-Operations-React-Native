import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import {
  CheckCircle,
  MapPin,
  Shield,
  Wrench,
  FileText,
  Camera,
  PenTool,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { submitAttendance, clearAttendance } from '../../../store/slices/attendanceSlice';
import { AppButton, AppCard } from '../../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';

interface StepSummaryProps {
  jobId: string;
  onPrev: () => void;
}

const StepSummary: React.FC<StepSummaryProps> = ({ jobId, onPrev }) => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { stepData, photos, signature, isSubmitting } = useAppSelector(
    (state) => state.attendance,
  );

  const handleSubmit = useCallback(() => {
    Alert.alert(
      'Submit Report',
      'Are you sure you want to submit this attendance report? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              await dispatch(submitAttendance(jobId)).unwrap();
              Alert.alert('Success', 'Attendance report submitted successfully.', [
                {
                  text: 'OK',
                  onPress: () => {
                    dispatch(clearAttendance());
                    navigation.goBack();
                  },
                },
              ]);
            } catch {
              Alert.alert('Error', 'Failed to submit report. Please try again.');
            }
          },
        },
      ],
    );
  }, [dispatch, navigation, jobId]);

  const summaryItems = [
    {
      icon: <MapPin size={18} color={Colors.blue} />,
      title: 'Job Confirmation',
      status: stepData[1]?.confirmed ? 'Confirmed' : 'Incomplete',
      complete: !!stepData[1]?.confirmed,
    },
    {
      icon: <Shield size={18} color={Colors.green} />,
      title: 'Site Assessment',
      status: stepData[2]?.siteCondition
        ? `Condition: ${stepData[2].siteCondition}`
        : 'Incomplete',
      complete: !!stepData[2]?.siteCondition,
    },
    {
      icon: <Wrench size={18} color={Colors.gold} />,
      title: 'Equipment Check',
      status: stepData[3]?.equipmentVerified ? 'Verified' : 'Incomplete',
      complete: !!stepData[3]?.equipmentVerified,
    },
    {
      icon: <Shield size={18} color={Colors.green} />,
      title: 'Safety Checklist',
      status: stepData[4]?.safetyCompleted ? 'Completed' : 'Incomplete',
      complete: !!stepData[4]?.safetyCompleted,
    },
    {
      icon: <FileText size={18} color={Colors.blue} />,
      title: 'Work Documentation',
      status: stepData[5]?.workDescription ? 'Documented' : 'Incomplete',
      complete: !!stepData[5]?.workDescription,
    },
    {
      icon: <Camera size={18} color={Colors.accent} />,
      title: 'Photo Evidence',
      status: `${photos.length} photo${photos.length !== 1 ? 's' : ''} captured`,
      complete: photos.length > 0,
    },
    {
      icon: <PenTool size={18} color={Colors.navy} />,
      title: 'Client Signature',
      status: signature ? 'Signed' : 'Incomplete',
      complete: !!signature,
    },
  ];

  const allComplete = summaryItems.every((item) => item.complete);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
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

      {!allComplete && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            Some steps are incomplete. Please go back and complete all required
            steps before submitting.
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
          onPress={handleSubmit}
          variant={allComplete ? 'primary' : 'secondary'}
          disabled={!allComplete || isSubmitting}
          loading={isSubmitting}
          style={styles.actionBtn}
        />
      </View>
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

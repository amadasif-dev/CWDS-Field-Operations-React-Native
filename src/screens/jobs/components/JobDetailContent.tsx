import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  MapPin,
  Clock,
  Phone,
  User,
  FileText,
  Wrench,
  ClipboardCheck,
} from 'lucide-react-native';
import { AppButton, AppCard } from '../../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';
import {
  capitalize,
  getStatusColor,
  getPriorityColor,
  formatDate,
} from '../../../utils';
import type { Job } from '../../../types/models';

const MOCK_JOB: Job = {
  id: '1',
  title: 'HVAC Inspection — Building A',
  description:
    'Annual HVAC inspection and maintenance for the main building. Check all units, filters, and ductwork. Report any issues found.',
  status: 'assigned',
  priority: 'high',
  clientName: 'Acme Corp',
  clientPhone: '555-0101',
  address: '123 Main St, Suite 100, Downtown',
  scheduledDate: '2025-03-26',
  scheduledTime: '09:00',
  estimatedDuration: 120,
  assignedTo: 'tech_1',
  createdAt: '2025-03-20T08:00:00Z',
  updatedAt: '2025-03-20T08:00:00Z',
  notes: 'Access via main lobby. Ask for security badge at front desk.',
  equipment: [
    {
      id: 'eq1',
      name: 'HVAC Unit A1',
      model: 'Carrier 50XC',
      serialNumber: 'SN-001234',
      condition: 'good',
    },
    {
      id: 'eq2',
      name: 'HVAC Unit A2',
      model: 'Carrier 50XC',
      serialNumber: 'SN-001235',
      condition: 'fair',
      notes: 'Filter replacement due',
    },
  ],
};

const TABS = [
  { key: 'details', label: 'Details', icon: FileText },
  { key: 'equipment', label: 'Equipment', icon: Wrench },
  { key: 'inspection', label: 'Inspection', icon: ClipboardCheck },
] as const;

type TabKey = (typeof TABS)[number]['key'];

interface JobDetailContentProps {
  jobId: string;
}

const JobDetailContent: React.FC<JobDetailContentProps> = ({ jobId }) => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabKey>('details');
  const job = MOCK_JOB;

  const statusColor = getStatusColor(job.status);
  const priorityColor = getPriorityColor(job.priority);

  const handleStartAttendance = useCallback(() => {
    navigation.navigate('AttendanceWizard', { jobId });
  }, [navigation, jobId]);

  const handleStartInspection = useCallback(() => {
    navigation.navigate('InspectionSetup', { jobId });
  }, [navigation, jobId]);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <AppCard style={styles.headerCard} variant="elevated" padding="xl">
        <Text style={styles.jobTitle}>{job.title}</Text>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: `${statusColor}15` }]}>
            <View style={[styles.dot, { backgroundColor: statusColor }]} />
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {capitalize(job.status)}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: `${priorityColor}15` }]}>
            <Text style={[styles.badgeText, { color: priorityColor }]}>
              {capitalize(job.priority)}
            </Text>
          </View>
        </View>
        <Text style={styles.description}>{job.description}</Text>
      </AppCard>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}>
              <Icon
                size={16}
                color={isActive ? Colors.blue : Colors.gray500}
              />
              <Text
                style={[
                  styles.tabText,
                  isActive && styles.tabTextActive,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'details' && (
          <View style={styles.detailsTab}>
            <DetailRow
              icon={<User size={16} color={Colors.blue} />}
              label="Client"
              value={job.clientName}
            />
            <DetailRow
              icon={<Phone size={16} color={Colors.blue} />}
              label="Phone"
              value={job.clientPhone}
            />
            <DetailRow
              icon={<MapPin size={16} color={Colors.blue} />}
              label="Address"
              value={job.address}
            />
            <DetailRow
              icon={<Clock size={16} color={Colors.blue} />}
              label="Scheduled"
              value={`${formatDate(job.scheduledDate)} at ${job.scheduledTime}`}
            />
            <DetailRow
              icon={<Clock size={16} color={Colors.blue} />}
              label="Duration"
              value={`${job.estimatedDuration} minutes`}
            />
            {job.notes && (
              <AppCard variant="outlined" padding="md" style={styles.notesCard}>
                <Text style={styles.notesLabel}>Notes</Text>
                <Text style={styles.notesText}>{job.notes}</Text>
              </AppCard>
            )}
          </View>
        )}

        {activeTab === 'equipment' && (
          <View style={styles.equipmentTab}>
            {job.equipment?.map((eq) => (
              <AppCard
                key={eq.id}
                variant="outlined"
                padding="lg"
                style={styles.equipmentCard}>
                <Text style={styles.eqName}>{eq.name}</Text>
                <Text style={styles.eqMeta}>
                  {eq.model} · {eq.serialNumber}
                </Text>
                <View
                  style={[
                    styles.conditionBadge,
                    {
                      backgroundColor:
                        eq.condition === 'good'
                          ? Colors.greenLight
                          : Colors.redLight,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.conditionText,
                      {
                        color:
                          eq.condition === 'good' ? Colors.green : Colors.red,
                      },
                    ]}>
                    {capitalize(eq.condition)}
                  </Text>
                </View>
                {eq.notes && (
                  <Text style={styles.eqNotes}>{eq.notes}</Text>
                )}
              </AppCard>
            ))}
          </View>
        )}

        {activeTab === 'inspection' && (
          <View style={styles.inspectionTab}>
            <Text style={styles.inspectionText}>
              No inspections recorded yet. Start an attendance report to begin.
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {job.status !== 'completed' && job.status !== 'cancelled' && (
        <View style={styles.actionWrapper}>
          <AppButton
            title="Start Room Inspection"
            onPress={handleStartInspection}
            fullWidth
            size="lg"
            style={styles.inspectionBtn}
          />
          <AppButton
            title="Start Attendance Report"
            onPress={handleStartAttendance}
            variant="outline"
            fullWidth
            size="lg"
          />
        </View>
      )}
    </ScrollView>
  );
};

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailIcon}>{icon}</View>
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    margin: Spacing.lg,
  },
  jobTitle: {
    ...Typography.h2,
    color: Colors.navy,
    marginBottom: Spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    ...Typography.small,
    fontWeight: '600',
  },
  description: {
    ...Typography.body,
    color: Colors.gray700,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  tabActive: {
    backgroundColor: Colors.white,
  },
  tabText: {
    ...Typography.captionBold,
    color: Colors.gray500,
  },
  tabTextActive: {
    color: Colors.blue,
  },
  tabContent: {
    padding: Spacing.lg,
  },
  detailsTab: {
    gap: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  detailIcon: {
    marginTop: Spacing.xxs,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...Typography.caption,
    color: Colors.gray500,
  },
  detailValue: {
    ...Typography.body,
    color: Colors.navy,
    marginTop: Spacing.xxs,
  },
  notesCard: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.gray100,
  },
  notesLabel: {
    ...Typography.captionBold,
    color: Colors.gray500,
    marginBottom: Spacing.xs,
  },
  notesText: {
    ...Typography.body,
    color: Colors.gray700,
  },
  equipmentTab: {
    gap: Spacing.md,
  },
  equipmentCard: {
    gap: Spacing.xs,
  },
  eqName: {
    ...Typography.bodyBold,
    color: Colors.navy,
  },
  eqMeta: {
    ...Typography.caption,
    color: Colors.gray500,
  },
  conditionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.full,
  },
  conditionText: {
    ...Typography.small,
    fontWeight: '600',
  },
  eqNotes: {
    ...Typography.caption,
    color: Colors.gray700,
    fontStyle: 'italic',
  },
  inspectionTab: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  inspectionText: {
    ...Typography.body,
    color: Colors.gray500,
    textAlign: 'center',
  },
  actionWrapper: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  inspectionBtn: {
    marginBottom: 0,
  },
});

export default JobDetailContent;

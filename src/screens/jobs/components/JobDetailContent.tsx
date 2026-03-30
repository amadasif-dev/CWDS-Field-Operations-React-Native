import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  MapPin,
  Clock,
  User,
  FileText,
  Droplets,
  Building2,
  ListChecks,
  History,
  ChevronRight,
  ImageIcon,
  FileDown,
  AlertCircle,
} from 'lucide-react-native';
import { AppButton, AppCard } from '../../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';
import {
  capitalize,
  getStatusColor,
  formatDate,
} from '../../../utils';
import type { Job, AttendanceHistoryItem } from '../../../types/models';

const MOCK_JOB: Job = {
  id: 'JOB-20250326-001',
  title: 'Water Damage Restoration — Unit 4',
  description:
    'Water damage restoration following burst pipe in kitchen. Category 2 water affecting kitchen, hallway and living room.',
  status: 'assigned',
  priority: 'high',
  clientName: 'John Smith',
  clientPhone: '0412 345 678',
  address: '42 Harbour View Drive, Unit 4, Surry Hills NSW 2010',
  scheduledDate: '2025-03-30',
  scheduledTime: '09:00',
  estimatedDuration: 240,
  assignedTo: 'tech_1',
  createdAt: '2025-03-28T08:00:00Z',
  updatedAt: '2025-03-29T14:00:00Z',
  waterDamageCause: 'Burst pipe',
  waterCategory: 2,
  waterClass: 2,
  buildingType: 'Strata',
  affectedRooms: ['Kitchen', 'Hallway', 'Living Room', 'Bathroom'],
  adminNotes:
    'Access via building manager — collect fob from reception. Strata manager has been notified. Ensure drying equipment does not block fire exits.',
  notes: 'Access via main lobby. Ask for security badge at front desk.',
  scope: {
    invasiveWorks: true,
    description:
      'Remove affected carpet and underlay in hallway. Cut plasterboard to 300mm above waterline in kitchen. Install drying equipment in all affected rooms. Monitor moisture readings daily.',
  },
  floorPlans: [
    {
      id: 'fp1',
      uri: 'https://via.placeholder.com/600x400?text=Floor+Plan+-+Unit+4',
      label: 'Unit 4 — Ground Floor',
    },
  ],
  referenceDocuments: [
    {
      id: 'doc1',
      name: 'Scope of Works — JOB-20250326-001.pdf',
      uri: '',
      type: 'pdf',
    },
    {
      id: 'doc2',
      name: 'Strata By-Laws Extract.pdf',
      uri: '',
      type: 'pdf',
    },
  ],
  attendanceHistory: [
    {
      id: 'att_1',
      date: '2025-03-28',
      technicianName: 'James Wilson',
      arrivalTime: '09:15 AM',
      departureTime: '01:45 PM',
      status: 'Submitted',
      totalHours: 4.5,
    },
    {
      id: 'att_2',
      date: '2025-03-29',
      technicianName: 'James Wilson',
      arrivalTime: '08:30 AM',
      departureTime: '12:00 PM',
      status: 'Submitted',
      totalHours: 3.5,
    },
  ],
  siteIntelligence: {
    constructionYear: 1985,
    asbestosRisk: true,
    materials: ['Fibrous Cement', 'Plasterboard'],
    rooms: [
      { id: 'r1', name: 'Kitchen', floor: 'Ground', status: 'pending' },
      { id: 'r2', name: 'Hallway', floor: 'Ground', status: 'pending' },
      { id: 'r3', name: 'Living Room', floor: 'Ground', status: 'pending' },
      { id: 'r4', name: 'Bathroom', floor: 'Ground', status: 'pending' },
    ],
  },
  jsa: {
    sopName: 'Water Extraction — Category 2',
    hazards: [],
  },
  equipment: [],
};

const TABS = [
  { key: 'overview', label: 'Overview', icon: Droplets },
  { key: 'scope', label: 'Scope', icon: FileText },
  { key: 'history', label: 'History', icon: History },
] as const;

type TabKey = (typeof TABS)[number]['key'];

interface JobDetailContentProps {
  jobId: string;
}

const JobDetailContent: React.FC<JobDetailContentProps> = ({ jobId }) => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const job = MOCK_JOB;

  const statusColor = getStatusColor(job.status);

  const isAttendanceEnabled =
    job.status !== 'completed' &&
    job.status !== 'cancelled' &&
    job.scheduledDate === new Date().toISOString().split('T')[0];

  const handleStartAttendance = useCallback(() => {
    navigation.navigate('AttendanceWizard', { jobId });
  }, [navigation, jobId]);

  const getCategoryLabel = (cat?: number) => {
    switch (cat) {
      case 1:
        return 'Cat 1 — Clean Water';
      case 2:
        return 'Cat 2 — Grey Water';
      case 3:
        return 'Cat 3 — Black Water';
      default:
        return 'Not specified';
    }
  };

  const getClassLabel = (cls?: number) => {
    switch (cls) {
      case 1:
        return 'Class 1 — Minimal';
      case 2:
        return 'Class 2 — Significant';
      case 3:
        return 'Class 3 — Extensive';
      case 4:
        return 'Class 4 — Specialty';
      default:
        return 'Not specified';
    }
  };

  const renderOverviewTab = () => (
    <View style={styles.detailsTab}>
      <DetailRow
        icon={<FileText size={16} color={Colors.blue} />}
        label="Job Number"
        value={job.id}
      />
      <DetailRow
        icon={<User size={16} color={Colors.blue} />}
        label="Client Name"
        value={job.clientName}
      />
      <DetailRow
        icon={<MapPin size={16} color={Colors.blue} />}
        label="Full Address"
        value={job.address}
      />

      <View style={styles.statusRow}>
        <Text style={styles.fieldLabel}>Job Status</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${statusColor}15` },
          ]}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={[styles.badgeText, { color: statusColor }]}>
            {capitalize(job.status)}
          </Text>
        </View>
      </View>

      <DetailRow
        icon={<Droplets size={16} color={Colors.blue} />}
        label="Water Damage Cause"
        value={job.waterDamageCause || 'Not specified'}
      />

      <View style={styles.rowPair}>
        <View style={styles.halfField}>
          <Text style={styles.fieldLabel}>Water Category</Text>
          <Text style={styles.fieldValue}>
            {getCategoryLabel(job.waterCategory)}
          </Text>
        </View>
        <View style={styles.halfField}>
          <Text style={styles.fieldLabel}>Water Class</Text>
          <Text style={styles.fieldValue}>
            {getClassLabel(job.waterClass)}
          </Text>
        </View>
      </View>

      <DetailRow
        icon={<Building2 size={16} color={Colors.blue} />}
        label="Building Type"
        value={job.buildingType || 'Not specified'}
      />

      {job.affectedRooms && job.affectedRooms.length > 0 && (
        <View style={styles.roomsSection}>
          <Text style={styles.fieldLabel}>Affected Rooms</Text>
          <View style={styles.roomTags}>
            {job.affectedRooms.map((room, idx) => (
              <View key={idx} style={styles.roomTag}>
                <Text style={styles.roomTagText}>{room}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {(job.adminNotes || job.notes) && (
        <AppCard variant="outlined" padding="md" style={styles.notesCard}>
          <View style={styles.notesHeader}>
            <AlertCircle size={16} color={Colors.orange} />
            <Text style={styles.notesLabel}>
              Admin Notes / Special Instructions
            </Text>
          </View>
          <Text style={styles.notesText}>
            {job.adminNotes || job.notes}
          </Text>
        </AppCard>
      )}

      <AppButton
        title="Start Attendance"
        onPress={handleStartAttendance}
        variant="primary"
        size="lg"
        fullWidth
        // disabled={!isAttendanceEnabled}
        style={styles.startButton}
      />
      {!isAttendanceEnabled && (
        <Text style={styles.disabledHint}>
          Attendance can only be started on the scheduled date or with
          authorization.
        </Text>
      )}
    </View>
  );

  const renderScopeTab = () => (
    <View style={styles.scopeTab}>
      <AppCard variant="outlined" padding="lg" style={styles.scopeCard}>
        <Text style={styles.scopeTitle}>Scope of Work</Text>
        <Text style={styles.scopeText}>
          {job.scope?.description || 'No scope of work provided by admin.'}
        </Text>
      </AppCard>

      {job.floorPlans && job.floorPlans.length > 0 && (
        <View style={styles.floorPlanSection}>
          <View style={styles.sectionHeader}>
            <ImageIcon size={18} color={Colors.navy} />
            <Text style={styles.sectionTitle}>Floor Plans</Text>
          </View>
          {job.floorPlans.map((plan) => (
            <TouchableOpacity key={plan.id} activeOpacity={0.8}>
              <AppCard
                variant="outlined"
                padding="sm"
                style={styles.floorPlanCard}>
                <Image
                  source={{ uri: plan.uri }}
                  style={styles.floorPlanImage}
                  resizeMode="contain"
                />
                {plan.label && (
                  <Text style={styles.floorPlanLabel}>{plan.label}</Text>
                )}
              </AppCard>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {job.referenceDocuments && job.referenceDocuments.length > 0 && (
        <View style={styles.docsSection}>
          <View style={styles.sectionHeader}>
            <FileDown size={18} color={Colors.navy} />
            <Text style={styles.sectionTitle}>Reference Documents</Text>
          </View>
          {job.referenceDocuments.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              onPress={() => {
                if (doc.uri) {
                  Linking.openURL(doc.uri);
                }
              }}
              activeOpacity={0.7}>
              <AppCard
                variant="outlined"
                padding="md"
                style={styles.docCard}>
                <View style={styles.docRow}>
                  <FileText size={20} color={Colors.blue} />
                  <Text style={styles.docName} numberOfLines={1}>
                    {doc.name}
                  </Text>
                  <ChevronRight size={16} color={Colors.gray500} />
                </View>
              </AppCard>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderHistoryTab = () => {
    const history = job.attendanceHistory || [];

    if (history.length === 0) {
      return (
        <View style={styles.emptyHistory}>
          <History size={40} color={Colors.gray300} />
          <Text style={styles.emptyHistoryText}>
            No previous attendances for this job.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.historyTab}>
        {history.map((item: AttendanceHistoryItem) => (
          <TouchableOpacity key={item.id} activeOpacity={0.7}>
            <AppCard
              variant="outlined"
              padding="md"
              style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>
                  {formatDate(item.date)}
                </Text>
                <View
                  style={[
                    styles.historyBadge,
                    {
                      backgroundColor:
                        item.status === 'Submitted'
                          ? Colors.greenLight
                          : Colors.orangeLight,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.historyBadgeText,
                      {
                        color:
                          item.status === 'Submitted'
                            ? Colors.green
                            : Colors.orange,
                      },
                    ]}>
                    {item.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.historyTech}>
                {item.technicianName}
              </Text>
              <View style={styles.historyTimeRow}>
                <Text style={styles.historyTime}>
                  {item.arrivalTime} → {item.departureTime}
                </Text>
                {item.totalHours !== undefined && (
                  <Text style={styles.historyHours}>
                    {item.totalHours} hrs
                  </Text>
                )}
              </View>
              <View style={styles.historyViewRow}>
                <Text style={styles.historyViewText}>
                  View Summary
                </Text>
                <ChevronRight size={14} color={Colors.blue} />
              </View>
            </AppCard>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}>
      <AppCard style={styles.headerCard} variant="elevated" padding="xl">
        <Text style={styles.jobId}>{job.id}</Text>
        <Text style={styles.jobTitle}>{job.title}</Text>
        <View style={styles.badges}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}15` },
            ]}>
            <View style={[styles.dot, { backgroundColor: statusColor }]} />
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {capitalize(job.status)}
            </Text>
          </View>
        </View>
      </AppCard>

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
      <View style={styles.tabContent}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'scope' && renderScopeTab()}
        {activeTab === 'history' && renderHistoryTab()}
      </View>
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
  jobId: {
    ...Typography.caption,
    color: Colors.gray500,
    marginBottom: Spacing.xs,
  },
  jobTitle: {
    ...Typography.h2,
    color: Colors.navy,
    marginBottom: Spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statusBadge: {
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
    paddingBottom: Spacing.xxxl,
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
  statusRow: {
    marginTop: Spacing.xs,
  },
  fieldLabel: {
    ...Typography.caption,
    color: Colors.gray500,
    marginBottom: Spacing.xs,
  },
  fieldValue: {
    ...Typography.body,
    color: Colors.navy,
  },
  rowPair: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  roomsSection: {
    marginTop: Spacing.xs,
  },
  roomTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  roomTag: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  roomTagText: {
    ...Typography.captionBold,
    color: Colors.white,
  },
  notesCard: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.orangeLight,
    borderColor: Colors.orange,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  notesLabel: {
    ...Typography.captionBold,
    color: Colors.orange,
  },
  notesText: {
    ...Typography.body,
    color: Colors.gray700,
    lineHeight: 22,
  },
  startButton: {
    marginTop: Spacing.lg,
  },
  disabledHint: {
    ...Typography.caption,
    color: Colors.gray500,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  scopeTab: {
    gap: Spacing.lg,
  },
  scopeCard: {
    backgroundColor: Colors.white,
  },
  scopeTitle: {
    ...Typography.bodyBold,
    color: Colors.navy,
    marginBottom: Spacing.md,
  },
  scopeText: {
    ...Typography.body,
    color: Colors.gray700,
    lineHeight: 22,
  },
  floorPlanSection: {
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.navy,
  },
  floorPlanCard: {
    overflow: 'hidden',
  },
  floorPlanImage: {
    width: '100%',
    height: 220,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray100,
  },
  floorPlanLabel: {
    ...Typography.caption,
    color: Colors.gray700,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  docsSection: {
    gap: Spacing.md,
  },
  docCard: {
    marginBottom: 0,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  docName: {
    ...Typography.body,
    color: Colors.navy,
    flex: 1,
  },
  historyTab: {
    gap: Spacing.md,
  },
  historyCard: {
    marginBottom: 0,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  historyDate: {
    ...Typography.bodyBold,
    color: Colors.navy,
  },
  historyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.full,
  },
  historyBadgeText: {
    ...Typography.small,
    fontWeight: '600',
  },
  historyTech: {
    ...Typography.body,
    color: Colors.gray700,
    marginBottom: Spacing.xs,
  },
  historyTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  historyTime: {
    ...Typography.caption,
    color: Colors.gray500,
  },
  historyHours: {
    ...Typography.captionBold,
    color: Colors.blue,
  },
  historyViewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  historyViewText: {
    ...Typography.captionBold,
    color: Colors.blue,
  },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyHistoryText: {
    ...Typography.body,
    color: Colors.gray500,
    textAlign: 'center',
  },
});

export default JobDetailContent;

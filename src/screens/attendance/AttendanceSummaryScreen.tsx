import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  Clock,
  User,
  MapPin,
  FileText,
  CheckCircle,
  AlertTriangle,
  Shield,
  Package,
  Home,
  PenTool,
  Calendar,
} from 'lucide-react-native';
import { AppCard, AppButton } from '../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import type { RootStackScreenProps } from '../../types/navigation';
import type { AttendanceHistoryItem } from '../../types/models';

// Mock attendance summary data - in production this would come from API
const MOCK_ATTENDANCE_SUMMARY = {
  id: 'att_1',
  jobId: 'JOB-20250326-001',
  jobTitle: 'Water Damage Restoration — Unit 4',
  date: '20-03-2026',
  technicianName: 'James Wilson',
  technicianId: 'tech_1',

  // Step 1: OHS Declaration
  ohsDeclaration: {
    asbestosAcknowledged: true,
    checkedItems: [
      'Personal Protective Equipment (PPE) worn',
      'Area secured and barricaded',
      'Emergency procedures reviewed',
      'First aid kit accessible',
    ],
    completedAt: '2026-03-28T09:15:00Z',
  },

  // Step 2: JSA
  jsa: {
    sopName: 'Water Extraction — Category 2',
    hazardsReviewed: [
      {
        description: 'Slip hazards from water damage',
        risk: 'High',
        control: 'Wear slip-resistant footwear',
      },
      {
        description: 'Electrical shock from wet equipment',
        risk: 'High',
        control: 'Isolate power before starting',
      },
      {
        description: 'Manual handling - heavy equipment',
        risk: 'Medium',
        control: 'Use proper lifting technique',
      },
    ],
    technicianSignature: {
      signerName: 'James Wilson',
      timestamp: '2026-03-28T09:16:00Z',
    },
    completedAt: '2026-03-28T09:16:00Z',
  },

  // Step 3: Arrival Check-in
  arrivalCheckIn: {
    arrivalTime: '09:15 AM',
    siteAccessible: true,
    hasHazards: false,
    hazardNotes: '',
    clientOnSite: true,
    clientName: 'John Smith',
    completedAt: '2026-03-28T09:17:00Z',
  },

  // Step 4: Room Inspection
  roomInspections: [
    {
      roomId: 'r1',
      roomName: 'Kitchen',
      floor: 'Ground',
      status: 'complete',
      photos: 4,
      moistureReadings: 3,
    },
    {
      roomId: 'r2',
      roomName: 'Hallway',
      floor: 'Ground',
      status: 'complete',
      photos: 2,
      moistureReadings: 2,
    },
    {
      roomId: 'r3',
      roomName: 'Living Room',
      floor: 'Ground',
      status: 'complete',
      photos: 5,
      moistureReadings: 4,
    },
  ],

  // Step 5: Form 2 Signing (if invasive works)
  form2Signing: {
    required: true,
    clientName: 'John Smith',
    clientSignature: {
      signerName: 'John Smith',
      timestamp: '2026-03-28T09:30:00Z',
    },
    technicianSignature: {
      signerName: 'James Wilson',
      timestamp: '2026-03-28T09:31:00Z',
    },
    completedAt: '2026-03-28T09:31:00Z',
  },

  // Step 6: Consumables
  consumables: [
    { name: 'Dehumidifier', quantity: 2, unit: 'unit' },
    { name: 'Air Mover', quantity: 4, unit: 'unit' },
    { name: 'Moisture Meter', quantity: 1, unit: 'unit' },
    { name: 'Plastic Sheeting', quantity: 10, unit: 'm²' },
    { name: 'Antimicrobial Solution', quantity: 2, unit: 'L' },
  ],

  // Step 7: Departure
  departure: {
    departureTime: '01:45 PM',
    hasIssues: false,
    issuesNotes: '',
    siteClean: true,
    totalHours: 4.5,
    completedAt: '2026-03-28T13:45:00Z',
  },

  // Final status
  status: 'Submitted',
  submittedAt: '2026-03-28T13:46:00Z',
};

const AttendanceSummaryScreen: React.FC = () => {
  const route = useRoute<RootStackScreenProps<'AttendanceSummary'>['route']>();
  const navigation = useNavigation();
  const { attendanceId, jobId } = route.params;

  const summary = MOCK_ATTENDANCE_SUMMARY;

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return Colors.red;
      case 'Medium':
        return Colors.orange;
      case 'Low':
        return Colors.green;
      default:
        return Colors.gray500;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <AppCard style={styles.headerCard} variant="elevated" padding="xl">
        <View style={styles.headerRow}>
          <Calendar size={18} color={Colors.blue} />
          <Text style={styles.headerDate}>{summary.date}</Text>
        </View>
        <Text style={styles.jobTitle}>{summary.jobTitle}</Text>
        <View style={styles.statusBadge}>
          <CheckCircle size={18} color={Colors.green} />
          <Text style={styles.statusText}>{summary.status}</Text>
        </View>
      </AppCard>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Technician</Text>
        <AppCard variant="outlined" padding="md">
          <View style={styles.techRow}>
            <User size={18} color={Colors.blue} />
            <Text style={styles.techName}>{summary.technicianName}</Text>
          </View>
        </AppCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time Summary</Text>
        <AppCard variant="outlined" padding="md" style={styles.timeCard}>
          <View style={styles.timeRow}>
            <View style={styles.timeItem}>
              <Clock size={18} color={Colors.blue} />
              <Text style={styles.timeLabel}>Arrival</Text>
              <Text style={styles.timeValue}>
                {summary.arrivalCheckIn.arrivalTime}
              </Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeItem}>
              <Clock size={18} color={Colors.blue} />
              <Text style={styles.timeLabel}>Departure</Text>
              <Text style={styles.timeValue}>
                {summary.departure.departureTime}
              </Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeItem}>
              <Clock size={18} color={Colors.blue} />
              <Text style={styles.totalHoursLabel}>Total Hr</Text>
              <Text style={styles.totalHoursValue}>
                {summary.departure.totalHours} hrs
              </Text>
            </View>
          </View>
        </AppCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>OHS Declaration</Text>
        <AppCard variant="outlined" padding="md">
          <View style={styles.ohsHeader}>
            <Shield size={18} color={Colors.green} />
            <Text style={styles.ohsStatus}>Safety Checks Completed</Text>
          </View>
          {summary.ohsDeclaration.checkedItems.map((item, index) => (
            <View key={index} style={styles.checkItem}>
              <CheckCircle size={18} color={Colors.green} />
              <Text style={styles.checkText}>{item}</Text>
            </View>
          ))}
          {summary.ohsDeclaration.asbestosAcknowledged && (
            <View style={styles.asbestosWarning}>
              <AlertTriangle size={18} color={Colors.orange} />
              <Text style={styles.asbestosText}>
                Asbestos risk acknowledged
              </Text>
            </View>
          )}
        </AppCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Job Safety Analysis</Text>
        <AppCard variant="outlined" padding="md">
          <Text style={styles.jsaSop}>{summary.jsa.sopName}</Text>
          <Text style={styles.jsaSubtitle}>Hazards Reviewed</Text>
          {summary.jsa.hazardsReviewed.map((hazard, index) => (
            <View key={index} style={styles.hazardItem}>
              <View style={styles.hazardHeader}>
                <Text style={styles.hazardNumber}>#{index + 1}</Text>
                <View
                  style={[
                    styles.riskBadge,
                    { backgroundColor: getRiskColor(hazard.risk) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.riskText,
                      { color: getRiskColor(hazard.risk) },
                    ]}
                  >
                    {hazard.risk}
                  </Text>
                </View>
              </View>
              <Text style={styles.hazardDesc}>{hazard.description}</Text>
              <Text style={styles.hazardControl}>
                Control: {hazard.control}
              </Text>
            </View>
          ))}
          <View style={styles.signatureRow}>
            <PenTool size={18} color={Colors.gray500} />
            <Text style={styles.signatureText}>
              Signed by {summary.jsa.technicianSignature.signerName}
            </Text>
          </View>
        </AppCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Arrival Check-in</Text>
        <AppCard variant="outlined" padding="md">
          <View style={styles.checkInGrid}>
            <View style={styles.checkInItem}>
              <Text style={styles.checkInLabel}>Site Accessible</Text>
              <Text style={styles.checkInValue}>
                {summary.arrivalCheckIn.siteAccessible ? 'Yes' : 'No'}
              </Text>
            </View>
            <View style={styles.checkInItem}>
              <Text style={styles.checkInLabel}>Client On Site</Text>
              <Text style={styles.checkInValue}>
                {summary.arrivalCheckIn.clientOnSite ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>
          {summary.arrivalCheckIn.clientOnSite && (
            <View style={styles.clientRow}>
              <User size={18} color={Colors.gray500} />
              <Text style={styles.clientName}>
                Client: {summary.arrivalCheckIn.clientName}
              </Text>
            </View>
          )}
        </AppCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Room Inspections</Text>
        {summary.roomInspections.map(room => (
          <AppCard
            key={room.roomId}
            variant="outlined"
            padding="md"
            style={styles.roomCard}
          >
            <View style={styles.roomHeader}>
              <Home size={18} color={Colors.blue} />
              <Text style={styles.roomName}>{room.roomName}</Text>
              <View style={styles.roomStatusBadge}>
                <CheckCircle size={12} color={Colors.green} />
                <Text style={styles.roomStatusText}>{room.status}</Text>
              </View>
            </View>
            <View style={styles.roomStats}>
              <View style={styles.roomStat}>
                <Text style={styles.roomStatValue}>{room.photos}</Text>
                <Text style={styles.roomStatLabel}>Photos</Text>
              </View>
              <View style={styles.roomStat}>
                <Text style={styles.roomStatValue}>
                  {room.moistureReadings}
                </Text>
                <Text style={styles.roomStatLabel}>Moisture Readings</Text>
              </View>
            </View>
          </AppCard>
        ))}
      </View>

      {summary.form2Signing.required && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Form 2 - Invasive Works</Text>
          <AppCard variant="outlined" padding="md">
            <View style={styles.form2Row}>
              <FileText size={18} color={Colors.navy} />
              <Text style={styles.form2Text}>Form 2 completed and signed</Text>
            </View>
            <View style={styles.signaturesList}>
              <View style={styles.signatureItem}>
                <Text style={styles.signatureLabel}>Client:</Text>
                <Text style={styles.signatureName}>
                  {summary.form2Signing.clientName}
                </Text>
              </View>
              <View style={styles.signatureItem}>
                <Text style={styles.signatureLabel}>Technician:</Text>
                <Text style={styles.signatureName}>
                  {summary.form2Signing.technicianSignature.signerName}
                </Text>
              </View>
            </View>
          </AppCard>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consumables Used</Text>
        <AppCard variant="outlined" padding="md">
          {summary.consumables.map((item, index) => (
            <View key={index} style={styles.consumableRow}>
              <View style={styles.consumableInfo}>
                <Package size={16} color={Colors.blue} />
                <Text style={styles.consumableName}>{item.name}</Text>
              </View>
              <Text style={styles.consumableQuantity}>
                {item.quantity} {item.unit}
              </Text>
            </View>
          ))}
        </AppCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Departure Check-out</Text>
        <AppCard variant="outlined" padding="md">
          <View style={styles.departureGrid}>
            <View style={styles.departureItem}>
              <Text style={styles.departureLabel}>Site Clean</Text>
              <Text style={styles.departureValue}>
                {summary.departure.siteClean ? 'Yes' : 'No'}
              </Text>
            </View>
            <View style={styles.departureItem}>
              <Text style={styles.departureLabel}>Issues Reported</Text>
              <Text style={styles.departureValue}>
                {summary.departure.hasIssues ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>
          {summary.departure.hasIssues && summary.departure.issuesNotes && (
            <View style={styles.issuesNote}>  
              <AlertTriangle size={18} color={Colors.orange} />
              <Text style={styles.issuesText}>
                {summary.departure.issuesNotes}
              </Text>
            </View>
          )}
        </AppCard>
      </View>

      <View style={styles.footer}>
        <Text style={styles.submittedText}>
          Submitted on {new Date(summary.submittedAt).toLocaleString()}
        </Text>
        <AppButton
          title="Back to Job"
          onPress={() => navigation.goBack()}
          variant="outline"
          fullWidth
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  headerCard: {
    margin: Spacing.lg,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  headerDate: {
    ...Typography.bodyBold,
    color: Colors.blue,
  },
  jobTitle: {
    ...Typography.h3,
    color: Colors.navy,
    marginBottom: Spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.greenLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...Typography.captionBold,
    color: Colors.green,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.navy,
    marginBottom: Spacing.sm,
  },
  techRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  techName: {
    ...Typography.body,
    color: Colors.navy,
  },
  timeCard: {
    backgroundColor: Colors.navy,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeItem: {
    alignItems: 'center',
    flex: 1,
  },
  timeLabel: {
    ...Typography.caption,
    color: Colors.gray500,
    marginTop: Spacing.xs,
  },
  timeValue: {
    ...Typography.bodyBold,
    color: Colors.white,
    marginTop: Spacing.xxs,
  },
  timeDivider: {
    width: 1,
    height: 70,
    backgroundColor: Colors.gray300,
  },
  totalHoursLabel: {
    ...Typography.caption,
    color: Colors.gray500,
  },
  totalHoursValue: {
    ...Typography.h3,
    color: Colors.blue,
  },
  ohsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  ohsStatus: {
    ...Typography.bodyBold,
    color: Colors.green,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  checkText: {
    ...Typography.body,
    color: Colors.gray700,
  },
  asbestosWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray300,
  },
  asbestosText: {
    ...Typography.caption,
    color: Colors.orange,
  },
  jsaSop: {
    ...Typography.bodyBold,
    color: Colors.navy,
    marginBottom: Spacing.sm,
  },
  jsaSubtitle: {
    ...Typography.caption,
    color: Colors.gray500,
    marginBottom: Spacing.md,
  },
  hazardItem: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray300,
  },
  hazardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  hazardNumber: {
    ...Typography.captionBold,
    color: Colors.gray500,
  },
  riskBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.sm,
  },
  riskText: {
    ...Typography.captionBold,
  },
  hazardDesc: {
    ...Typography.bodyBold,
    color: Colors.navy,
    marginBottom: Spacing.xs,
  },
  hazardControl: {
    ...Typography.caption,
    color: Colors.gray500,
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray300,
  },
  signatureText: {
    ...Typography.caption,
    color: Colors.gray500,
  },
  checkInGrid: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  checkInItem: {
    flex: 1,
  },
  checkInLabel: {
    ...Typography.caption,
    color: Colors.gray500,
    marginBottom: Spacing.xs,
  },
  checkInValue: {
    ...Typography.bodyBold,
    color: Colors.navy,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray300,
  },
  clientName: {
    ...Typography.body,
    color: Colors.navy,
  },
  roomCard: {
    marginBottom: Spacing.sm,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  roomName: {
    ...Typography.bodyBold,
    color: Colors.navy,
    flex: 1,
  },
  roomStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.greenLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.full,
  },
  roomStatusText: {
    ...Typography.captionBold,
    color: Colors.green,
    textTransform: 'capitalize',
  },
  roomStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  roomStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  roomStatValue: {
    ...Typography.bodyBold,
    color: Colors.blue,
  },
  roomStatLabel: {
    ...Typography.caption,
    color: Colors.gray500,
  },
  form2Row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  form2Text: {
    ...Typography.bodyBold,
    color: Colors.navy,
  },
  signaturesList: {
    gap: Spacing.sm,
  },
  signatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  signatureLabel: {
    ...Typography.caption,
    color: Colors.gray500,
  },
  signatureName: {
    ...Typography.body,
    color: Colors.navy,
  },
  consumableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  consumableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  consumableName: {
    ...Typography.body,
    color: Colors.navy,
  },
  consumableQuantity: {
    ...Typography.bodyBold,
    color: Colors.blue,
  },
  departureGrid: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  departureItem: {
    flex: 1,
  },
  departureLabel: {
    ...Typography.caption,
    color: Colors.gray500,
    marginBottom: Spacing.xs,
  },
  departureValue: {
    ...Typography.bodyBold,
    color: Colors.navy,
  },
  issuesNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray300,
  },
  issuesText: {
    ...Typography.caption,
    color: Colors.orange,
    flex: 1,
  },
  footer: {
    margin: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.xxxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  submittedText: {
    ...Typography.caption,
    color: Colors.gray500,
  },
});

export default AttendanceSummaryScreen;

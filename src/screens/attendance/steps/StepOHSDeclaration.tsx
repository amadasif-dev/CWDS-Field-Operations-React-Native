import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setStepData } from '../../../store/slices/attendanceSlice';
import {
  AppButton,
  AppCard,
  AppCheckbox,
  AppProgressBar,
  BottomSheetAlert,
} from '../../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';

interface StepOHSDeclarationProps {
  jobId: string;
  onNext: () => void;
}

const CHECKLIST_ITEMS = [
  {
    id: 'hazards_identified',
    label: 'I have inspected the site and identified all hazards',
  },
  { id: 'ppe_appropriate', label: 'I have appropriate PPE for this job' },
  { id: 'asbestos_aware', label: 'I am aware of asbestos risk (if flagged)' },
  {
    id: 'emergency_exits',
    label: 'Emergency exits and first aid locations are known',
  },
  {
    id: 'jsa_reviewed',
    label: 'I have reviewed the site-specific JSA for this attendance',
  },
  {
    id: 'fit_to_work',
    label: 'I am fit to work (not impaired, no medical restrictions today)',
  },
];

const StepOHSDeclaration: React.FC<StepOHSDeclarationProps> = ({
  jobId,
  onNext,
}) => {
  const dispatch = useAppDispatch();
  const stepData = useAppSelector(state => state.attendance.stepData[1]);
  const jobDetails = useAppSelector(state => state.jobs.selectedJob);

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
    (stepData?.checkedItems as Record<string, boolean>) || {},
  );
  const [asbestosAcknowledged, setAsbestosAcknowledged] = useState(
    stepData?.asbestosAcknowledged || false,
  );
  const [showAsbestosModal, setShowAsbestosModal] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);

  // Check for asbestos risk on mount
  useEffect(() => {
    const siteIntel = jobDetails?.siteIntelligence;
    const hasAsbestosRisk =
      siteIntel?.asbestosRisk ||
      (siteIntel?.constructionYear && siteIntel.constructionYear < 1990) ||
      siteIntel?.materials?.some(
        (m: string) =>
          m.toLowerCase().includes('fibrous') ||
          m.toLowerCase().includes('cement') ||
          m.toLowerCase().includes('acms'),
      );

    if (hasAsbestosRisk && !asbestosAcknowledged) {
      setShowAsbestosModal(true);
    }
  }, [jobDetails, asbestosAcknowledged]);

  const handleToggleCheck = useCallback((id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const handleAsbestosAcknowledge = useCallback(() => {
    setAsbestosAcknowledged(true);
    setShowAsbestosModal(false);
  }, []);

  const allChecked = CHECKLIST_ITEMS.every(item => checkedItems[item.id]);

  const handleNext = useCallback(() => {
    if (!allChecked) {
      setShowValidationAlert(true);
      return;
    }

    dispatch(
      setStepData({
        step: 1,
        data: {
          checkedItems,
          asbestosAcknowledged,
          allChecked: true,
          completedAt: new Date().toISOString(),
        },
      }),
    );
    onNext();
  }, [allChecked, checkedItems, asbestosAcknowledged, dispatch, onNext]);

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Shield size={32} color={Colors.gold} />
          <Text style={styles.title}>OH&S Pre-Work Declaration</Text>
          <Text style={styles.subtitle}>
            You must read and acknowledge all items before beginning work.
          </Text>
        </View>

        <AppCard variant="elevated" padding="lg" style={styles.card}>
          <View style={styles.checklistHeader}>
            <Shield size={20} color={Colors.gold} />
            <Text style={styles.checklistTitle}>Safety Checklist</Text>
          </View>
          <Text style={styles.checklistSubtitle}>
            All items are required to proceed
          </Text>

          <View style={styles.checklist}>
            {CHECKLIST_ITEMS.map(item => (
              <AppCheckbox
                key={item.id}
                label={item.label}
                checked={checkedItems[item.id] || false}
                onChange={() => handleToggleCheck(item.id)}
              />
            ))}
          </View>
        </AppCard>

        <AppProgressBar
          current={Object.values(checkedItems).filter(Boolean).length}
          total={CHECKLIST_ITEMS.length}
          backgroundColor="rgba(255,255,255,0.2)"
          fillColor={Colors.blue}
          completeColor={Colors.green}
        />

        <AppButton
          title="Next"
          onPress={handleNext}
          variant={allChecked ? 'primary' : 'secondary'}
          disabled={!allChecked}
          size="lg"
          style={styles.nextButton}
        />
      </ScrollView>

      <Modal
        visible={showAsbestosModal}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.warningIconContainer}>
              <AlertTriangle size={48} color={Colors.white} />
            </View>

            <Text style={styles.modalTitle}>ASBESTOS RISK IDENTIFIED</Text>

            <Text style={styles.modalText}>
              This site has indicators of potential asbestos-containing
              materials.
            </Text>

            <Text style={styles.modalWarning}>
              Do NOT proceed unless you are licensed and equipped.
            </Text>

            <Text style={styles.modalSubtext}>
              Acknowledge to continue with the attendance.
            </Text>

            <TouchableOpacity
              style={styles.acknowledgeButton}
              onPress={handleAsbestosAcknowledge}
            >
              <Text style={styles.acknowledgeButtonText}>
                I Acknowledge This Risk
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomSheetAlert
        visible={showValidationAlert}
        type="warning"
        title="Incomplete Checklist"
        message="Please tick all 6 safety checklist items before proceeding."
        primaryLabel="OK"
        onClose={() => setShowValidationAlert(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.white,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.gray300,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    marginBottom: Spacing.xl,
  },
  checklistTitle: {
    ...Typography.h3,
    color: Colors.navy,
    marginBottom: Spacing.xs,
  },
  checklistSubtitle: {
    ...Typography.caption,
    color: Colors.gray500,
    marginBottom: Spacing.lg,
  },
  checklist: {
    gap: Spacing.md,
  },
  checkbox: {
    marginBottom: Spacing.sm,
  },
  nextButton: {
    marginTop: Spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.red,
  },
  warningIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.red,
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontWeight: 'bold',
  },
  modalText: {
    ...Typography.body,
    color: Colors.gray700,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  modalWarning: {
    ...Typography.bodyBold,
    color: Colors.red,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.redLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  modalSubtext: {
    ...Typography.caption,
    color: Colors.gray500,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  acknowledgeButton: {
    backgroundColor: Colors.red,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    width: '100%',
  },
  acknowledgeButtonText: {
    ...Typography.bodyBold,
    color: Colors.white,
    textAlign: 'center',
  },
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});

export default React.memo(StepOHSDeclaration);

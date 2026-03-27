import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Image,
} from 'react-native';
import { FileText, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  setStepData,
  setSignature,
} from '../../../store/slices/attendanceSlice';
import {
  AppButton,
  AppCard,
  BottomSheetAlert,
  SignatureModal,
} from '../../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';
import type {
  JSAStepData,
  Hazard,
  Signature as SignatureType,
} from '../../../types/models';
import { SignatureModalRef } from '../../../components/common/SignatureModal';

interface StepJSAProps {
  onNext: () => void;
  onPrev: () => void;
}

const MOCK_JSA_HAZARDS: Hazard[] = [
  {
    description: 'Slip hazards from water damage',
    risk: 'High',
    control: 'Wear slip-resistant footwear; use caution signage',
  },
  {
    description: 'Electrical shock from wet equipment',
    risk: 'High',
    control: 'Isolate power before starting; test with voltage detector',
  },
  {
    description: 'Manual handling - heavy equipment',
    risk: 'Medium',
    control: 'Use proper lifting technique; team lift over 20kg',
  },
  {
    description: 'Chemical exposure from cleaning agents',
    risk: 'Medium',
    control: 'Wear PPE (gloves, goggles); follow SDS instructions',
  },
  {
    description: 'Noise exposure from drying equipment',
    risk: 'Low',
    control: 'Use hearing protection if exposure > 85dB',
  },
];

const StepJSA: React.FC<StepJSAProps> = ({ onNext, onPrev }) => {
  const dispatch = useAppDispatch();
  const stepData = useAppSelector(state => state.attendance.stepData[2]);
  const jobDetails = useAppSelector(state => state.jobs.selectedJob);
  const savedSignature = useAppSelector(state => state.attendance.signature);

  const [scrolledToBottom, setScrolledToBottom] = useState(
    (stepData as unknown as JSAStepData | undefined)?.scrolledToBottom || false,
  );
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [technicianSignature, setTechnicianSignature] =
    useState<SignatureType | null>(
      savedSignature ||
        (stepData as unknown as JSAStepData | undefined)?.technicianSignature ||
        null,
    );
  const signatureModalRef = useRef<SignatureModalRef>(null);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Get JSA from job details or use mock data
  const jsaHazards = jobDetails?.jsa?.hazards || MOCK_JSA_HAZARDS;
  const sopName = jobDetails?.jsa?.sopName || 'Water Extraction — Category 2';

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const paddingToBottom = 20;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;

      if (isCloseToBottom && !scrolledToBottom) {
        setScrolledToBottom(true);
      }
    },
    [scrolledToBottom],
  );

  const handleSignatureSave = useCallback(
    (base64: string) => {
      const signature: SignatureType = {
        base64,
        timestamp: new Date().toISOString(),
        signerName: '',
        signerRole: 'Technician',
      };
      setTechnicianSignature(signature);
      dispatch(setSignature(signature));
      setShowSignatureModal(false);
    },
    [dispatch],
  );

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

  const handleNext = useCallback(() => {
    if (!scrolledToBottom) {
      setValidationMessage(
        'Please scroll to the bottom of the JSA document before proceeding.',
      );
      setShowValidationAlert(true);
      return;
    }

    if (!technicianSignature) {
      setValidationMessage(
        'Please provide your signature to confirm you have read and understood the JSA.',
      );
      setShowValidationAlert(true);
      return;
    }

    dispatch(
      setStepData({
        step: 2,
        data: {
          sopName,
          hazards: jsaHazards,
          technicianSignature,
          scrolledToBottom: true,
          signatureTimestamp: technicianSignature.timestamp,
          completedAt: new Date().toISOString(),
        },
      }),
    );
    onNext();
  }, [
    scrolledToBottom,
    technicianSignature,
    sopName,
    jsaHazards,
    dispatch,
    onNext,
  ]);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <FileText size={28} color={Colors.navy} />
          <Text style={styles.title}>Job Safety Analysis</Text>
          <Text style={styles.subtitle}>{sopName}</Text>
        </View>

        <AppCard
          variant="outlined"
          padding="md"
          style={[
            styles.scrollGateCard,
            {
              backgroundColor: scrolledToBottom
                ? Colors.greenLight
                : Colors.orangeLight,
            },
          ]}
        >
          <View style={styles.scrollGateRow}>
            {scrolledToBottom ? (
              <>
                <CheckCircle size={20} color={Colors.green} />
                <Text style={styles.scrollGateComplete}>JSA reviewed</Text>
              </>
            ) : (
              <>
                <AlertTriangle size={20} color={Colors.orange} />
                <Text style={styles.scrollGateText}>
                  Scroll to bottom to continue
                </Text>
              </>
            )}
          </View>
        </AppCard>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.sectionTitle}>Hazard Items</Text>
          <Text style={styles.sectionSubtitle}>
            Review each hazard and associated control measures
          </Text>

          <View style={styles.hazardsList}>
            {jsaHazards.map((hazard, index) => (
              <AppCard
                key={index}
                variant="outlined"
                padding="md"
                style={styles.hazardCard}
              >
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
                      {hazard.risk} Risk
                    </Text>
                  </View>
                </View>

                <Text style={styles.hazardDescription}>
                  {hazard.description}
                </Text>

                <View style={styles.controlSection}>
                  <Text style={styles.controlLabel}>Control Measure:</Text>
                  <Text style={styles.controlText}>{hazard.control}</Text>
                </View>
              </AppCard>
            ))}
          </View>

          <View style={styles.signatureSection}>
            <Text style={styles.signatureTitle}>Technician Signature</Text>
            <Text style={styles.signatureSubtitle}>
              I have read and understood this Job Safety Analysis
            </Text>

            {technicianSignature ? (
              <View style={styles.signaturePreview}>
                <View style={styles.signatureImageContainer}>
                  <View style={styles.signatureImage}>
                    <Image
                      source={{ uri: technicianSignature.base64 }}
                      style={styles.signatureImageContent}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.signatureInfo}>
                    <Text style={styles.signatureText}>
                      ✓ Signed by {technicianSignature.signerName}
                    </Text>
                    <Text style={styles.signatureTime}>
                      {new Date(technicianSignature.timestamp).toLocaleString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.signatureActions}>
                  <AppButton
                    title="Sign Again"
                    onPress={() => setShowSignatureModal(true)}
                    variant="outline"
                    size="sm"
                  />
                  <AppButton
                    title="Clear"
                    onPress={() => setTechnicianSignature(null)}
                    variant="ghost"
                    size="sm"
                  />
                </View>
              </View>
            ) : (
              <AppButton
                title="Add Signature"
                onPress={() => setShowSignatureModal(true)}
                variant="outline"
                icon={<FileText size={18} color={Colors.blue} />}
              />
            )}
          </View>

          <View style={styles.actions}>
            <AppButton
              title="Previous"
              onPress={onPrev}
              variant="outline"
              style={styles.actionBtn}
            />
            <AppButton
              title="Confirm & Next"
              onPress={handleNext}
              variant={
                scrolledToBottom && technicianSignature
                  ? 'primary'
                  : 'secondary'
              }
              disabled={!scrolledToBottom || !technicianSignature}
              style={styles.actionBtn}
            />
          </View>
        </ScrollView>
      </View>

      <SignatureModal
        ref={signatureModalRef}
        visible={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSave={handleSignatureSave}
        title="Technician Signature"
        subtitle="Please sign in the box below"
        penColor="#000000"
        backgroundColor="#ffffff"
        clearText="Clear"
        confirmText="Done Signature"
      />

      <BottomSheetAlert
        visible={showValidationAlert}
        type="warning"
        title="Validation Required"
        message={validationMessage}
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
  header: {
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  title: {
    ...Typography.h2,
    color: Colors.navy,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.gray500,
  },
  scrollGateCard: {
    margin: Spacing.lg,
    marginBottom: 0,
  },
  scrollGateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  scrollGateText: {
    ...Typography.bodyBold,
    color: Colors.orange,
  },
  scrollGateComplete: {
    ...Typography.bodyBold,
    color: Colors.green,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.navy,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    ...Typography.caption,
    color: Colors.gray500,
    marginBottom: Spacing.lg,
  },
  hazardsList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  hazardCard: {
    marginBottom: 0,
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
  hazardDescription: {
    ...Typography.bodyBold,
    color: Colors.navy,
    marginBottom: Spacing.md,
  },
  controlSection: {
    backgroundColor: Colors.gray100,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  controlLabel: {
    ...Typography.captionBold,
    color: Colors.gray700,
    marginBottom: Spacing.xs,
  },
  controlText: {
    ...Typography.body,
    color: Colors.gray700,
  },
  signatureSection: {
    marginBottom: Spacing.xl,
  },
  signatureTitle: {
    ...Typography.bodyBold,
    color: Colors.navy,
    marginBottom: Spacing.xs,
  },
  signatureSubtitle: {
    ...Typography.caption,
    color: Colors.gray500,
    marginBottom: Spacing.md,
  },
  signaturePreview: {
    backgroundColor: Colors.gray100,
    borderWidth: Spacing.xxs,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  signaturePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  signaturePreviewText: {
    ...Typography.bodyBold,
    color: Colors.green,
  },

  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionBtn: {
    flex: 1,
  },

  signatureImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gray500,
  },
  signatureImage: {
    width: 120,
    height: 60,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
  signatureImageContent: {
    width: '100%',
    height: '100%',
  },
  signatureInfo: {
    flex: 1,
  },
  signatureText: {
    ...Typography.bodyBold,
    color: Colors.green,
    marginBottom: Spacing.xxs,
  },
  signatureTime: {
    ...Typography.caption,
    color: Colors.gray500,
  },
  signatureActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'flex-end',
    paddingTop: Spacing.md,
  },

});

export default React.memo(StepJSA);

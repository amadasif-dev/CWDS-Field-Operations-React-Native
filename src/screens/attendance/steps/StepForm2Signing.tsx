import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { FileText, AlertCircle, CheckCircle, PenTool, X } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setStepData, setSignature } from '../../../store/slices/attendanceSlice';
import {
  AppButton,
  AppCard,
  AppInput,
  BottomSheetAlert,
  SignatureModal,
} from '../../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';
import type { Form2SigningData, Signature as SignatureType } from '../../../types/models';

interface StepForm2SigningProps {
  onNext: () => void;
  onPrev: () => void;
}

const StepForm2Signing: React.FC<StepForm2SigningProps> = ({ onNext, onPrev }) => {
  const dispatch = useAppDispatch();
  const stepData = useAppSelector(state => state.attendance.stepData[6]);
  const jobDetails = useAppSelector(state => state.jobs.selectedJob);
  const savedSignature = useAppSelector(state => state.attendance.signature);

  // Check if job has invasive works
  const isInvasive = jobDetails?.scope?.invasiveWorks ?? false;

  const [form2Scrolled, setForm2Scrolled] = useState(
    (stepData as unknown as Form2SigningData | undefined)?.form2Scrolled || false
  );
  const [clientName, setClientName] = useState(
    (stepData as unknown as Form2SigningData | undefined)?.clientName || ''
  );
  const [clientSignature, setClientSignature] = useState<SignatureType | null>(
    (stepData as unknown as Form2SigningData | undefined)?.clientSignature || null
  );
  const [technicianSignature, setTechnicianSignature] = useState<SignatureType | null>(
    savedSignature || (stepData as unknown as Form2SigningData | undefined)?.technicianSignature || null
  );
  const [showClientSignatureModal, setShowClientSignatureModal] = useState(false);
  const [showTechSignatureModal, setShowTechSignatureModal] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-skip if not invasive
  useEffect(() => {
    if (!isInvasive && stepData?.skipped) {
      onNext();
    }
  }, [isInvasive, stepData, onNext]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isCloseToBottom && !form2Scrolled) {
      setForm2Scrolled(true);
    }
  }, [form2Scrolled]);

  const handleClientSignatureSave = useCallback((base64: string) => {
    const signature: SignatureType = {
      base64,
      timestamp: new Date().toISOString(),
      signerName: clientName,
      signerRole: 'Client/Owner',
    };
    setClientSignature(signature);
    setShowClientSignatureModal(false);
  }, [clientName]);

  const handleTechSignatureSave = useCallback((base64: string) => {
    const signature: SignatureType = {
      base64,
      timestamp: new Date().toISOString(),
      signerName: '',
      signerRole: 'Technician',
    };
    setTechnicianSignature(signature);
    dispatch(setSignature(signature));
    setShowTechSignatureModal(false);
  }, [dispatch]);

  const handleSkip = useCallback(() => {
    dispatch(
      setStepData({
        step: 6,
        data: {
          isInvasive: false,
          skipped: true,
          skippedAt: new Date().toISOString(),
        },
      })
    );
    onNext();
  }, [dispatch, onNext]);

  const handleNext = useCallback(() => {
    if (!isInvasive) {
      handleSkip();
      return;
    }

    if (!form2Scrolled) {
      setValidationMessage('Please scroll through the entire Form 2 document before signing.');
      setShowValidationAlert(true);
      return;
    }

    if (!clientName.trim()) {
      setValidationMessage('Please enter the client/owner name.');
      setShowValidationAlert(true);
      return;
    }

    if (!clientSignature) {
      setValidationMessage('Please obtain the client/owner signature.');
      setShowValidationAlert(true);
      return;
    }

    if (!technicianSignature) {
      setValidationMessage('Please provide your technician signature as witness.');
      setShowValidationAlert(true);
      return;
    }

    dispatch(
      setStepData({
        step: 6,
        data: {
          clientName,
          clientSignature,
          technicianSignature,
          form2Scrolled: true,
          isInvasive: true,
          signedAt: new Date().toISOString(),
          skipped: false,
        },
      })
    );
    onNext();
  }, [
    isInvasive,
    form2Scrolled,
    clientName,
    clientSignature,
    technicianSignature,
    handleSkip,
    dispatch,
    onNext,
  ]);

  // Non-invasive: Show skip UI
  if (!isInvasive) {
    return (
      <View style={styles.container}>
        <View style={styles.skipContainer}>
          <CheckCircle size={48} color={Colors.green} />
          <Text style={styles.skipTitle}>Form 2 Not Required</Text>
          <Text style={styles.skipText}>
            This job does not include invasive works that require Form 2 authorization.
            You can proceed to the next step.
          </Text>
          <AppButton
            title="Continue"
            onPress={handleSkip}
            variant="primary"
            size="lg"
            style={styles.skipButton}
          />
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <FileText size={28} color={Colors.navy} />
          <Text style={styles.title}>Form 2 — Invasive Works</Text>
          <Text style={styles.subtitle}>Digital signing for invasive works authorization</Text>
        </View>

        {/* Scroll Gate */}
        <AppCard
          variant="outlined"
          padding="md"
          style={[styles.scrollGateCard, { backgroundColor: form2Scrolled ? Colors.greenLight : Colors.orangeLight }]}
        >
          <View style={styles.scrollGateRow}>
            {form2Scrolled ? (
              <>
                <CheckCircle size={20} color={Colors.green} />
                <Text style={styles.scrollGateComplete}>Document reviewed</Text>
              </>
            ) : (
              <>
                <AlertCircle size={20} color={Colors.orange} />
                <Text style={styles.scrollGateText}>Scroll to bottom to sign</Text>
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
          {/* Form 2 Document Content */}
          <AppCard variant="outlined" padding="lg" style={styles.formCard}>
            <Text style={styles.formTitle}>FORM 2 — INVASIVE WORKS AUTHORISATION</Text>
            <Text style={styles.formSubtitle}>
              Restoration Work Authorisation — Demolition, Cutting, Drilling
            </Text>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Property Address:</Text>
              <Text style={styles.formValue}>{jobDetails?.address || 'Not specified'}</Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Job Reference:</Text>
              <Text style={styles.formValue}>{jobDetails?.id || 'Not specified'}</Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Date:</Text>
              <Text style={styles.formValue}>{new Date().toLocaleDateString()}</Text>
            </View>

            <Text style={styles.formText}>
              I, the undersigned property owner or authorized representative, hereby authorize
              the listed restoration contractor to perform invasive works including but not
              limited to: demolition of affected materials, cutting of wall/ceiling cavities,
              drilling for moisture detection, and removal of non-restorable building materials.
            </Text>

            <Text style={styles.formText}>
              I understand that:
              {'\n\n'}
              1. Invasive works may be necessary to properly dry and restore the property{'\n'}
              2. Some building materials may need to be removed and replaced{'\n'}
              3. Additional costs may apply for materials and reconstruction{'\n'}
              4. The work will be performed according to industry standards{'\n'}
              5. I will be notified of any significant changes to the scope of work
            </Text>

            <Text style={styles.formClause}>
              By signing below, I confirm that I have read and understood this authorization
              and agree to the invasive works described herein.
            </Text>
          </AppCard>

          {/* Client Information */}
          <AppCard variant="outlined" padding="lg" style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Client/Owner Information</Text>

            <AppInput
              label="Full Name *"
              placeholder="Enter client/owner full name"
              value={clientName}
              onChangeText={setClientName}
            />

            <View style={styles.signatureSection}>
              <Text style={styles.signatureLabel}>Client/Owner Signature *</Text>
              {clientSignature ? (
                <AppCard variant="outlined" padding="md" style={styles.signaturePreview}>
                  <View style={styles.signatureRow}>
                    <CheckCircle size={20} color={Colors.green} />
                    <Text style={styles.signatureText}>Signature captured</Text>
                  </View>
                  <AppButton
                    title="Re-sign"
                    onPress={() => setShowClientSignatureModal(true)}
                    variant="outline"
                    size="sm"
                  />
                </AppCard>
              ) : (
                <AppButton
                  title="Add Client Signature"
                  onPress={() => setShowClientSignatureModal(true)}
                  variant="outline"
                  icon={<PenTool size={18} color={Colors.blue} />}
                />
              )}
            </View>
          </AppCard>

          {/* Technician Witness */}
          <AppCard variant="outlined" padding="lg" style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Technician Witness</Text>

            <View style={styles.signatureSection}>
              <Text style={styles.signatureLabel}>Technician Signature (Witness) *</Text>
              {technicianSignature ? (
                <AppCard variant="outlined" padding="md" style={styles.signaturePreview}>
                  <View style={styles.signatureRow}>
                    <CheckCircle size={20} color={Colors.green} />
                    <Text style={styles.signatureText}>Signature captured</Text>
                  </View>
                  <AppButton
                    title="Re-sign"
                    onPress={() => setShowTechSignatureModal(true)}
                    variant="outline"
                    size="sm"
                  />
                </AppCard>
              ) : (
                <AppButton
                  title="Add Technician Signature"
                  onPress={() => setShowTechSignatureModal(true)}
                  variant="outline"
                  icon={<PenTool size={18} color={Colors.blue} />}
                />
              )}
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
              title="Submit Signatures"
              onPress={handleNext}
              variant={form2Scrolled && clientName && clientSignature && technicianSignature ? 'primary' : 'secondary'}
              disabled={!form2Scrolled || !clientName || !clientSignature || !technicianSignature}
              style={styles.actionBtn}
            />
          </View>
        </ScrollView>
      </View>

      <SignatureModal
        visible={showClientSignatureModal}
        onClose={() => setShowClientSignatureModal(false)}
        onSave={handleClientSignatureSave}
        title="Client/Owner Signature"
        subtitle="Please sign to authorize invasive works"
      />

      <SignatureModal
        visible={showTechSignatureModal}
        onClose={() => setShowTechSignatureModal(false)}
        onSave={handleTechSignatureSave}
        title="Technician Signature"
        subtitle="Sign as witness to the authorization"
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
  skipContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  skipTitle: {
    ...Typography.h2,
    color: Colors.navy,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  skipText: {
    ...Typography.body,
    color: Colors.gray500,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  skipButton: {
    minWidth: 200,
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
  formCard: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.white,
  },
  formTitle: {
    ...Typography.h3,
    color: Colors.navy,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  formSubtitle: {
    ...Typography.caption,
    color: Colors.gray500,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  formSection: {
    marginBottom: Spacing.md,
  },
  formLabel: {
    ...Typography.captionBold,
    color: Colors.gray700,
    marginBottom: Spacing.xxs,
  },
  formValue: {
    ...Typography.body,
    color: Colors.navy,
  },
  formText: {
    ...Typography.body,
    color: Colors.gray700,
    marginTop: Spacing.lg,
    lineHeight: 22,
  },
  formClause: {
    ...Typography.bodyBold,
    color: Colors.navy,
    marginTop: Spacing.lg,
    fontStyle: 'italic',
  },
  sectionCard: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.navy,
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  signatureSection: {
    marginTop: Spacing.lg,
  },
  signatureLabel: {
    ...Typography.captionBold,
    color: Colors.gray700,
    marginBottom: Spacing.sm,
  },
  signaturePreview: {
    backgroundColor: Colors.greenLight,
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  signatureText: {
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
});

export default React.memo(StepForm2Signing);

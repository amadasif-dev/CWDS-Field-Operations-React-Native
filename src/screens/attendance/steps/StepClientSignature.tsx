import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { PenTool } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setStepData, setSignature, clearSignature } from '../../../store/slices/attendanceSlice';
import { AppButton, AppInput, AppCard } from '../../../components';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import SignatureModal, { SignatureModalRef } from '../../../components/common/SignatureModal';
import BottomSheetAlert from '../../../components/common/BottomSheetAlert';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';

interface StepClientSignatureProps {
  onNext: () => void;
  onPrev: () => void;
}

const StepClientSignature: React.FC<StepClientSignatureProps> = ({
  onNext,
  onPrev,
}) => {
  const dispatch = useAppDispatch();
  const signature = useAppSelector((state) => state.attendance.signature);
  const stepData = useAppSelector((state) => state.attendance.stepData[7]);

  const [signerName, setSignerName] = useState(
    (stepData?.signerName as string) ?? '',
  );
  const [signerRole, setSignerRole] = useState(
    (stepData?.signerRole as string) ?? '',
  );
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const signatureModalRef = useRef<SignatureModalRef>(null);

  const handleSignatureSave = useCallback(
    (signatureBase64: string) => {
      dispatch(
        setSignature({
          base64: signatureBase64,
          timestamp: new Date().toISOString(),
          signerName: signerName || 'Client',
          signerRole: signerRole || 'Authorized Representative',
        }),
      );
    },
    [dispatch, signerName, signerRole]
  );

  const handleClearConfirm = useCallback(() => {
    dispatch(clearSignature());
    setShowClearConfirmation(false);
  }, [dispatch]);

  const handleClear = useCallback(() => {
    setShowClearConfirmation(true);
  }, []);

  const handleNext = useCallback(() => {
    if (!signature) {
      setValidationMessage('Client signature is required.');
      setShowValidationAlert(true);
      return;
    }
    if (!signerName.trim()) {
      setValidationMessage('Signer name is required.');
      setShowValidationAlert(true);
      return;
    }

    dispatch(
      setStepData({
        step: 7,
        data: {
          hasSignature: true,
          signerName,
          signerRole,
        },
      })
    );
    onNext();
  }, [signature, signerName, signerRole, dispatch, onNext]);

  const handleValidationClose = useCallback(() => {
    setShowValidationAlert(false);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Client Signature</Text>
      <Text style={styles.subtitle}>
        Obtain the client's signature to confirm work completion.
      </Text>

      <AppInput
        label="Signer Name"
        placeholder="Enter client's full name"
        value={signerName}
        onChangeText={setSignerName}
        required
      />

      <AppInput
        label="Signer Role / Title"
        placeholder="e.g. Facility Manager, Authorized Representative"
        value={signerRole}
        onChangeText={setSignerRole}
      />

      <AppCard variant="outlined" padding="lg" style={styles.signatureCard}>
        <View style={styles.signatureHeader}>
          <PenTool size={18} color={Colors.blue} />
          <Text style={styles.signatureTitle}>Signature</Text>
        </View>

        {signature ? (
          <View style={styles.signaturePreview}>
            <View style={styles.signatureImageContainer}>
              <View style={styles.signatureImage}>
                <Image
                  source={{ uri: signature.base64 }}
                  style={styles.signatureImageContent}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.signatureInfo}>
                <Text style={styles.signatureText}>
                  ✓ Signed by {signature.signerName}
                </Text>
                <Text style={styles.signatureTime}>
                  {new Date(signature.timestamp).toLocaleString()}
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
                onPress={handleClear}
                variant="ghost"
                size="sm"
              />
            </View>
          </View>
        ) : (
          <View style={styles.signatureEmpty}>
            <View style={styles.signaturePad}>
              <PenTool size={32} color={Colors.gray500} />
              <Text style={styles.signaturePadText}>
                No signature captured
              </Text>
            </View>
            <AppButton
              title="Capture Signature"
              onPress={() => setShowSignatureModal(true)}
              variant="primary"
              icon={<PenTool size={16} color={Colors.white} />}
              fullWidth
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
        <AppButton title="Next" onPress={handleNext} style={styles.actionBtn} />
      </View>

      {/* Signature Modal */}
      <SignatureModal
        ref={signatureModalRef}
        visible={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSave={handleSignatureSave}
        title="Client Signature"
        subtitle="Please sign in the box below"
        penColor="#000000"
        backgroundColor="#ffffff"
        clearText="Clear"
        confirmText="Done Signature"
      />

      {/* Clear Signature Confirmation Modal */}
      <ConfirmationModal
        visible={showClearConfirmation}
        onClose={() => setShowClearConfirmation(false)}
        onConfirm={handleClearConfirm}
        title="Clear Signature"
        message="Are you sure you want to clear the signature? This action cannot be undone."
        confirmText="Clear"
        cancelText="Cancel"
        type="warning"
        showDetails={false}
      />

      {/* Validation Error Bottom Sheet */}
      <BottomSheetAlert
        visible={showValidationAlert}
        type="warning"
        title="Validation Error"
        message={validationMessage}
        primaryLabel="OK"
        onClose={handleValidationClose}
      />
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
  signatureCard: {
    marginBottom: Spacing.xl,
  },
  signatureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  signatureTitle: {
    ...Typography.bodyBold,
    color: Colors.navy,
  },
  signaturePreview: {
    gap: Spacing.md,
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
  },
  signatureEmpty: {
    gap: Spacing.md,
  },
  signaturePad: {
    height: 120,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  signaturePadText: {
    ...Typography.caption,
    color: Colors.gray500,
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

export default React.memo(StepClientSignature);
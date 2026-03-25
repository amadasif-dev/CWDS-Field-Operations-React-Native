import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { PenTool } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setStepData, setSignature, clearSignature } from '../../../store/slices/attendanceSlice';
import { AppButton, AppInput, AppCard } from '../../../components';
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

  const handleSign = useCallback(() => {
    // In production, this would open a signature canvas
    // For now, simulate capturing a signature
    dispatch(
      setSignature({
        base64: 'signature_placeholder_base64',
        timestamp: new Date().toISOString(),
        signerName: signerName || 'Client',
        signerRole: signerRole || 'Authorized Representative',
      }),
    );
  }, [dispatch, signerName, signerRole]);

  const handleClear = useCallback(() => {
    dispatch(clearSignature());
  }, [dispatch]);

  const handleNext = useCallback(() => {
    if (!signature) {
      Alert.alert('Validation', 'Client signature is required.');
      return;
    }
    if (!signerName.trim()) {
      Alert.alert('Validation', 'Signer name is required.');
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
      }),
    );
    onNext();
  }, [signature, signerName, signerRole, dispatch, onNext]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
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
        placeholder="e.g. Facility Manager"
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
            <View style={styles.signaturePlaceholder}>
              <Text style={styles.signatureText}>✓ Signature Captured</Text>
              <Text style={styles.signatureTime}>
                {new Date(signature.timestamp).toLocaleTimeString()}
              </Text>
            </View>
            <AppButton
              title="Clear"
              onPress={handleClear}
              variant="ghost"
              size="sm"
            />
          </View>
        ) : (
          <View style={styles.signatureEmpty}>
            <View style={styles.signaturePad}>
              <Text style={styles.signaturePadText}>
                Tap below to capture signature
              </Text>
            </View>
            <AppButton
              title="Capture Signature"
              onPress={handleSign}
              variant="outline"
              icon={<PenTool size={16} color={Colors.blue} />}
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
        <AppButton
          title="Next"
          onPress={handleNext}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  signaturePlaceholder: {
    flex: 1,
  },
  signatureText: {
    ...Typography.bodyBold,
    color: Colors.green,
  },
  signatureTime: {
    ...Typography.caption,
    color: Colors.gray500,
    marginTop: Spacing.xxs,
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

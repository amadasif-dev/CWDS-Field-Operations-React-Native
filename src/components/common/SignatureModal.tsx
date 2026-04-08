import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import { X } from 'lucide-react-native';
import AppButton from './AppButton';
import { BorderRadius, Colors, Spacing, Typography } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SignatureModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (signatureBase64: string) => void;
  title?: string;
  subtitle?: string;
  penColor?: string;
  backgroundColor?: string;
  clearText?: string;
  confirmText?: string;
}

export interface SignatureModalRef {
  clearSignature: () => void;
  confirmSignature: () => void;
}

const SignatureModal = forwardRef<SignatureModalRef, SignatureModalProps>(
  (
    {
      visible,
      onClose,
      onSave,
      title = 'Signature',
      subtitle = 'Please sign in the box below',
      penColor = '#000000',
      backgroundColor = '#ffffff',
      clearText = 'Clear',
      confirmText = 'Confirm Signature',
    },
    ref,
  ) => {
    const signatureRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      clearSignature: () => {
        if (signatureRef.current) {
          signatureRef.current.clearSignature();
        }
      },
      confirmSignature: () => {
        if (signatureRef.current) {
          signatureRef.current.readSignature();
        }
      },
    }));

    const handleSignature = (signatureBase64: string) => {
      onSave(signatureBase64);
      onClose();
    };

    const handleEmpty = () => {
      Alert.alert('Error', 'Please provide a signature');
    };

    const handleClear = () => {
      if (signatureRef.current) {
        signatureRef.current.clearSignature();
      }
    };

    const handleConfirm = () => {
      if (signatureRef.current) {
        signatureRef.current.readSignature();
      }
    };

    // Signature canvas styles
    const signatureStyle = `
      .m-signature-pad {
        box-shadow: none;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
      }
      .m-signature-pad--body {
        border: none;
      }
      .m-signature-pad--footer {
        display: none;
        margin: 0;
      }
      body, html {
        height: 100%;
        margin: 0;
        padding: 0;
      }
      canvas {
        border-radius: 8px;
        width: 100%;
        height: 100%;
      }
    `;

    return (
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={onClose}
        statusBarTranslucent={true}
      >
        <StatusBar barStyle="dark-content" backgroundColor="rgba(0,0,0,0.5)" />
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.gray500} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.canvasContainer}>
            <SignatureScreen
              ref={signatureRef}
              onOK={handleSignature}
              onEmpty={handleEmpty}
              descriptionText=""
              clearText=""
              confirmText=""
              webStyle={signatureStyle}
              backgroundColor={backgroundColor}
              penColor={penColor}
              autoClear={false}
              imageType="image/png"
            />
          </View>

          <View style={styles.actions}>
            <AppButton
              title={clearText}
              onPress={handleClear}
              variant="outline"
              style={styles.actionButton}
            />
            <AppButton
              title={confirmText}
              onPress={handleConfirm}
              style={styles.actionButton}
            />
          </View>
        </SafeAreaView>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  title: {
    ...Typography.h3,
    color: Colors.navy,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.gray500,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  canvasContainer: {
    flex: 1,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    minHeight: SCREEN_HEIGHT * 0.5,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  actionButton: {
    flex: 1,
  },
});

SignatureModal.displayName = 'SignatureModal';

export default SignatureModal;

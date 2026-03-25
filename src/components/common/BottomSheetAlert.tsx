import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import AppButton from './AppButton';

export type BottomSheetType = 'success' | 'error' | 'warning' | 'alert';

interface BottomSheetAlertProps {
  visible: boolean;
  type?: BottomSheetType;
  title: string;
  message?: string;
  primaryLabel?: string;
  onClose: () => void;
  onPrimaryPress?: () => void;
}

const TYPE_CONFIG: Record<
  BottomSheetType,
  { icon: React.ReactNode; bg: string; fallbackTitle: string }
> = {
  success: {
    icon: <CheckCircle size={28} color={Colors.white} />,
    bg: Colors.green,
    fallbackTitle: 'Success',
  },
  error: {
    icon: <XCircle size={28} color={Colors.white} />,
    bg: Colors.red,
    fallbackTitle: 'Error',
  },
  warning: {
    icon: <AlertTriangle size={28} color={Colors.white} />,
    bg: Colors.gold,
    fallbackTitle: 'Warning',
  },
  alert: {
    icon: <Info size={28} color={Colors.white} />,
    bg: Colors.blue,
    fallbackTitle: 'Alert',
  },
};

const BottomSheetAlert: React.FC<BottomSheetAlertProps> = ({
  visible,
  type = 'alert',
  title,
  message,
  primaryLabel,
  onClose,
  onPrimaryPress,
}) => {
  const config = TYPE_CONFIG[type];

  const handlePrimaryPress = () => {
    onPrimaryPress?.();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              <View style={styles.handle} />

              <View style={styles.iconWrapper}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: config.bg },
                  ]}>
                  {config.icon}
                </View>
              </View>

              <Text style={styles.title}>
                {title || config.fallbackTitle}
              </Text>
              {message ? (
                <Text style={styles.message}>{message}</Text>
              ) : null}

              <View style={styles.buttonRow}>
                <AppButton
                  title={primaryLabel || 'OK'}
                  onPress={handlePrimaryPress}
                  variant={type === 'error' ? 'danger' : 'primary'}
                  fullWidth
                  size="lg"
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gray300,
    marginBottom: Spacing.lg,
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.h2,
    color: Colors.navy,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    ...Typography.body,
    color: Colors.gray500,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  buttonRow: {
    marginTop: Spacing.md,
  },
});

export default React.memo(BottomSheetAlert);
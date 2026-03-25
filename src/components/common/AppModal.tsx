import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../theme';

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  dismissOnBackdrop?: boolean;
}

const AppModal: React.FC<AppModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  dismissOnBackdrop = true,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <Pressable
        style={styles.overlay}
        onPress={dismissOnBackdrop ? onClose : undefined}>
        <Pressable style={styles.content} onPress={() => {}}>
          {(title || showCloseButton) && (
            <View style={styles.header}>
              {title && <Text style={styles.title}>{title}</Text>}
              {showCloseButton && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color={Colors.gray700} />
                </TouchableOpacity>
              )}
            </View>
          )}
          <View style={styles.body}>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  content: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    ...Shadow.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.h3,
    color: Colors.navy,
    flex: 1,
  },
  closeButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  body: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
});

export default React.memo(AppModal);

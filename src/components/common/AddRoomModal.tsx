import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from './AppButton';
import { BorderRadius, Colors, Spacing, Typography } from '../../theme';

interface AddRoomModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (roomName: string, roomFloor: string) => void;
  title?: string;
  roomNameLabel?: string;
  floorLabel?: string;
  roomNamePlaceholder?: string;
  floorPlaceholder?: string;
  cancelText?: string;
  confirmText?: string;
}

const AddRoomModal: React.FC<AddRoomModalProps> = ({
  visible,
  onClose,
  onAdd,
  title = 'Add Additional Room',
  roomNameLabel = 'Room Name *',
  floorLabel = 'Floor',
  roomNamePlaceholder = 'e.g., Master Bedroom',
  floorPlaceholder = 'e.g., Ground Floor',
  cancelText = 'Cancel',
  confirmText = 'Add Room',
}) => {
  const [roomName, setRoomName] = useState('');
  const [floor, setFloor] = useState('');

  useEffect(() => {
    if (!visible) {
      setRoomName('');
      setFloor('');
    }
  }, [visible]);

  const handleAdd = () => {
    if (roomName.trim()) {
      onAdd(roomName.trim(), floor.trim());
      setRoomName('');
      setFloor('');
    }
  };

  const handleCancel = () => {
    setRoomName('');
    setFloor('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
      statusBarTranslucent={true}
      presentationStyle="fullScreen"
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.5)" />
      <SafeAreaView style={styles.overlay}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{title}</Text>

            <Text style={styles.modalLabel}>{roomNameLabel}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={roomNamePlaceholder}
              placeholderTextColor={Colors.gray300}
              value={roomName}
              onChangeText={setRoomName}
              autoFocus
            />

            <Text style={styles.modalLabel}>{floorLabel}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={floorPlaceholder}
              placeholderTextColor={Colors.gray300}
              value={floor}
              onChangeText={setFloor}
            />

            <View style={styles.modalActions}>
              <AppButton
                title={cancelText}
                onPress={handleCancel}
                variant="outline"
                style={styles.modalActionBtn}
              />
              <AppButton
                title={confirmText}
                onPress={handleAdd}
                disabled={!roomName.trim()}
                style={styles.modalActionBtn}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.navy,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  modalLabel: {
    ...Typography.captionBold,
    color: Colors.gray700,
    marginBottom: Spacing.xs,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Typography.body,
    color: Colors.navy,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  modalActionBtn: {
    flex: 1,
  },
});

export default AddRoomModal;

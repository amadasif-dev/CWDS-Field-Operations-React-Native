// NonRestorableModal.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { Camera, Trash2, ImagePlus } from 'lucide-react-native';
import { pickImageFromCamera, pickImageFromGallery } from '../../../../utils/imagePicker';
import { BorderRadius, Colors, Spacing, Typography } from '../../../../theme';
import { AppButton, AppInput } from '../../../../components';
import AppSelect from '../../../../components/common/AppSelect';

const NON_RESTORABLE_REASONS = [
  'Excessive moisture saturation',
  'Structural damage / delamination',
  'Mould growth present',
  'Asbestos-containing material',
  'Category 3 (black water) contamination',
  'Beyond economic repair',
  'Client elected not to restore',
  'Other (requires text entry)',
];

interface NonRestorableModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nonRestorableReason: string;
  setNonRestorableReason: (reason: string) => void;
  otherReason: string;
  setOtherReason: (reason: string) => void;
  evidencePhoto: string | null;
  setEvidencePhoto: (uri: string | null) => void;
}

const NonRestorableModal: React.FC<NonRestorableModalProps> = ({
  visible,
  onClose,
  onConfirm,
  nonRestorableReason,
  setNonRestorableReason,
  otherReason,
  setOtherReason,
  evidencePhoto,
  setEvidencePhoto,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Non-Restorable Surface</Text>
          <Text style={styles.modalSubtitle}>Reason for non-restorable</Text>

          <AppSelect
            options={NON_RESTORABLE_REASONS}
            value={nonRestorableReason}
            onValueChange={setNonRestorableReason}
            placeholder="Select reason"
          />

          {nonRestorableReason === 'Other (requires text entry)' && (
            <AppInput
              placeholder="Please specify..."
              value={otherReason}
              onChangeText={setOtherReason}
              multiline
              numberOfLines={2}
            />
          )}

          <Text style={styles.modalSubtitle}>Evidence Photo *</Text>
          {evidencePhoto ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: evidencePhoto }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removePhoto}
                onPress={() => setEvidencePhoto(null)}
              >
                <Trash2 size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoActions}>
              <AppButton
                title="Take Photo"
                onPress={async () => {
                  const photo = await pickImageFromCamera();
                  if (photo) setEvidencePhoto(photo.uri);
                }}
                variant="outline"
                icon={<Camera size={16} color={Colors.blue} />}
                style={styles.photoBtn}
              />
              <AppButton
                title="Gallery"
                onPress={async () => {
                  const photo = await pickImageFromGallery();
                  if (photo) setEvidencePhoto(photo.uri);
                }}
                variant="outline"
                icon={<ImagePlus size={16} color={Colors.blue} />}
                style={styles.photoBtn}
              />
            </View>
          )}

          <View style={styles.modalActions}>
            <AppButton
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.modalActionBtn}
            />
            <AppButton
              title="Confirm"
              onPress={onConfirm}
              disabled={!nonRestorableReason || !evidencePhoto}
              style={styles.modalActionBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    maxHeight: '80%',
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.navy,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...Typography.bodyBold,
    color: Colors.gray700,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  photoPreview: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  removePhoto: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 6,
  },
  photoActions: { flexDirection: 'row', gap: Spacing.md, marginVertical: Spacing.md },
  photoBtn: { flex: 1 },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  modalActionBtn: { flex: 1 },
});

export default NonRestorableModal;

// EquipmentPerRoom.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Camera, Trash2, Minus, Plus } from 'lucide-react-native';
import { pickImageFromCamera } from '../../../../utils/imagePicker';
import { BorderRadius, Colors, Spacing, Typography } from '../../../../theme';
import { AppButton, BottomSheetAlert } from '../../../../components';


interface EquipmentPerRoomProps {
  room: any;
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface EquipmentItem {
  id: string;
  name: string;
  quantity: number;
}

const EQUIPMENT_TYPES = [
  { id: 'dehumidifier', name: 'Dehumidifier' },
  { id: 'air_mover', name: 'Air Mover / Blower' },
  { id: 'air_scrubber', name: 'Air Scrubber' },
  { id: 'drymatic', name: 'Drymatic' },
  { id: 'heat_mat', name: 'Heat Mat' },
  { id: 'negative_air', name: 'Negative Air Machine' },
  { id: 'other', name: 'Other' },
];

const EquipmentPerRoom: React.FC<EquipmentPerRoomProps> = ({
  room,
  data,
  onUpdate,
  onNext,
  onPrev,
}) => {
  const [equipment, setEquipment] = useState<EquipmentItem[]>(
    data.equipment || EQUIPMENT_TYPES.map(type => ({ id: type.id, name: type.name, quantity: 0 }))
  );
  const [confirmationPhoto, setConfirmationPhoto] = useState<string | null>(
    data.confirmationPhoto || null
  );
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [otherName, setOtherName] = useState('');

  const updateQuantity = useCallback((id: string, delta: number) => {
    setEquipment(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  }, []);

  const handleCapturePhoto = useCallback(async () => {
    try {
      const photo = await pickImageFromCamera();
      if (photo) {
        setConfirmationPhoto(photo.uri);
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
    }
  }, []);

  const hasEquipment = equipment.some(item => item.quantity > 0 || (item.id === 'other' && otherName));

  const handleNext = useCallback(() => {
    if (!hasEquipment) {
      setShowValidationAlert(true);
      return;
    }
    if (!confirmationPhoto) {
      setShowValidationAlert(true);
      return;
    }

    const equipmentWithOther = equipment.map(item => {
      if (item.id === 'other' && otherName && item.quantity > 0) {
        return { ...item, name: otherName };
      }
      return item;
    }).filter(item => item.quantity > 0);

    onUpdate({ equipment: equipmentWithOther, confirmationPhoto });
    onNext();
  }, [hasEquipment, confirmationPhoto, equipment, otherName, onUpdate, onNext]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Equipment Placed</Text>
      <Text style={styles.subtitle}>Log all drying equipment placed in this room.</Text>

      <View style={styles.equipmentList}>
        {equipment.map(item => (
          <View key={item.id} style={styles.equipmentRow}>
            <Text style={styles.equipmentName}>
              {item.id === 'other' && otherName ? otherName : item.name}
            </Text>
            {item.id === 'other' && (
              <TouchableOpacity onPress={() => setOtherName('')}>
                <Text style={styles.editOther}>Edit</Text>
              </TouchableOpacity>
            )}
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, -1)}
              >
                <Minus size={16} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, 1)}
              >
                <Plus size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.photoSection}>
        <Text style={styles.label}>Equipment Confirmation Photo *</Text>
        {confirmationPhoto ? (
          <View style={styles.photoPreview}>
            <Image source={{ uri: confirmationPhoto }} style={styles.photo} />
            <TouchableOpacity
              style={styles.removePhoto}
              onPress={() => setConfirmationPhoto(null)}
            >
              <Trash2 size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <AppButton
            title="Capture Photo"
            onPress={handleCapturePhoto}
            variant="outline"
            icon={<Camera size={16} color={Colors.blue} />}
          />
        )}
      </View>

      <View style={styles.actions}>
        <AppButton title="Previous" onPress={onPrev} variant="outline" style={styles.actionBtn} />
        <AppButton title="Next" onPress={handleNext} style={styles.actionBtn} />
      </View>

      <BottomSheetAlert
        visible={showValidationAlert}
        type="warning"
        title="Validation Error"
        message={
          !hasEquipment && !confirmationPhoto
            ? "Please add at least one equipment item and capture a confirmation photo."
            : !hasEquipment
              ? "Please add at least one equipment item."
              : "Please capture an equipment confirmation photo."
        }
        primaryLabel="OK"
        onClose={() => setShowValidationAlert(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { ...Typography.h2, color: Colors.navy, marginBottom: Spacing.xs },
  subtitle: { ...Typography.body, color: Colors.gray500, marginBottom: Spacing.xl },
  equipmentList: { marginBottom: Spacing.xl, gap: Spacing.md },
  equipmentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  equipmentName: { ...Typography.body, color: Colors.gray700 },
  editOther: { ...Typography.caption, color: Colors.blue },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  quantityButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.blue, alignItems: 'center', justifyContent: 'center' },
  quantity: { ...Typography.bodyBold, color: Colors.gray700, minWidth: 30, textAlign: 'center' },
  photoSection: { marginBottom: Spacing.xl },
  label: { ...Typography.captionBold, color: Colors.gray700, marginBottom: Spacing.sm },
  photoPreview: { position: 'relative', width: '100%', height: 500, borderRadius: BorderRadius.md, overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  removePhoto: { position: 'absolute', top: Spacing.sm, right: Spacing.sm, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 6 },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
  actionBtn: { flex: 1 },
});

export default EquipmentPerRoom;
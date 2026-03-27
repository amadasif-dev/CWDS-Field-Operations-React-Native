// SurfaceInspection.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Camera, Trash2, Droplet, ImagePlus } from 'lucide-react-native';
import { pickImageFromCamera, pickImageFromGallery } from '../../../../utils/imagePicker';
import { BorderRadius, Colors, Spacing, Typography } from '../../../../theme';
import { AppButton, AppInput, BottomSheetAlert } from '../../../../components';
import AppSelect from '../../../../components/common/AppSelect';
import NonRestorableModal from './NonRestorableModal';

interface SurfaceInspectionProps {
  room: any;
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
  nonRestorableSurfaces: string[];
  setNonRestorableSurfaces: (surfaces: string[]) => void;
}

type SurfaceType = 'ceiling' | 'walls' | 'flooring';
type SurfaceData = {
  material?: string;
  affected?: boolean;
  moisturePhoto?: string;
  peakMoisture?: string;
  dryStandard?: string;
  restorable?: boolean;
  nonRestorableReason?: string;
};

const SURFACE_NAMES: Record<SurfaceType, string> = {
  ceiling: 'Ceiling',
  walls: 'Walls',
  flooring: 'Flooring',
};

const MATERIAL_OPTIONS: Record<SurfaceType, string[]> = {
  ceiling: ['Plasterboard', 'Concrete', 'Timber', 'Fibrous Cement', 'Other'],
  walls: [
    'Plasterboard',
    'Brick',
    'Concrete',
    'Timber',
    'Fibrous Cement',
    'Tiles',
    'Other',
  ],
  flooring: ['Carpet', 'Timber', 'Tiles', 'Vinyl', 'Concrete', 'Other'],
};


const SurfaceInspection: React.FC<SurfaceInspectionProps> = ({
  room,
  data,
  onUpdate,
  onNext,
  onPrev,
  nonRestorableSurfaces,
  setNonRestorableSurfaces,
}) => {
  const [currentSurface, setCurrentSurface] = useState<SurfaceType>('ceiling');
  const [surfaceData, setSurfaceData] = useState<
    Record<SurfaceType, SurfaceData>
  >(
    data.surfaces || {
      ceiling: { affected: false },
      walls: { affected: false },
      flooring: { affected: false },
    },
  );
  const [showNonRestorableModal, setShowNonRestorableModal] = useState(false);
  const [nonRestorableReason, setNonRestorableReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [evidencePhoto, setEvidencePhoto] = useState<string | null>(null);
  const [showValidationAlert, setShowValidationAlert] = useState(false);

  const surfaces: SurfaceType[] = ['ceiling', 'walls', 'flooring'];
  const currentIndex = surfaces.indexOf(currentSurface);
  const isLastSurface = currentIndex === surfaces.length - 1;

  const updateCurrentSurface = useCallback(
    (updates: Partial<SurfaceData>) => {
      setSurfaceData(prev => ({
        ...prev,
        [currentSurface]: { ...prev[currentSurface], ...updates },
      }));
    },
    [currentSurface],
  );

  const handleAffectedToggle = useCallback(
    (affected: boolean) => {
      updateCurrentSurface({ affected });
      if (!affected) {
        // Save and move to next surface
        onUpdate({ surfaces: surfaceData });
        if (isLastSurface) {
          onNext();
        } else {
          setCurrentSurface(surfaces[currentIndex + 1]);
        }
      }
    },
    [
      updateCurrentSurface,
      surfaceData,
      onUpdate,
      isLastSurface,
      currentIndex,
      onNext,
    ],
  );

  const handleRestorableToggle = useCallback(
    (restorable: boolean) => {
      updateCurrentSurface({ restorable });
      if (!restorable) {
        setShowNonRestorableModal(true);
      }
    },
    [updateCurrentSurface],
  );

  const handleNonRestorableConfirm = useCallback(() => {
    if (!evidencePhoto) return;

    const reason =
      nonRestorableReason === 'Other (requires text entry)'
        ? otherReason
        : nonRestorableReason;

    updateCurrentSurface({
      restorable: false,
      nonRestorableReason: reason,
      moisturePhoto: evidencePhoto,
    });

    setNonRestorableSurfaces([...nonRestorableSurfaces, currentSurface]);
    setShowNonRestorableModal(false);
    setNonRestorableReason('');
    setOtherReason('');
    setEvidencePhoto(null);
    onUpdate({ surfaces: surfaceData });
    if (isLastSurface) {
      onNext();
    } else {
      setCurrentSurface(surfaces[currentIndex + 1]);
    }
  }, [
    evidencePhoto,
    nonRestorableReason,
    otherReason,
    currentSurface,
    surfaceData,
    onUpdate,
    isLastSurface,
    currentIndex,
    onNext,
    nonRestorableSurfaces,
    setNonRestorableSurfaces,
  ]);

  const handleCaptureMoisturePhoto = useCallback(async () => {
    try {
      const photo = await pickImageFromCamera();
      if (photo) {
        updateCurrentSurface({ moisturePhoto: photo.uri });
      }
    } catch (error) {
      console.log('Failed to capture moisture photo:', error);
    }
  }, [updateCurrentSurface]);

  const handlePickMoisturePhotoFromGallery = useCallback(async () => {
    try {
      const photo = await pickImageFromGallery();
      if (photo) {
        updateCurrentSurface({ moisturePhoto: photo.uri });
      }
    } catch (error) {
      console.log('Failed to pick moisture photo from gallery:', error);
    }
  }, [updateCurrentSurface]);

  const handleNextSurface = useCallback(() => {
    const currentData = surfaceData[currentSurface] || {};

    if (currentData.affected) {
      if (!currentData.moisturePhoto) {
        setShowValidationAlert(true);
        return;
      }
      if (!currentData.peakMoisture || !currentData.dryStandard) {
        setShowValidationAlert(true);
        return;
      }
      if (currentData.restorable === undefined) {
        setShowValidationAlert(true);
        return;
      }
    }

    onUpdate({ surfaces: surfaceData });

    if (isLastSurface) {
      onNext();
    } else {
      setCurrentSurface(surfaces[currentIndex + 1]);
    }
  }, [
    surfaceData,
    currentSurface,
    onUpdate,
    isLastSurface,
    currentIndex,
    onNext,
  ]);

  const currentData = surfaceData[currentSurface] || {};

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        {surfaces.map((surface, idx) => {
          const isCompleted = surfaceData[surface]?.affected !== undefined;
          const isActive = currentSurface === surface;
          return (
            <TouchableOpacity
              key={surface}
              onPress={() => setCurrentSurface(surface)}
              style={[
                styles.progressItem,
                isActive && styles.progressItemActive,
                isCompleted && styles.progressItemComplete,
              ]}
            >
              <View style={[styles.progressDot, isActive && styles.progressDotActive, isCompleted && styles.progressDotComplete]}>
                {isCompleted && <Text style={[styles.checkmark, isActive && styles.checkmarkActive]}>✓</Text>}
              </View>
              <Text
                style={[
                  styles.progressText,
                  isActive && styles.progressTextActive,
                  isCompleted && styles.progressTextComplete,
                ]}
              >
                {SURFACE_NAMES[surface]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          {SURFACE_NAMES[currentSurface]} Inspection
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Material Type *</Text>
          <AppSelect
            options={MATERIAL_OPTIONS[currentSurface]}
            value={currentData.material || ''}
            onValueChange={value => updateCurrentSurface({ material: value })}
            placeholder="Select material type"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Affected?</Text>
          <View style={styles.toggleGroup}>
            <TouchableOpacity
              style={[
                styles.toggle,
                currentData.affected === true && styles.toggleActive,
              ]}
              onPress={() => handleAffectedToggle(true)}
            >
              <Text
                style={[
                  styles.toggleText,
                  currentData.affected === true && styles.toggleTextActive,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggle,
                currentData.affected === false && styles.toggleActive,
              ]}
              onPress={() => handleAffectedToggle(false)}
            >
              <Text
                style={[
                  styles.toggleText,
                  currentData.affected === false && styles.toggleTextActive,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {currentData.affected && (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>Moisture Evidence Photo *</Text>
              {currentData.moisturePhoto ? (
                <View style={styles.photoPreview}>
                  <Image
                    source={{ uri: currentData.moisturePhoto }}
                    style={styles.photo}
                  />
                  <TouchableOpacity
                    style={styles.removePhoto}
                    onPress={() =>
                      updateCurrentSurface({ moisturePhoto: undefined })
                    }
                  >
                    <Trash2 size={16} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.photoActions}>
                  <AppButton
                    title="Take Photo"
                    onPress={handleCaptureMoisturePhoto}
                    variant="outline"
                    icon={<Camera size={16} color={Colors.blue} />}
                    style={styles.photoBtn}
                  />
                  <AppButton
                    title="Gallery"
                    onPress={handlePickMoisturePhotoFromGallery}
                    variant="outline"
                    icon={<ImagePlus size={16} color={Colors.blue} />}
                    style={styles.photoBtn}
                  />
                </View>
              )}
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <AppInput
                  label="Peak Moisture % Reading *"
                  placeholder="0.0"
                  value={currentData.peakMoisture || ''}
                  onChangeText={v => updateCurrentSurface({ peakMoisture: v })}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.halfInput}>
                <AppInput
                  label="Dry Standard % Reading *"
                  placeholder="0.0"
                  value={currentData.dryStandard || ''}
                  onChangeText={v => updateCurrentSurface({ dryStandard: v })}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Restorable?</Text>
              <View style={styles.toggleGroup}>
                <TouchableOpacity
                  style={[
                    styles.toggle,
                    currentData.restorable === true && styles.toggleActive,
                  ]}
                  onPress={() => handleRestorableToggle(true)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      currentData.restorable === true &&
                        styles.toggleTextActive,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggle,
                    currentData.restorable === false && styles.toggleActive,
                  ]}
                  onPress={() => handleRestorableToggle(false)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      currentData.restorable === false &&
                        styles.toggleTextActive,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <View style={styles.actions}>
          <AppButton
            title="Previous"
            onPress={onPrev}
            variant="outline"
            style={styles.actionBtn}
          />
          <AppButton
            title={isLastSurface ? 'Complete' : 'Next Surface'}
            onPress={handleNextSurface}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>

      <NonRestorableModal
        visible={showNonRestorableModal}
        onClose={() => setShowNonRestorableModal(false)}
        onConfirm={handleNonRestorableConfirm}
        nonRestorableReason={nonRestorableReason}
        setNonRestorableReason={setNonRestorableReason}
        otherReason={otherReason}
        setOtherReason={setOtherReason}
        evidencePhoto={evidencePhoto}
        setEvidencePhoto={setEvidencePhoto}
      />

      <BottomSheetAlert
        visible={showValidationAlert}
        type="warning"
        title="Validation Error"
        message="Please complete all required fields for this surface."
        primaryLabel="OK"
        onClose={() => setShowValidationAlert(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    backgroundColor: Colors.gray100,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  progressItem: { flexDirection: 'column', alignItems: 'center', gap: Spacing.xs, flex: 1, padding: Spacing.sm },
  progressItemActive: {
    backgroundColor: Colors.blue,
    borderRadius: BorderRadius.md,
  },
  progressItemComplete: { opacity: 1 },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotActive: {
    backgroundColor: Colors.white,
  },
  progressDotComplete: {
    backgroundColor: Colors.green,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkmarkActive: {
    color: Colors.blue,
  },
  progressText: { ...Typography.caption, color: Colors.gray700, textAlign: 'center' },
  progressTextActive: { ...Typography.captionBold, color: Colors.white },
  progressTextComplete: { ...Typography.captionBold, color: Colors.green },
  title: { ...Typography.h2, color: Colors.navy, marginBottom: Spacing.xl },
  section: { marginBottom: Spacing.xl },
  label: {
    ...Typography.captionBold,
    color: Colors.gray700,
    marginBottom: Spacing.sm,
  },
  toggleGroup: { flexDirection: 'row', gap: Spacing.md },
  toggle: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  toggleActive: { backgroundColor: Colors.blue, borderColor: Colors.blue },
  toggleText: { ...Typography.body, color: Colors.gray700 },
  toggleTextActive: { color: Colors.white },
  row: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  halfInput: { flex: 1 },
  photoActions: { flexDirection: 'row', gap: Spacing.md },
  photoBtn: { flex: 1 },
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  actionBtn: { flex: 1 },
});

export default SurfaceInspection;

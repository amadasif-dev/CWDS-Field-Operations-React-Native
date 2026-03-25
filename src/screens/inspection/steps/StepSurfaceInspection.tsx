import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Camera, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react-native';
import { useAppDispatch } from '../../../store';
import { setSurfaces } from '../../../store/slices/inspectionSlice';
import { AppButton, AppInput, AppCard, AppCheckbox } from '../../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';
import { generateId } from '../../../utils';
import type {
  RoomInspection,
  SurfaceInspection as SurfaceInspectionType,
  SurfaceType,
  MaterialType,
  InspectionPhoto,
} from '../../../types/inspection';
import {
  SURFACE_TYPES,
  MATERIAL_OPTIONS,
} from '../../../types/inspection';

interface Props {
  path: { floorId: string; unitId: string; roomId: string };
  room: RoomInspection;
  onNext: () => void;
  onPrev: () => void;
}

const createEmptySurface = (surfaceType: SurfaceType): SurfaceInspectionType => ({
  id: generateId(),
  surfaceType,
  materialType: 'drywall',
  isAffected: false,
});

const StepSurfaceInspection: React.FC<Props> = ({
  path,
  room,
  onNext,
  onPrev,
}) => {
  const dispatch = useAppDispatch();

  // Initialize surfaces from room or create fresh
  const [surfaces, setLocalSurfaces] = useState<SurfaceInspectionType[]>(() => {
    if (room.surfaces.length > 0) return room.surfaces;
    return SURFACE_TYPES.map((st) => createEmptySurface(st.key));
  });

  const [expandedSurface, setExpandedSurface] = useState<string | null>(
    surfaces[0]?.id ?? null,
  );

  const updateSurface = useCallback(
    (surfaceId: string, updates: Partial<SurfaceInspectionType>) => {
      setLocalSurfaces((prev) =>
        prev.map((s) => (s.id === surfaceId ? { ...s, ...updates } : s)),
      );
    },
    [],
  );

  const addMoisturePhoto = useCallback(
    (surfaceId: string) => {
      const surface = surfaces.find((s) => s.id === surfaceId);
      if (!surface) return;

      const photo: InspectionPhoto = {
        id: generateId(),
        uri: `moisture_${surface.surfaceType}_${Date.now()}.jpg`,
        timestamp: new Date().toISOString(),
        tags: {
          roomName: room.name,
          material: surface.materialType,
          readingType: 'moisture',
        },
        type: 'moisture_evidence',
      };

      setLocalSurfaces((prev) =>
        prev.map((s) => {
          if (s.id !== surfaceId) return s;
          const reading = s.reading ?? {
            id: generateId(),
            peakMoisturePercent: 0,
            dryStandardPercent: 0,
            isRestorable: true,
            photos: [],
          };
          return {
            ...s,
            reading: { ...reading, photos: [...reading.photos, photo] },
          };
        }),
      );
    },
    [surfaces, room.name],
  );

  const updateReading = useCallback(
    (surfaceId: string, field: string, value: string | boolean) => {
      setLocalSurfaces((prev) =>
        prev.map((s) => {
          if (s.id !== surfaceId || !s.reading) return s;
          return {
            ...s,
            reading: { ...s.reading, [field]: value },
          };
        }),
      );
    },
    [],
  );

  const handleNext = useCallback(() => {
    // Validate: affected surfaces need photos + readings
    for (const surface of surfaces) {
      if (surface.isAffected) {
        if (!surface.reading || surface.reading.photos.length === 0) {
          Alert.alert(
            'Photo Required',
            `Capture a moisture evidence photo for ${surface.surfaceType}.`,
          );
          return;
        }
        if (
          surface.reading.peakMoisturePercent <= 0 ||
          surface.reading.dryStandardPercent <= 0
        ) {
          Alert.alert(
            'Readings Required',
            `Enter moisture readings for ${surface.surfaceType}.`,
          );
          return;
        }
      }
    }

    dispatch(setSurfaces({ path, surfaces }));
    onNext();
  }, [surfaces, dispatch, path, onNext]);

  const getLabel = (key: SurfaceType) =>
    SURFACE_TYPES.find((s) => s.key === key)?.label ?? key;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.stepNum}>Step 2</Text>
      <Text style={styles.title}>Surface Inspection</Text>
      <Text style={styles.subtitle}>
        For each surface: select material → mark affected → capture photo → enter readings.
      </Text>

      {surfaces.map((surface) => {
        const isExpanded = expandedSurface === surface.id;
        const isComplete =
          !surface.isAffected ||
          (surface.reading &&
            surface.reading.photos.length > 0 &&
            surface.reading.peakMoisturePercent > 0);

        return (
          <AppCard
            key={surface.id}
            variant="outlined"
            padding="lg"
            style={styles.surfaceCard}>
            {/* Header */}
            <TouchableOpacity
              style={styles.surfaceHeader}
              onPress={() =>
                setExpandedSurface(isExpanded ? null : surface.id)
              }
              activeOpacity={0.7}>
              <View style={styles.surfaceHeaderLeft}>
                {isComplete ? (
                  <CheckCircle size={18} color={Colors.green} />
                ) : (
                  <View style={styles.surfaceDot} />
                )}
                <Text style={styles.surfaceTitle}>
                  {getLabel(surface.surfaceType)}
                </Text>
                {surface.isAffected && (
                  <View style={styles.affectedBadge}>
                    <Text style={styles.affectedBadgeText}>Affected</Text>
                  </View>
                )}
              </View>
              {isExpanded ? (
                <ChevronUp size={18} color={Colors.gray500} />
              ) : (
                <ChevronDown size={18} color={Colors.gray500} />
              )}
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.surfaceBody}>
                {/* Material Selector */}
                <Text style={styles.fieldLabel}>Material Type</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.materialScroll}>
                  {MATERIAL_OPTIONS.map((mat) => (
                    <TouchableOpacity
                      key={mat.key}
                      style={[
                        styles.materialChip,
                        surface.materialType === mat.key &&
                          styles.materialChipActive,
                      ]}
                      onPress={() =>
                        updateSurface(surface.id, { materialType: mat.key })
                      }
                      activeOpacity={0.7}>
                      <Text
                        style={[
                          styles.materialChipText,
                          surface.materialType === mat.key &&
                            styles.materialChipTextActive,
                        ]}>
                        {mat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Affected toggle */}
                <AppCheckbox
                  label="Affected?"
                  checked={surface.isAffected}
                  onChange={(v) =>
                    updateSurface(surface.id, {
                      isAffected: v,
                      reading: v
                        ? surface.reading ?? {
                            id: generateId(),
                            peakMoisturePercent: 0,
                            dryStandardPercent: 0,
                            isRestorable: true,
                            photos: [],
                          }
                        : undefined,
                    })
                  }
                />

                {/* If affected — photo + readings */}
                {surface.isAffected && (
                  <View style={styles.readingsBlock}>
                    {/* Photo capture */}
                    <AppButton
                      title="Capture moisture evidence photo"
                      onPress={() => addMoisturePhoto(surface.id)}
                      variant="outline"
                      icon={<Camera size={16} color={Colors.blue} />}
                      fullWidth
                      style={styles.captureBtn}
                    />
                    <Text style={styles.photoTag}>
                      Auto-tagged: {room.name} + {MATERIAL_OPTIONS.find((m) => m.key === surface.materialType)?.label} + Reading type
                    </Text>

                    {surface.reading && (
                      <>
                        <Text style={styles.photoCountText}>
                          {surface.reading.photos.length} photo(s) captured
                        </Text>

                        <View style={styles.readingRow}>
                          <AppInput
                            label="Peak moisture %"
                            value={
                              surface.reading.peakMoisturePercent > 0
                                ? surface.reading.peakMoisturePercent.toString()
                                : ''
                            }
                            onChangeText={(v) =>
                              updateReading(
                                surface.id,
                                'peakMoisturePercent',
                                v,
                              )
                            }
                            keyboardType="decimal-pad"
                            containerStyle={styles.readingInput}
                          />
                          <AppInput
                            label="Dry standard %"
                            value={
                              surface.reading.dryStandardPercent > 0
                                ? surface.reading.dryStandardPercent.toString()
                                : ''
                            }
                            onChangeText={(v) =>
                              updateReading(
                                surface.id,
                                'dryStandardPercent',
                                v,
                              )
                            }
                            keyboardType="decimal-pad"
                            containerStyle={styles.readingInput}
                          />
                        </View>

                        <AppCheckbox
                          label="Restorable?"
                          checked={surface.reading.isRestorable}
                          onChange={(v) =>
                            updateReading(surface.id, 'isRestorable', v)
                          }
                        />

                        {!surface.reading.isRestorable && (
                          <AppInput
                            label="Reason (if not restorable)"
                            placeholder="Describe why this is non-restorable"
                            value={surface.reading.nonRestorableReason ?? ''}
                            onChangeText={(v) =>
                              updateReading(
                                surface.id,
                                'nonRestorableReason',
                                v,
                              )
                            }
                            multiline
                            numberOfLines={2}
                          />
                        )}
                      </>
                    )}
                  </View>
                )}
              </View>
            )}
          </AppCard>
        );
      })}

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
  container: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: Spacing.huge },
  stepNum: {
    ...Typography.captionBold,
    color: Colors.blue,
    marginBottom: Spacing.xxs,
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
  surfaceCard: {
    marginBottom: Spacing.md,
  },
  surfaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  surfaceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  surfaceDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.gray300,
  },
  surfaceTitle: {
    ...Typography.bodyBold,
    color: Colors.navy,
  },
  affectedBadge: {
    backgroundColor: Colors.redLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.full,
  },
  affectedBadgeText: {
    ...Typography.small,
    color: Colors.red,
    fontWeight: '600',
  },
  surfaceBody: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  fieldLabel: {
    ...Typography.captionBold,
    color: Colors.gray700,
  },
  materialScroll: {
    marginBottom: Spacing.sm,
  },
  materialChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray300,
    marginRight: Spacing.sm,
  },
  materialChipActive: {
    backgroundColor: Colors.blue,
    borderColor: Colors.blue,
  },
  materialChipText: {
    ...Typography.caption,
    color: Colors.gray700,
  },
  materialChipTextActive: {
    color: Colors.white,
  },
  readingsBlock: {
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    marginTop: Spacing.sm,
  },
  captureBtn: {
    borderStyle: 'dashed',
    minHeight: 64,
  },
  photoTag: {
    ...Typography.caption,
    color: Colors.gray500,
    textAlign: 'center',
  },
  photoCountText: {
    ...Typography.captionBold,
    color: Colors.green,
  },
  readingRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  readingInput: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  actionBtn: { flex: 1 },
});

export default React.memo(StepSurfaceInspection);

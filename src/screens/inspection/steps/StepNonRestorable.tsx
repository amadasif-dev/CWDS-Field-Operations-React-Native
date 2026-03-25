import React, { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { Camera, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { useAppDispatch } from '../../../store';
import { updateSurface } from '../../../store/slices/inspectionSlice';
import { AppButton, AppCard, AppCheckbox } from '../../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';
import { generateId } from '../../../utils';
import type {
  RoomInspection,
  InspectionPhoto,
  NonRestorableReason,
} from '../../../types/inspection';
import { NON_RESTORABLE_REASONS, SURFACE_TYPES } from '../../../types/inspection';

interface Props {
  path: { floorId: string; unitId: string; roomId: string };
  room: RoomInspection;
  onNext: () => void;
  onPrev: () => void;
}

const StepNonRestorable: React.FC<Props> = ({ path, room, onNext, onPrev }) => {
  const dispatch = useAppDispatch();

  const nonRestorableSurfaces = useMemo(
    () => room.surfaces.filter((s) => s.reading && !s.reading.isRestorable),
    [room.surfaces],
  );

  const hasNonRestorable = nonRestorableSurfaces.length > 0;

  const handleCapturePhoto = useCallback(
    (surfaceId: string) => {
      const surface = room.surfaces.find((s) => s.id === surfaceId);
      if (!surface) return;

      const photo: InspectionPhoto = {
        id: generateId(),
        uri: `non_restorable_${surface.surfaceType}_${Date.now()}.jpg`,
        timestamp: new Date().toISOString(),
        tags: {
          roomName: room.name,
          surface: surface.surfaceType,
          nonRestorable: 'true',
        },
        type: 'non_restorable_evidence',
      };

      const existing = surface.nonRestorableEvidence;
      dispatch(
        updateSurface({
          path,
          surfaceId,
          data: {
            nonRestorableEvidence: {
              reason: existing?.reason ?? 'other',
              notes: existing?.notes,
              photos: [...(existing?.photos ?? []), photo],
              confirmed: existing?.confirmed ?? false,
            },
          },
        }),
      );
    },
    [dispatch, path, room.surfaces, room.name],
  );

  const handleSetReason = useCallback(
    (surfaceId: string, reason: NonRestorableReason) => {
      const surface = room.surfaces.find((s) => s.id === surfaceId);
      if (!surface) return;

      const existing = surface.nonRestorableEvidence;
      dispatch(
        updateSurface({
          path,
          surfaceId,
          data: {
            nonRestorableEvidence: {
              reason,
              notes: existing?.notes,
              photos: existing?.photos ?? [],
              confirmed: existing?.confirmed ?? false,
            },
          },
        }),
      );
    },
    [dispatch, path, room.surfaces],
  );

  const handleConfirm = useCallback(
    (surfaceId: string, confirmed: boolean) => {
      const surface = room.surfaces.find((s) => s.id === surfaceId);
      if (!surface || !surface.nonRestorableEvidence) return;

      dispatch(
        updateSurface({
          path,
          surfaceId,
          data: {
            nonRestorableEvidence: {
              ...surface.nonRestorableEvidence,
              confirmed,
            },
          },
        }),
      );
    },
    [dispatch, path, room.surfaces],
  );

  const handleNext = useCallback(() => {
    // Validate: all non-restorable surfaces need photo + reason + confirmation
    for (const surface of nonRestorableSurfaces) {
      if (
        !surface.nonRestorableEvidence ||
        surface.nonRestorableEvidence.photos.length === 0
      ) {
        const label =
          SURFACE_TYPES.find((st) => st.key === surface.surfaceType)?.label ??
          surface.surfaceType;
        Alert.alert(
          'Photo Required',
          `Capture a non-restorable evidence photo for ${label}.`,
        );
        return;
      }
      if (!surface.nonRestorableEvidence.confirmed) {
        const label =
          SURFACE_TYPES.find((st) => st.key === surface.surfaceType)?.label ??
          surface.surfaceType;
        Alert.alert(
          'Confirmation Required',
          `Confirm the non-restorable evidence for ${label}.`,
        );
        return;
      }
    }
    onNext();
  }, [nonRestorableSurfaces, onNext]);

  const getLabel = (key: string) =>
    SURFACE_TYPES.find((s) => s.key === key)?.label ?? key;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.stepNum}>Step 3</Text>
      <Text style={styles.title}>Non-Restorable Evidence</Text>
      <Text style={styles.subtitle}>
        {hasNonRestorable
          ? 'Capture evidence photos and confirm reason for each non-restorable surface.'
          : 'No non-restorable surfaces were identified. You may proceed.'}
      </Text>

      {!hasNonRestorable && (
        <AppCard variant="outlined" padding="xl" style={styles.noneCard}>
          <CheckCircle size={32} color={Colors.green} />
          <Text style={styles.noneText}>
            All affected surfaces are restorable.
          </Text>
        </AppCard>
      )}

      {nonRestorableSurfaces.map((surface) => {
        const evidence = surface.nonRestorableEvidence;
        return (
          <AppCard
            key={surface.id}
            variant="outlined"
            padding="lg"
            style={styles.surfaceCard}>
            <View style={styles.surfaceHeader}>
              <AlertTriangle size={18} color={Colors.red} />
              <Text style={styles.surfaceTitle}>
                {getLabel(surface.surfaceType)}
              </Text>
            </View>

            {/* Photo Capture */}
            <AppButton
              title="Capture non-restorable evidence photo"
              onPress={() => handleCapturePhoto(surface.id)}
              variant="outline"
              icon={<Camera size={16} color={Colors.blue} />}
              fullWidth
              style={styles.captureBtn}
            />
            <Text style={styles.tagHint}>
              Auto-tagged: {room.name} + {getLabel(surface.surfaceType)} +
              Non-restorable flag
            </Text>

            {evidence && evidence.photos.length > 0 && (
              <Text style={styles.photoCount}>
                {evidence.photos.length} photo(s) captured
              </Text>
            )}

            {/* Reason Dropdown (simplified as chip selector) */}
            <Text style={styles.fieldLabel}>Reason</Text>
            <View style={styles.reasonGrid}>
              {NON_RESTORABLE_REASONS.map((r) => (
                <AppCard
                  key={r.key}
                  onPress={() => handleSetReason(surface.id, r.key)}
                  variant={
                    evidence?.reason === r.key ? 'elevated' : 'outlined'
                  }
                  padding="sm"
                  style={
                    evidence?.reason === r.key
                      ? styles.reasonChipActive
                      : styles.reasonChip
                  }>
                  <Text
                    style={
                      evidence?.reason === r.key
                        ? styles.reasonTextActive
                        : styles.reasonText
                    }>
                    {r.label}
                  </Text>
                </AppCard>
              ))}
            </View>

            {/* Photo confirmation */}
            <AppCheckbox
              label="I confirm this evidence is accurate"
              checked={evidence?.confirmed ?? false}
              onChange={(v) => handleConfirm(surface.id, v)}
            />
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
        <AppButton title="Next" onPress={handleNext} style={styles.actionBtn} />
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
  noneCard: {
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  noneText: {
    ...Typography.body,
    color: Colors.green,
    textAlign: 'center',
  },
  surfaceCard: {
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  surfaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  surfaceTitle: {
    ...Typography.bodyBold,
    color: Colors.red,
  },
  captureBtn: {
    borderStyle: 'dashed',
    minHeight: 64,
  },
  tagHint: {
    ...Typography.caption,
    color: Colors.gray500,
    textAlign: 'center',
  },
  photoCount: {
    ...Typography.captionBold,
    color: Colors.green,
  },
  fieldLabel: {
    ...Typography.captionBold,
    color: Colors.gray700,
  },
  reasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  reasonChip: {},
  reasonChipActive: {
    borderColor: Colors.blue,
    borderWidth: 2,
  },
  reasonText: {
    ...Typography.caption,
    color: Colors.gray700,
  },
  reasonTextActive: {
    ...Typography.captionBold,
    color: Colors.blue,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  actionBtn: { flex: 1 },
});

export default React.memo(StepNonRestorable);

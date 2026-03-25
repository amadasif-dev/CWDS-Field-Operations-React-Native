import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { Droplets, Circle } from 'lucide-react-native';
import { useAppDispatch } from '../../../store';
import { setMoistureMap } from '../../../store/slices/inspectionSlice';
import { AppButton, AppCard } from '../../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';
import { generateId } from '../../../utils';
import type {
  RoomInspection,
  MapAnnotation,
  AnnotationColor,
} from '../../../types/inspection';

interface Props {
  path: { floorId: string; unitId: string; roomId: string };
  room: RoomInspection;
  onNext: () => void;
  onPrev: () => void;
}

const StepMoistureMap: React.FC<Props> = ({ path, room, onNext, onPrev }) => {
  const dispatch = useAppDispatch();

  const [annotations, setAnnotations] = useState<MapAnnotation[]>(
    room.moistureMapAnnotations,
  );
  const [activeColor, setActiveColor] = useState<AnnotationColor>('blue');
  const [basePhotoId, setBasePhotoId] = useState<string | null>(
    room.moistureMapBasePhotoId,
  );

  // Select base photo from room overview photos
  const handleSelectBasePhoto = useCallback(() => {
    if (room.overviewPhotos.length === 0) {
      Alert.alert('No Photos', 'No room overview photos available.');
      return;
    }
    // Use the first overview photo as the base
    setBasePhotoId(room.overviewPhotos[0].id);
  }, [room.overviewPhotos]);

  // Simulate adding an annotation (in production: freehand drawing canvas)
  const handleAddAnnotation = useCallback(() => {
    const annotation: MapAnnotation = {
      id: generateId(),
      color: activeColor,
      points: [
        { x: Math.random() * 300, y: Math.random() * 400 },
        { x: Math.random() * 300, y: Math.random() * 400 },
      ],
    };
    setAnnotations((prev) => [...prev, annotation]);
  }, [activeColor]);

  const handleClearAnnotations = useCallback(() => {
    setAnnotations([]);
  }, []);

  const handleNext = useCallback(() => {
    dispatch(
      setMoistureMap({
        path,
        basePhotoId,
        annotations,
      }),
    );
    onNext();
  }, [dispatch, path, basePhotoId, annotations, onNext]);

  const waterDamageCount = annotations.filter((a) => a.color === 'blue').length;
  const mouldCount = annotations.filter((a) => a.color === 'green').length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.stepNum}>Step 5</Text>
      <Text style={styles.title}>Moisture Map Markup</Text>
      <Text style={styles.subtitle}>
        Freehand annotation directly on the room photo. Mark water damage and
        mould areas.
      </Text>

      {/* Color Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Blue = Water damage</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
          <Text style={styles.legendText}>Green = Mould</Text>
        </View>
      </View>

      {/* Drawing Canvas Placeholder */}
      <AppCard variant="outlined" padding="lg" style={styles.canvasCard}>
        {basePhotoId ? (
          <View style={styles.canvasArea}>
            <Droplets size={32} color={Colors.gray300} />
            <Text style={styles.canvasText}>
              Drawing canvas on room photo
            </Text>
            <Text style={styles.canvasHint}>
              (In production: freehand drawing overlay on the photo)
            </Text>

            {/* Color selector */}
            <View style={styles.colorSelector}>
              <Text style={styles.colorLabel}>Active Color:</Text>
              <AppButton
                title="Water Damage"
                onPress={() => setActiveColor('blue')}
                variant={activeColor === 'blue' ? 'primary' : 'outline'}
                size="sm"
                style={styles.colorBtn}
              />
              <AppButton
                title="Mould"
                onPress={() => setActiveColor('green')}
                variant={activeColor === 'green' ? 'secondary' : 'outline'}
                size="sm"
                style={styles.colorBtn}
              />
            </View>

            <View style={styles.canvasActions}>
              <AppButton
                title="Add Annotation"
                onPress={handleAddAnnotation}
                variant="outline"
                size="sm"
              />
              <AppButton
                title="Clear All"
                onPress={handleClearAnnotations}
                variant="ghost"
                size="sm"
              />
            </View>
          </View>
        ) : (
          <View style={styles.noPhotoBlock}>
            <Text style={styles.noPhotoText}>
              Select a base photo to annotate
            </Text>
            <AppButton
              title="Use Room Overview Photo"
              onPress={handleSelectBasePhoto}
              variant="outline"
            />
          </View>
        )}
      </AppCard>

      {/* Annotation Summary */}
      {annotations.length > 0 && (
        <AppCard variant="outlined" padding="md" style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Annotations</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View
                style={[styles.summaryDot, { backgroundColor: '#3B82F6' }]}
              />
              <Text style={styles.summaryText}>
                {waterDamageCount} water damage area
                {waterDamageCount !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <View
                style={[styles.summaryDot, { backgroundColor: '#22C55E' }]}
              />
              <Text style={styles.summaryText}>
                {mouldCount} mould area{mouldCount !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </AppCard>
      )}

      <View style={styles.actions}>
        <AppButton
          title="Previous"
          onPress={onPrev}
          variant="outline"
          style={styles.actionBtn}
        />
        <AppButton
          title="Complete Room"
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
  legend: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.navy,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendText: {
    ...Typography.captionBold,
    color: Colors.white,
  },
  canvasCard: {
    marginBottom: Spacing.xl,
    minHeight: 280,
  },
  canvasArea: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  canvasText: {
    ...Typography.bodyBold,
    color: Colors.gray700,
  },
  canvasHint: {
    ...Typography.caption,
    color: Colors.gray500,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  colorSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  colorLabel: {
    ...Typography.captionBold,
    color: Colors.gray700,
  },
  colorBtn: {
    minWidth: 100,
  },
  canvasActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  noPhotoBlock: {
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },
  noPhotoText: {
    ...Typography.body,
    color: Colors.gray500,
  },
  summaryCard: {
    marginBottom: Spacing.xl,
  },
  summaryTitle: {
    ...Typography.bodyBold,
    color: Colors.navy,
    marginBottom: Spacing.sm,
  },
  summaryRow: {
    gap: Spacing.sm,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  summaryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  summaryText: {
    ...Typography.caption,
    color: Colors.gray700,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionBtn: { flex: 1 },
});

export default React.memo(StepMoistureMap);

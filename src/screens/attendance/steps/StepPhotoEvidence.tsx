import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { Camera, Trash2, ImagePlus } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setStepData, addPhoto, removePhoto } from '../../../store/slices/attendanceSlice';
import { AppButton, AppCard } from '../../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';
import { generateId } from '../../../utils';
import type { Photo } from '../../../types/models';

interface StepPhotoEvidenceProps {
  onNext: () => void;
  onPrev: () => void;
}

const StepPhotoEvidence: React.FC<StepPhotoEvidenceProps> = ({
  onNext,
  onPrev,
}) => {
  const dispatch = useAppDispatch();
  const photos = useAppSelector((state) => state.attendance.photos);

  const handleAddPhoto = useCallback(() => {
    // In production, this would open the camera or image picker
    // For now, we simulate adding a photo placeholder
    const newPhoto: Photo = {
      id: generateId(),
      uri: `photo_${Date.now()}.jpg`,
      timestamp: new Date().toISOString(),
      type: 'during',
      caption: `Photo ${photos.length + 1}`,
    };
    dispatch(addPhoto(newPhoto));
  }, [dispatch, photos.length]);

  const handleRemovePhoto = useCallback(
    (photoId: string) => {
      Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => dispatch(removePhoto(photoId)),
        },
      ]);
    },
    [dispatch],
  );

  const handleNext = useCallback(() => {
    if (photos.length === 0) {
      Alert.alert('Validation', 'At least one photo is required.');
      return;
    }

    dispatch(
      setStepData({
        step: 6,
        data: { hasPhotos: true, photoCount: photos.length },
      }),
    );
    onNext();
  }, [photos.length, dispatch, onNext]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Photo Evidence</Text>
      <Text style={styles.subtitle}>
        Capture photos of the work performed and site conditions.
      </Text>

      <View style={styles.addSection}>
        <AppButton
          title="Take Photo"
          onPress={handleAddPhoto}
          variant="outline"
          icon={<Camera size={18} color={Colors.blue} />}
          style={styles.addBtn}
        />
        <AppButton
          title="From Gallery"
          onPress={handleAddPhoto}
          variant="outline"
          icon={<ImagePlus size={18} color={Colors.blue} />}
          style={styles.addBtn}
        />
      </View>

      <Text style={styles.photoCount}>
        {photos.length} photo{photos.length !== 1 ? 's' : ''} added
      </Text>

      <View style={styles.photoGrid}>
        {photos.map((photo) => (
          <AppCard
            key={photo.id}
            variant="outlined"
            padding="md"
            style={styles.photoCard}>
            <View style={styles.photoPlaceholder}>
              <Camera size={24} color={Colors.gray300} />
              <Text style={styles.photoName}>{photo.caption}</Text>
            </View>
            <AppButton
              title=""
              onPress={() => handleRemovePhoto(photo.id)}
              variant="ghost"
              size="sm"
              icon={<Trash2 size={16} color={Colors.red} />}
              style={styles.removeBtn}
            />
          </AppCard>
        ))}
      </View>

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
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
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
  addSection: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  addBtn: {
    flex: 1,
  },
  photoCount: {
    ...Typography.captionBold,
    color: Colors.gray700,
    marginBottom: Spacing.md,
  },
  photoGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  photoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  photoPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  photoName: {
    ...Typography.caption,
    color: Colors.gray700,
  },
  removeBtn: {
    minHeight: 32,
    paddingHorizontal: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionBtn: {
    flex: 1,
  },
});

export default React.memo(StepPhotoEvidence);

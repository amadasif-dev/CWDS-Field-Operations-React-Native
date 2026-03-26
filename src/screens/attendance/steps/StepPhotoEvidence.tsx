import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Camera, Trash2, ImagePlus } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  setStepData,
  addPhoto,
  removePhoto,
} from '../../../store/slices/attendanceSlice';
import { AppButton, AppCard } from '../../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';
import { generateId } from '../../../utils';
import {
  pickImageFromCamera,
  pickImageFromGallery,
} from '../../../utils/imagePicker';
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
  const photos = useAppSelector(state => state.attendance.photos);

  // Open camera
  const handleCamera = useCallback(async () => {
    try {
      const result = await pickImageFromCamera();
      if (result) {
        const newPhoto: Photo = {
          id: generateId(),
          uri: result.uri,
          timestamp: new Date().toISOString(),
          type: 'during',
          caption: result.fileName
            ? result.fileName.split('.')[0]
            : `Photo ${photos.length + 1}`,
        };
        dispatch(addPhoto(newPhoto));
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message || 'Failed to take photo. Please try again.',
      );
    }
  }, [dispatch, photos.length]);

  // Open gallery
  const handleGallery = useCallback(async () => {
    try {
      const result = await pickImageFromGallery();
      if (result) {
        const newPhoto: Photo = {
          id: generateId(),
          uri: result.uri,
          timestamp: new Date().toISOString(),
          type: 'during',
          caption: result.fileName
            ? result.fileName.split('.')[0]
            : `Photo ${photos.length + 1}`,
        };
        dispatch(addPhoto(newPhoto));
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message || 'Failed to select image. Please try again.',
      );
    }
  }, [dispatch, photos.length]);

  // Remove photo with confirmation
  const handleRemovePhoto = useCallback(
    (photoId: string) => {
      Alert.alert(
        'Remove Photo',
        'Are you sure you want to remove this photo?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => dispatch(removePhoto(photoId)),
          },
        ],
      );
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

  // Render a single photo item in the grid
  const renderPhotoItem = ({ item }: { item: Photo }) => (
    <View style={styles.gridItem}>
      <Image source={{ uri: item.uri }} style={styles.thumbnail} />
      <TouchableOpacity
        style={styles.removeOverlay}
        onPress={() => handleRemovePhoto(item.id)}
        activeOpacity={0.7}
      >
        <Trash2 size={20} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Photo Evidence</Text>
      <Text style={styles.subtitle}>
        Capture photos of the work performed and site conditions.
      </Text>

      <View style={styles.addSection}>
        <AppButton
          title="Take Photo"
          onPress={handleCamera}
          variant="outline"
          icon={<Camera size={18} color={Colors.blue} />}
          style={styles.addBtn}
        />
        <AppButton
          title="From Gallery"
          onPress={handleGallery}
          variant="outline"
          icon={<ImagePlus size={18} color={Colors.blue} />}
          style={styles.addBtn}
        />
      </View>

      <Text style={styles.photoCount}>
        {photos.length} photo{photos.length !== 1 ? 's' : ''} added
      </Text>

      {photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No photos added yet</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhotoItem}
          keyExtractor={item => item.id}
          numColumns={4}
          scrollEnabled={false} // Allow ScrollView to handle scrolling
          contentContainerStyle={styles.gridContainer}
        />
      )}

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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.gray500,
  },
  gridContainer: {
    marginBottom: Spacing.xl,
  },
  gridItem: {
    flex: 1 / 4, // 4 columns
    aspectRatio: 1, // Square thumbnails
    padding: Spacing.xs,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray100,
  },
  removeOverlay: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    padding: 6,
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

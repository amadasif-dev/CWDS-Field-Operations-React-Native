// RoomOverviewPhotos.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { Camera, Trash2, ImagePlus, Ruler } from 'lucide-react-native';
import { pickImageFromCamera, pickImageFromGallery } from '../../../../utils/imagePicker';
import { BorderRadius, Colors, Spacing, Typography } from '../../../../theme';
import { AppButton, AppInput, BottomSheetAlert } from '../../../../components';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RoomOverviewPhotosProps {
  room: any;
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const MIN_PHOTOS = 4;

const RoomOverviewPhotos: React.FC<RoomOverviewPhotosProps> = ({
  room,
  data,
  onUpdate,
  onNext,
}) => {
  const [photos, setPhotos] = useState(data.overviewPhotos || []);
  const [dimensions, setDimensions] = useState(
    data.dimensions || { length: '', width: '', height: '' },
  );
  const [showValidationAlert, setShowValidationAlert] = useState(false);

  const handleAddPhoto = useCallback(async () => {
    try {
      const result = await pickImageFromCamera();
      if (result) {
        const newPhoto = {
          id: Date.now().toString(),
          uri: result.uri,
          type: 'overview',
          roomId: room.id,
          timestamp: new Date().toISOString(),
        };
        const updatedPhotos = [...photos, newPhoto];
        setPhotos(updatedPhotos);
        onUpdate({ overviewPhotos: updatedPhotos, dimensions });
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
    }
  }, [photos, dimensions, room.id, onUpdate]);

  const handleAddPhotoFromGallery = useCallback(async () => {
    try {
      const result = await pickImageFromGallery();
      if (result) {
        const newPhoto = {
          id: Date.now().toString(),
          uri: result.uri,
          type: 'overview',
          roomId: room.id,
          timestamp: new Date().toISOString(),
        };
        const updatedPhotos = [...photos, newPhoto];
        setPhotos(updatedPhotos);
        onUpdate({ overviewPhotos: updatedPhotos, dimensions });
      }
    } catch (error) {
      console.error('Failed to pick photo from gallery:', error);
    }
  }, [photos, dimensions, room.id, onUpdate]);

  const handleRemovePhoto = useCallback(
    (photoId: string) => {
      const updatedPhotos = photos.filter((p: { id: string }) => p.id !== photoId);
      setPhotos(updatedPhotos);
      onUpdate({ overviewPhotos: updatedPhotos, dimensions });
    },
    [photos, dimensions, onUpdate],
  );

  const handleDimensionChange = useCallback(
    (field: string, value: string) => {
      const updated = { ...dimensions, [field]: value };
      setDimensions(updated);
      onUpdate({ overviewPhotos: photos, dimensions: updated });
    },
    [photos, dimensions, onUpdate],
  );

  const handleNext = useCallback(() => {
    if (photos.length < MIN_PHOTOS) {
      setShowValidationAlert(true);
      return;
    }
    if (!dimensions.length || !dimensions.width || !dimensions.height) {
      setShowValidationAlert(true);
      return;
    }
    onNext();
  }, [photos.length, dimensions, onNext]);

  const renderPhoto = ({ item }: { item: any }) => (
    <View style={styles.photoItem}>
      <Image source={{ uri: item.uri }} style={styles.photo} />
      <TouchableOpacity
        style={styles.removePhoto}
        onPress={() => handleRemovePhoto(item.id)}
      >
        <Trash2 size={16} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Room Overview</Text>
      <Text style={styles.subtitle}>
        Capture at least 4 overview photos from each corner of the room.
      </Text>

      <View style={styles.photoSection}>
        <View style={styles.photoHeader}>
          <Text style={styles.sectionTitle}>Overview Photos</Text>
          <Text style={styles.photoCount}>
            {photos.length} of {MIN_PHOTOS} minimum
          </Text>
        </View>

        <View style={styles.photoActions}>
          <AppButton
            title="Take Photo"
            onPress={handleAddPhoto}
            variant="outline"
            icon={<Camera size={18} color={Colors.blue} />}
            style={styles.photoBtn}
          />
          <AppButton
            title="From Gallery"
            onPress={handleAddPhotoFromGallery}
            variant="outline"
            icon={<ImagePlus size={18} color={Colors.blue} />}
            style={styles.photoBtn}
          />
        </View>

        {photos.length > 0 ? (
          <FlatList
            data={photos}
            renderItem={renderPhoto}
            keyExtractor={item => item.id}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.photoGrid}
          />
        ) : (
          <View style={styles.emptyPhotos}>
            <Text style={styles.emptyText}>No photos captured yet</Text>
          </View>
        )}
      </View>

      <View style={styles.dimensionsSection}>
        <View style={styles.sectionHeader}>
          <Ruler size={18} color={Colors.blue} />
          <Text style={styles.sectionTitle}>Room Dimensions</Text>
        </View>

        <View style={styles.dimensionsRow}>
          <View style={styles.dimensionInput}>
            <AppInput
              label="Length (m)"
              placeholder="0.00"
              value={dimensions.length}
              onChangeText={v => handleDimensionChange('length', v)}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.dimensionInput}>
            <AppInput
              label="Width (m)"
              placeholder="0.00"
              value={dimensions.width}
              onChangeText={v => handleDimensionChange('width', v)}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.dimensionInput}>
            <AppInput
              label="Height (m)"
              placeholder="0.00"
              value={dimensions.height}
              onChangeText={v => handleDimensionChange('height', v)}
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      </View>

      <AppButton
        title="Next"
        onPress={handleNext}
        variant="primary"
        size="lg"
        style={styles.nextButton}
      />

      <BottomSheetAlert
        visible={showValidationAlert}
        type="warning"
        title="Validation Error"
        message={
          photos.length < MIN_PHOTOS
            ? `Please capture at least ${MIN_PHOTOS} overview photos.`
            : 'Please enter all room dimensions.'
        }
        primaryLabel="OK"
        onClose={() => setShowValidationAlert(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { ...Typography.h2, color: Colors.navy, marginBottom: Spacing.xs },
  subtitle: {
    ...Typography.body,
    color: Colors.gray500,
    marginBottom: Spacing.xl,
  },
  photoSection: { marginBottom: Spacing.xl },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: { ...Typography.bodyBold, color: Colors.navy },
  photoCount: { ...Typography.caption, color: Colors.gray700 },
  photoActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  photoBtn: { flex: 1 },
  photoGrid: { marginTop: Spacing.md },
  photoItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: Spacing.xs,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray100,
  },
  removePhoto: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  emptyPhotos: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: { ...Typography.body, color: Colors.gray500 },
  dimensionsSection: { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dimensionsRow: { flexDirection: 'row', gap: Spacing.sm },
  dimensionInput: { flex: 1 },
  nextButton: { marginTop: Spacing.xl },
});

export default RoomOverviewPhotos;

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { Camera, Trash2 } from 'lucide-react-native';
import { useAppDispatch } from '../../../store';
import {
  addOverviewPhoto,
  removeOverviewPhoto,
  setRoomDimensions,
} from '../../../store/slices/inspectionSlice';
import { AppButton, AppInput, AppCard } from '../../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';
import { generateId } from '../../../utils';
import type { RoomInspection, InspectionPhoto } from '../../../types/inspection';

interface Props {
  path: { floorId: string; unitId: string; roomId: string };
  room: RoomInspection;
  onNext: () => void;
}

const MIN_PHOTOS = 4;

const StepRoomOverview: React.FC<Props> = ({ path, room, onNext }) => {
  const dispatch = useAppDispatch();

  const [length, setLength] = useState(
    room.dimensions?.length?.toString() ?? '',
  );
  const [width, setWidth] = useState(
    room.dimensions?.width?.toString() ?? '',
  );
  const [height, setHeight] = useState(
    room.dimensions?.height?.toString() ?? '',
  );

  const handleCapture = useCallback(() => {
    // Production: launch camera via react-native-image-picker
    const photo: InspectionPhoto = {
      id: generateId(),
      uri: `room_overview_${Date.now()}.jpg`,
      timestamp: new Date().toISOString(),
      tags: {
        roomName: room.name,
        jobNumber: path.floorId,
      },
      type: 'room_overview',
    };
    dispatch(addOverviewPhoto({ path, photo }));
  }, [dispatch, path, room.name]);

  const handleRemove = useCallback(
    (photoId: string) => {
      dispatch(removeOverviewPhoto({ path, photoId }));
    },
    [dispatch, path],
  );

  const handleNext = useCallback(() => {
    if (room.overviewPhotos.length < MIN_PHOTOS) {
      Alert.alert(
        'Photos Required',
        `At least ${MIN_PHOTOS} overview photos are required. You have ${room.overviewPhotos.length}.`,
      );
      return;
    }

    const l = parseFloat(length);
    const w = parseFloat(width);
    const h = parseFloat(height);

    if (isNaN(l) || isNaN(w) || isNaN(h) || l <= 0 || w <= 0 || h <= 0) {
      Alert.alert('Dimensions Required', 'Enter valid room dimensions (L × W × H).');
      return;
    }

    dispatch(
      setRoomDimensions({
        path,
        dimensions: { length: l, width: w, height: h },
      }),
    );
    onNext();
  }, [room.overviewPhotos.length, length, width, height, dispatch, path, onNext]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.stepNum}>Step 1</Text>
      <Text style={styles.title}>Room Overview Photos</Text>
      <Text style={styles.subtitle}>
        Capture at least {MIN_PHOTOS} overview photos of the room. Auto-tagged with room
        name, timestamp, and job number.
      </Text>

      {/* Capture Button */}
      <AppButton
        title="Tap to capture room overview photo"
        onPress={handleCapture}
        variant="outline"
        icon={<Camera size={20} color={Colors.blue} />}
        fullWidth
        size="lg"
        style={styles.captureBtn}
      />

      <Text style={styles.tagHint}>
        Auto-tagged: {room.name} · Timestamp · Job number
      </Text>

      {/* Photo Grid */}
      <Text style={styles.photoCount}>
        {room.overviewPhotos.length} / {MIN_PHOTOS}+ photos
      </Text>
      {room.overviewPhotos.map((photo) => (
        <AppCard
          key={photo.id}
          variant="outlined"
          padding="md"
          style={styles.photoRow}>
          <View style={styles.photoInfo}>
            <Camera size={16} color={Colors.gray500} />
            <Text style={styles.photoText} numberOfLines={1}>
              {new Date(photo.timestamp).toLocaleTimeString()}
            </Text>
          </View>
          <AppButton
            title=""
            onPress={() => handleRemove(photo.id)}
            variant="ghost"
            size="sm"
            icon={<Trash2 size={16} color={Colors.red} />}
          />
        </AppCard>
      ))}

      {/* Dimensions */}
      <View style={styles.dimSection}>
        <Text style={styles.dimTitle}>Room Dimensions</Text>
        <View style={styles.dimRow}>
          <AppInput
            label="Length (m)"
            value={length}
            onChangeText={setLength}
            keyboardType="decimal-pad"
            containerStyle={styles.dimInput}
          />
          <Text style={styles.dimSep}>×</Text>
          <AppInput
            label="Width (m)"
            value={width}
            onChangeText={setWidth}
            keyboardType="decimal-pad"
            containerStyle={styles.dimInput}
          />
          <Text style={styles.dimSep}>×</Text>
          <AppInput
            label="Height (m)"
            value={height}
            onChangeText={setHeight}
            keyboardType="decimal-pad"
            containerStyle={styles.dimInput}
          />
        </View>
      </View>

      <AppButton
        title="Next: Surface Inspection"
        onPress={handleNext}
        fullWidth
        size="lg"
        style={styles.nextBtn}
      />
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
  captureBtn: {
    borderStyle: 'dashed',
    minHeight: 100,
    marginBottom: Spacing.sm,
  },
  tagHint: {
    ...Typography.caption,
    color: Colors.gray500,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  photoCount: {
    ...Typography.captionBold,
    color: Colors.gray700,
    marginBottom: Spacing.sm,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  photoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  photoText: {
    ...Typography.caption,
    color: Colors.gray700,
  },
  dimSection: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  dimTitle: {
    ...Typography.bodyBold,
    color: Colors.navy,
    marginBottom: Spacing.md,
  },
  dimRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  dimInput: { flex: 1 },
  dimSep: {
    ...Typography.h3,
    color: Colors.gray500,
    paddingBottom: Spacing.md,
  },
  nextBtn: { marginTop: Spacing.sm },
});

export default React.memo(StepRoomOverview);

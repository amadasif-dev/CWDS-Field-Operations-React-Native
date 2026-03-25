import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Building2,
  DoorOpen,
  Layers,
  Plus,
  Trash2,
  ChevronRight,
  CheckCircle,
} from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  initInspection,
  loadInspectionDraft,
  saveInspectionDraft,
  addFloor,
  addUnit,
  addRoom,
  removeFloor,
} from '../../store/slices/inspectionSlice';
import {
  AppButton,
  AppCard,
  AppInput,
  AppModal,
  SectionHeader,
  EmptyState,
} from '../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { generateId } from '../../utils';
import type { RootStackScreenProps } from '../../types/navigation';

type Props = RootStackScreenProps<'InspectionSetup'>;

const InspectionSetupScreen: React.FC<Props> = ({ route }) => {
  const { jobId } = route.params;
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const inspection = useAppSelector((state) => state.inspection.current);

  const [addModalType, setAddModalType] = useState<
    'floor' | 'unit' | 'room' | null
  >(null);
  const [addModalParent, setAddModalParent] = useState<{
    floorId?: string;
    unitId?: string;
  }>({});
  const [newName, setNewName] = useState('');

  useEffect(() => {
    dispatch(initInspection({ jobId }));
    dispatch(loadInspectionDraft(jobId));
  }, [dispatch, jobId]);

  const openAddModal = useCallback(
    (
      type: 'floor' | 'unit' | 'room',
      parentIds?: { floorId?: string; unitId?: string },
    ) => {
      setAddModalType(type);
      setAddModalParent(parentIds ?? {});
      setNewName('');
    },
    [],
  );

  const handleAdd = useCallback(() => {
    if (!newName.trim()) {
      Alert.alert('Required', 'Please enter a name.');
      return;
    }
    const id = generateId();
    if (addModalType === 'floor') {
      dispatch(addFloor({ id, name: newName.trim() }));
    } else if (addModalType === 'unit' && addModalParent.floorId) {
      dispatch(
        addUnit({
          floorId: addModalParent.floorId,
          id,
          name: newName.trim(),
        }),
      );
    } else if (
      addModalType === 'room' &&
      addModalParent.floorId &&
      addModalParent.unitId
    ) {
      dispatch(
        addRoom({
          floorId: addModalParent.floorId,
          unitId: addModalParent.unitId,
          id,
          name: newName.trim(),
        }),
      );
    }
    setAddModalType(null);
  }, [addModalType, addModalParent, newName, dispatch]);

  const handleRoomPress = useCallback(
    (floorId: string, unitId: string, roomId: string, roomName: string) => {
      navigation.navigate('RoomInspection', {
        jobId,
        floorId,
        unitId,
        roomId,
        roomName,
      });
    },
    [navigation, jobId],
  );

  const handleSaveDraft = useCallback(async () => {
    await dispatch(saveInspectionDraft());
    Alert.alert('Saved', 'Inspection draft saved.');
  }, [dispatch]);

  const modalTitle =
    addModalType === 'floor'
      ? 'Add Floor'
      : addModalType === 'unit'
        ? 'Add Unit'
        : 'Add Room';

  const modalPlaceholder =
    addModalType === 'floor'
      ? 'e.g. Ground Floor'
      : addModalType === 'unit'
        ? 'e.g. Unit 1A'
        : 'e.g. Master Bedroom';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <SectionHeader
          title="Inspection Setup"
          subtitle="Add floors, units, and rooms"
          icon={<Building2 size={22} color={Colors.blue} />}
        />

        {(!inspection || inspection.floors.length === 0) && (
          <EmptyState
            title="No Floors Yet"
            message="Start by adding a floor to the building."
            actionLabel="Add Floor"
            onAction={() => openAddModal('floor')}
          />
        )}

        {inspection?.floors.map((floor) => (
          <AppCard
            key={floor.id}
            variant="outlined"
            padding="lg"
            style={styles.floorCard}>
            <View style={styles.floorHeader}>
              <View style={styles.floorTitleRow}>
                <Layers size={18} color={Colors.blue} />
                <Text style={styles.floorTitle}>{floor.name}</Text>
              </View>
              <AppButton
                title="Add Unit"
                onPress={() =>
                  openAddModal('unit', { floorId: floor.id })
                }
                variant="ghost"
                size="sm"
                icon={<Plus size={14} color={Colors.blue} />}
              />
            </View>

            {floor.units.length === 0 && (
              <Text style={styles.emptyHint}>No units added yet.</Text>
            )}

            {floor.units.map((unit) => (
              <View key={unit.id} style={styles.unitBlock}>
                <View style={styles.unitHeader}>
                  <View style={styles.unitTitleRow}>
                    <DoorOpen size={16} color={Colors.gold} />
                    <Text style={styles.unitTitle}>{unit.name}</Text>
                  </View>
                  <AppButton
                    title="Add Room"
                    onPress={() =>
                      openAddModal('room', {
                        floorId: floor.id,
                        unitId: unit.id,
                      })
                    }
                    variant="ghost"
                    size="sm"
                    icon={<Plus size={14} color={Colors.blue} />}
                  />
                </View>

                {unit.rooms.map((room) => (
                  <AppCard
                    key={room.id}
                    onPress={() =>
                      handleRoomPress(
                        floor.id,
                        unit.id,
                        room.id,
                        room.name,
                      )
                    }
                    variant="outlined"
                    padding="md"
                    style={styles.roomCard}>
                    <View style={styles.roomRow}>
                      <View style={styles.roomInfo}>
                        <Text style={styles.roomName}>{room.name}</Text>
                        <Text style={styles.roomStep}>
                          {room.isComplete
                            ? 'Complete'
                            : `Step ${room.currentStep} of 5`}
                        </Text>
                      </View>
                      {room.isComplete ? (
                        <CheckCircle size={20} color={Colors.green} />
                      ) : (
                        <ChevronRight size={18} color={Colors.gray500} />
                      )}
                    </View>
                  </AppCard>
                ))}
              </View>
            ))}
          </AppCard>
        ))}

        {inspection && inspection.floors.length > 0 && (
          <AppButton
            title="Add Floor"
            onPress={() => openAddModal('floor')}
            variant="outline"
            icon={<Plus size={16} color={Colors.blue} />}
            fullWidth
            style={styles.addFloorBtn}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          title="Save Draft"
          onPress={handleSaveDraft}
          variant="outline"
          style={styles.footerBtn}
        />
        <AppButton
          title="Submit Inspection"
          onPress={() =>
            Alert.alert('Submit', 'Ensure all rooms are complete first.')
          }
          style={styles.footerBtn}
        />
      </View>

      {/* Add Modal */}
      <AppModal
        visible={addModalType !== null}
        onClose={() => setAddModalType(null)}
        title={modalTitle}>
        <AppInput
          label="Name"
          placeholder={modalPlaceholder}
          value={newName}
          onChangeText={setNewName}
          autoFocus
          required
        />
        <AppButton title="Add" onPress={handleAdd} fullWidth />
      </AppModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  floorCard: {
    marginBottom: Spacing.lg,
  },
  floorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  floorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  floorTitle: {
    ...Typography.h3,
    color: Colors.navy,
  },
  emptyHint: {
    ...Typography.caption,
    color: Colors.gray500,
    fontStyle: 'italic',
    paddingVertical: Spacing.sm,
  },
  unitBlock: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  unitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  unitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  unitTitle: {
    ...Typography.bodyBold,
    color: Colors.gray700,
  },
  roomCard: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.lg,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    ...Typography.body,
    color: Colors.navy,
  },
  roomStep: {
    ...Typography.caption,
    color: Colors.gray500,
    marginTop: Spacing.xxs,
  },
  addFloorBtn: {
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    backgroundColor: Colors.white,
  },
  footerBtn: {
    flex: 1,
  },
});

export default InspectionSetupScreen;

// StepRoomInspection.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Plus, CheckCircle, Circle, ArrowRight } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setStepData, setRooms, updateRoom } from '../../../store/slices/attendanceSlice';
import { AppButton, AppCard, BottomSheetAlert, AddRoomModal } from '../../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';
import RoomInspectionWizard from './Nested Sub-Steps/RoomInspectionWizard';
import type { Room } from '../../../types/models';

interface StepRoomInspectionProps {
  onNext: () => void;
  onPrev: () => void;
}

const StepRoomInspection: React.FC<StepRoomInspectionProps> = ({
  onNext,
  onPrev,
}) => {
  const dispatch = useAppDispatch();
  const stepData = useAppSelector(state => state.attendance.stepData[4]);
  const savedRooms = useAppSelector(state => state.attendance.rooms);
  const jobDetails = useAppSelector(state => state.jobs.selectedJob);

  const [rooms, setRoomsState] = useState<Room[]>(savedRooms || []);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);

  // Load rooms from job details on mount
  useEffect(() => {
    if (rooms.length === 0 && jobDetails?.siteIntelligence?.rooms) {
      const initialRooms: Room[] = jobDetails.siteIntelligence.rooms.map((room: any) => ({
        id: room.id,
        name: room.name,
        floor: room.floor,
        status: 'pending',
        data: undefined,
      }));
      setRoomsState(initialRooms);
      dispatch(setRooms(initialRooms));
    }
  }, [jobDetails, rooms.length]);

  const handleRoomPress = useCallback((room: Room) => {
    setSelectedRoom(room);
  }, []);

  const handleRoomComplete = useCallback((roomId: string, roomData: any) => {
    const updatedRooms: Room[] = rooms.map(room =>
      room.id === roomId
        ? { ...room, status: 'complete' as const, data: roomData }
        : room
    );
    setRoomsState(updatedRooms);
    dispatch(setRooms(updatedRooms));
    setSelectedRoom(null);
  }, [rooms, dispatch]);

  const handleAddRoom = useCallback((roomName: string, roomFloor: string) => {
    const newRoom: Room = {
      id: `room_${Date.now()}`,
      name: roomName,
      floor: roomFloor || 'Ground Floor',
      status: 'pending',
      data: undefined,
    };

    const updatedRooms = [...rooms, newRoom];
    setRoomsState(updatedRooms);
    dispatch(setRooms(updatedRooms));
    setShowAddRoomModal(false);
  }, [rooms, dispatch]);

  const allRoomsComplete = rooms.length > 0 && rooms.every(room => room.status === 'complete');
  const completedCount = rooms.filter(room => room.status === 'complete').length;

  const handleNext = useCallback(() => {
    if (!allRoomsComplete) {
      setShowValidationAlert(true);
      return;
    }

    dispatch(
      setStepData({
        step: 4,
        data: {
          rooms: rooms,
          allRoomsComplete: true,
          completedCount,
        },
      })
    );
    onNext();
  }, [allRoomsComplete, rooms, completedCount, dispatch, onNext]);

  const getStatusIcon = (status: string) => {
    if (status === 'complete') {
      return <CheckCircle size={20} color={Colors.green} />;
    }
    if (status === 'in_progress') {
      return <Circle size={20} color={Colors.orange} />;
    }
    return <Circle size={20} color={Colors.gray300} />;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete': return 'Complete';
      case 'in_progress': return 'In Progress';
      default: return 'Not Started';
    }
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Room Inspection</Text>
        <Text style={styles.subtitle}>
          Inspect each room thoroughly. Complete all sections for each room.
        </Text>

        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {completedCount} of {rooms.length} rooms completed
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(completedCount / (rooms.length || 1)) * 100}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.roomList}>
          {rooms.map(room => (
            <TouchableOpacity
              key={room.id}
              onPress={() => handleRoomPress(room)}
              activeOpacity={0.7}
            >
              <AppCard variant="outlined" padding="md" style={styles.roomCard}>
                <View style={styles.roomCardContent}>
                  <View style={styles.roomInfo}>
                    {getStatusIcon(room.status)}
                    <View style={styles.roomDetails}>
                      <Text style={styles.roomName}>{room.name}</Text>
                      <Text style={styles.roomFloor}>{room.floor}</Text>
                    </View>
                  </View>
                  <View style={styles.roomStatus}>
                    <Text style={[
                      styles.statusText,
                      room.status === 'complete' && styles.statusCompleteText
                    ]}>
                      {getStatusText(room.status)}
                    </Text>
                    <ArrowRight size={16} color={Colors.gray500} />
                  </View>
                </View>
              </AppCard>
            </TouchableOpacity>
          ))}
        </View>

        <AppButton
          title="Add Additional Room"
          onPress={() => setShowAddRoomModal(true)}
          variant="outline"
          icon={<Plus size={18} color={Colors.blue} />}
          style={styles.addButton}
        />

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
            variant={allRoomsComplete ? 'primary' : 'secondary'}
            disabled={!allRoomsComplete}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>

      <RoomInspectionWizard
        visible={!!selectedRoom}
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
        onComplete={handleRoomComplete}
      />

      <AddRoomModal
        visible={showAddRoomModal}
        onClose={() => setShowAddRoomModal(false)}
        onAdd={handleAddRoom}
      />

      <BottomSheetAlert
        visible={showValidationAlert}
        type="warning"
        title="Incomplete Rooms"
        message={rooms.length === 0 ? "Please add at least one room to inspect." : "Please complete inspection for all rooms before proceeding."}
        primaryLabel="OK"
        onClose={() => setShowValidationAlert(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: Spacing.huge },
  title: { ...Typography.h2, color: Colors.navy, marginBottom: Spacing.xs },
  subtitle: { ...Typography.body, color: Colors.gray500, marginBottom: Spacing.xl },
  progressInfo: { marginBottom: Spacing.xl },
  progressText: { ...Typography.captionBold, color: Colors.gray700, marginBottom: Spacing.sm },
  progressBar: { height: 6, backgroundColor: Colors.gray100, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.green, borderRadius: 3 },
  roomList: { gap: Spacing.sm, marginBottom: Spacing.lg },
  roomCard: { marginBottom: 0 },
  roomCardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roomInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  roomDetails: { flex: 1 },
  roomName: { ...Typography.bodyBold, color: Colors.navy },
  roomFloor: { ...Typography.caption, color: Colors.gray500, marginTop: Spacing.xxs },
  roomStatus: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  statusText: { ...Typography.caption, color: Colors.gray700 },
  statusCompleteText: { color: Colors.green },
  addButton: { marginBottom: Spacing.xl },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  actionBtn: { flex: 1 },
});

export default StepRoomInspection;
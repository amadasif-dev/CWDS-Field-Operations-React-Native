import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  setActiveRoom,
  advanceRoomStep,
  goBackRoomStep,
  saveInspectionDraft,
} from '../../store/slices/inspectionSlice';
import { Colors, Spacing } from '../../theme';
import { StepProgressBar, AppLoader } from '../../components';
import { ROOM_INSPECTION_STEPS } from '../../types/inspection';
import type { RootStackScreenProps } from '../../types/navigation';
import StepRoomOverview from './steps/StepRoomOverview';
import StepEquipmentLog from './steps/StepEquipmentLog';
import StepSurfaceInspection from './steps/StepSurfaceInspection';
import StepNonRestorable from './steps/StepNonRestorable';
import StepMoistureMap from './steps/StepMoistureMap';

type Props = RootStackScreenProps<'RoomInspection'>;

const STEP_LABELS = ROOM_INSPECTION_STEPS.map((s) => s.title);

const RoomInspectionScreen: React.FC<Props> = ({ route, navigation }) => {
  const { jobId, floorId, unitId, roomId, roomName } = route.params;
  const dispatch = useAppDispatch();
  const path = { floorId, unitId, roomId };

  const room = useAppSelector((state) => {
    const insp = state.inspection.current;
    const floor = insp?.floors.find((f) => f.id === floorId);
    const unit = floor?.units.find((u) => u.id === unitId);
    return unit?.rooms.find((r) => r.id === roomId);
  });

  useEffect(() => {
    dispatch(setActiveRoom(path));
    navigation.setOptions({ title: roomName });
    return () => {
      dispatch(setActiveRoom(null));
    };
  }, [dispatch, navigation, roomName, floorId, unitId, roomId]);

  // Back press → save draft
  useEffect(() => {
    const onBack = () => {
      dispatch(saveInspectionDraft());
      return false; // allow default back
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [dispatch]);

  const handleNext = useCallback(() => {
    dispatch(advanceRoomStep(path));
    if (room && room.currentStep >= 5) {
      dispatch(saveInspectionDraft());
      Alert.alert('Room Complete', `${roomName} inspection is complete.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [dispatch, path, room, roomName, navigation]);

  const handlePrev = useCallback(() => {
    dispatch(goBackRoomStep(path));
  }, [dispatch, path]);

  if (!room) {
    return <AppLoader fullScreen message="Loading room..." />;
  }

  const currentStep = room.currentStep;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepRoomOverview path={path} room={room} onNext={handleNext} />;
      case 2:
        return (
          <StepSurfaceInspection
            path={path}
            room={room}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 3:
        return (
          <StepNonRestorable
            path={path}
            room={room}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 4:
        return (
          <StepEquipmentLog
            path={path}
            room={room}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 5:
        return (
          <StepMoistureMap
            path={path}
            room={room}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StepProgressBar
        currentStep={currentStep}
        totalSteps={5}
        labels={STEP_LABELS}
      />
      <View style={styles.content}>{renderStep()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  content: {
    flex: 1,
  },
});

export default RoomInspectionScreen;

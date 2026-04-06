// RoomInspectionWizard.tsx
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { X, Camera, Ruler, Droplet, Wrench, Map } from 'lucide-react-native';
import RoomOverviewPhotos from './RoomOverviewPhotos';
import SurfaceInspection from './SurfaceInspection';
import EquipmentPerRoom from './EquipmentPerRoom';
import { StepProgressBar } from '../../../../components';
import MoistureMapMarkup from './MoistureMapMarkup';
import { Colors, Spacing, Typography } from '../../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Room {
  id: string;
  name: string;
  floor: string;
  status: string;
  data?: any;
}

interface RoomInspectionWizardProps {
  visible: boolean;
  room: Room | null;
  onClose: () => void;
  onComplete: (roomId: string, data: any) => void;
}

const SUB_STEPS = [
  'Overview Photos',
  'Surface Inspection',
  'Equipment',
  'Moisture Map',
];

const RoomInspectionWizard: React.FC<RoomInspectionWizardProps> = ({
  visible,
  room,
  onClose,
  onComplete,
}) => {
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [roomData, setRoomData] = useState<any>({
    overviewPhotos: [],
    dimensions: { length: '', width: '', height: '' },
    surfaces: {
      ceiling: null,
      walls: null,
      flooring: null,
    },
    equipment: [],
    moistureMap: null,
  });
  const [nonRestorableSurfaces, setNonRestorableSurfaces] = useState<string[]>(
    [],
  );

  const handleNext = useCallback(() => {
    if (currentSubStep < SUB_STEPS.length - 1) {
      setCurrentSubStep(currentSubStep + 1);
    } else {
      onComplete(room!.id, roomData);
      onClose();
      setCurrentSubStep(0);
      setRoomData({
        overviewPhotos: [],
        dimensions: { length: '', width: '', height: '' },
        surfaces: { ceiling: null, walls: null, flooring: null },
        equipment: [],
        moistureMap: null,
      });
    }
  }, [currentSubStep, roomData, room, onComplete, onClose]);

  const handlePrev = useCallback(() => {
    if (currentSubStep > 0) {
      setCurrentSubStep(currentSubStep - 1);
    } else {
      onClose();
    }
  }, [currentSubStep, onClose]);

  const updateRoomData = useCallback((data: any) => {
    setRoomData((prev: any) => ({ ...prev, ...data }));
  }, []);

  const renderSubStep = () => {
    switch (currentSubStep) {
      case 0:
        return (
          <RoomOverviewPhotos
            room={room!}
            data={roomData}
            onUpdate={updateRoomData}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <SurfaceInspection
            room={room!}
            data={roomData}
            onUpdate={updateRoomData}
            onNext={handleNext}
            onPrev={handlePrev}
            nonRestorableSurfaces={nonRestorableSurfaces}
            setNonRestorableSurfaces={setNonRestorableSurfaces}
          />
        );
      case 2:
        return (
          <EquipmentPerRoom
            room={room!}
            data={roomData}
            onUpdate={updateRoomData}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 3:
        return (
          <MoistureMapMarkup
            room={room!}
            data={roomData}
            onUpdate={updateRoomData}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      default:
        return null;
    }
  };

  if (!room) return null;

  return (
    <SafeAreaView edges={['top', 'bottom']}>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={onClose}
        statusBarTranslucent={true}
      >
        <StatusBar barStyle="dark-content" backgroundColor="rgba(0,0,0,0.5)" />
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handlePrev} style={styles.headerButton}>
              <X size={24} color={Colors.navy} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{room.name}</Text>
            <View style={styles.headerButton} />
          </View>
          <View style={styles.progressContainer}>
            <StepProgressBar
              currentStep={currentSubStep + 1}
              totalSteps={SUB_STEPS.length}
              labels={SUB_STEPS}
            />
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {renderSubStep()}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    paddingTop: Spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.navy,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
});

export default RoomInspectionWizard;

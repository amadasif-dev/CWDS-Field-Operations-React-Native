import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from '../store';
import { restoreSession } from '../store/slices/authSlice';
import { setAppReady } from '../store/slices/appSlice';
import type { RootStackParamList } from '../types/navigation';
import { Colors } from '../theme';
import { AppLoader } from '../components';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import InspectionSetupScreen from '../screens/inspection/InspectionSetupScreen';
import RoomInspectionScreen from '../screens/inspection/RoomInspectionScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import JobDetailScreen from '../screens/jobs/JobDetailScreen';
import AttendanceWizardScreen from '../screens/attendance/AttendanceWizardScreen';
import AttendanceSummaryScreen from '../screens/attendance/AttendanceSummaryScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isInitialized } = useAppSelector(
    state => state.auth,
  );

  useEffect(() => {
    const init = async () => {
      await dispatch(restoreSession());
      dispatch(setAppReady(true));
    };
    init();
  }, [dispatch]);

  if (!isInitialized) {
    return <AppLoader fullScreen message="Loading..." />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.offWhite },
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="JobDetail"
            component={JobDetailScreen}
            options={{
              headerShown: true,
              title: 'Job Details',
              headerTintColor: Colors.white,
              headerStyle: { backgroundColor: Colors.navy },
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="AttendanceWizard"
            component={AttendanceWizardScreen}
            options={{
              headerShown: true,
              title: 'Attendance Report',
              headerTintColor: Colors.white,
              headerStyle: { backgroundColor: Colors.navy },
              gestureEnabled: false,
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="AttendanceSummary"
            component={AttendanceSummaryScreen}
            options={{
              headerShown: true,
              title: 'Attendance Summary',
              headerTintColor: Colors.white,
              headerStyle: { backgroundColor: Colors.navy },
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="InspectionSetup"
            component={InspectionSetupScreen}
            options={{
              headerShown: true,
              title: 'Inspection',
              headerTintColor: Colors.white,
              headerStyle: { backgroundColor: Colors.navy },
            }}
          />
          <Stack.Screen
            name="RoomInspection"
            component={RoomInspectionScreen}
            options={{
              headerShown: true,
              title: 'Room Inspection',
              headerTintColor: Colors.white,
              headerStyle: { backgroundColor: Colors.navy },
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              headerShown: true,
              title: 'Notifications',
              headerTintColor: Colors.white,
              headerStyle: { backgroundColor: Colors.navy },
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              headerShown: true,
              title: 'Profile',
              headerTintColor: Colors.white,
              headerStyle: { backgroundColor: Colors.navy },
              headerBackTitle: 'Back',
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;

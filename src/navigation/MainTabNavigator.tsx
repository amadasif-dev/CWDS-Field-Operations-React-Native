import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  LayoutDashboard,
  Briefcase,
  Clock,
  Settings,
} from 'lucide-react-native';
import type { MainTabParamList } from '../types/navigation';
import { Colors, Typography } from '../theme';
import DashboardScreen from '../screens/main/DashboardScreen';
import JobsScreen from '../screens/main/JobsScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import HistoryScreen from '../screens/main/HistoryScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.blue,
        tabBarInactiveTintColor: Colors.gray500,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: {
          backgroundColor: Colors.navy,
          borderTopColor: Colors.gray100,
          borderTopWidth: 1,
          height: 60 + Math.max(insets.bottom, 8),
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Briefcase size={size} color={color} />
          ),
          headerShown: true,
          headerTintColor: Colors.white,
          headerStyle: { backgroundColor: Colors.navy },
          headerTitle: 'My Jobs',
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
          headerShown: true,
          headerTintColor: Colors.white,
          headerStyle: { backgroundColor: Colors.navy },
          headerTitle: 'History',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
          headerShown: true,
          headerTintColor: Colors.white,
          headerStyle: { backgroundColor: Colors.navy },
          headerTitle: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabLabel: {
    ...Typography.small,
    fontWeight: '600',
  },
});

export default MainTabNavigator;

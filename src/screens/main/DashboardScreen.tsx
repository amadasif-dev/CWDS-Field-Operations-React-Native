import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../theme';
import DashboardHeader from './components/DashboardHeader';
import DashboardStats from './components/DashboardStats';
import DashboardRecentJobs from './components/DashboardRecentJobs';

const DashboardScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <DashboardHeader />
        <DashboardStats />
        <DashboardRecentJobs />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
});

export default DashboardScreen;

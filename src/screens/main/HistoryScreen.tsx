import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClipboardList } from 'lucide-react-native';
import { Colors, Spacing } from '../../theme';
import { SectionHeader, EmptyState } from '../../components';

const HistoryScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <SectionHeader title="History" subtitle="Completed attendance reports" />
        <EmptyState
          icon={<ClipboardList size={48} color={Colors.gray300} />}
          title="No History Yet"
          message="Completed attendance reports will appear here."
        />
      </View>
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
    paddingTop: Spacing.sm,
  },
});

export default HistoryScreen;

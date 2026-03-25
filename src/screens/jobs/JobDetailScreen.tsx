import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../theme';
import type { RootStackScreenProps } from '../../types/navigation';
import JobDetailContent from './components/JobDetailContent';

type Props = RootStackScreenProps<'JobDetail'>;

const JobDetailScreen: React.FC<Props> = ({ route }) => {
  const { jobId } = route.params;

  return (
    <View style={styles.container}>
      <JobDetailContent jobId={jobId} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
});

export default JobDetailScreen;

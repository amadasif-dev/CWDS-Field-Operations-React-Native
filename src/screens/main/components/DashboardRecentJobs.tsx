import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SectionHeader, EmptyState } from '../../../components';
import { Colors, Spacing } from '../../../theme';
import JobListItem from '../../jobs/components/JobListItem';
import type { Job } from '../../../types/models';

const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'HVAC Inspection — Building A',
    description: 'Annual HVAC inspection and maintenance',
    status: 'assigned',
    priority: 'high',
    clientName: 'Acme Corp',
    clientPhone: '555-0101',
    address: '123 Main St, Suite 100',
    scheduledDate: '2025-03-26',
    scheduledTime: '09:00',
    estimatedDuration: 120,
    assignedTo: 'tech_1',
    createdAt: '2025-03-20T08:00:00Z',
    updatedAt: '2025-03-20T08:00:00Z',
  },
  {
    id: '2',
    title: 'Electrical Panel Check',
    description: 'Quarterly electrical panel inspection',
    status: 'in_progress',
    priority: 'medium',
    clientName: 'Tech Solutions',
    clientPhone: '555-0102',
    address: '456 Oak Ave, Floor 2',
    scheduledDate: '2025-03-26',
    scheduledTime: '13:00',
    estimatedDuration: 90,
    assignedTo: 'tech_1',
    createdAt: '2025-03-21T10:00:00Z',
    updatedAt: '2025-03-21T10:00:00Z',
  },
  {
    id: '3',
    title: 'Fire Safety Audit',
    description: 'Complete fire safety compliance audit',
    status: 'pending',
    priority: 'urgent',
    clientName: 'City Mall',
    clientPhone: '555-0103',
    address: '789 Center Blvd',
    scheduledDate: '2025-03-27',
    scheduledTime: '10:00',
    estimatedDuration: 180,
    assignedTo: 'tech_1',
    createdAt: '2025-03-22T09:00:00Z',
    updatedAt: '2025-03-22T09:00:00Z',
  },
];

const DashboardRecentJobs: React.FC = () => {
  const navigation = useNavigation();

  const handleJobPress = useCallback(
    (jobId: string) => {
      navigation.navigate('JobDetail', { jobId });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Job }) => (
      <JobListItem job={item} onPress={() => handleJobPress(item.id)} />
    ),
    [handleJobPress],
  );

  const keyExtractor = useCallback((item: Job) => item.id, []);

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Recent Jobs"
        actionLabel="View All"
        onAction={() => {}}
      />
      <FlatList
        data={MOCK_JOBS}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState title="No Jobs" message="No jobs assigned yet." />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
});

export default React.memo(DashboardRecentJobs);

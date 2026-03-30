import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Search } from 'lucide-react-native';
import { Colors, Spacing } from '../../theme';
import { AppInput, EmptyState, SectionHeader } from '../../components';
import JobListItem from '../jobs/components/JobListItem';
import type { Job } from '../../types/models';
import JobFilterBar from '../jobs/components/JobFilterBar';

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
  {
    id: '4',
    title: 'Water Tank Maintenance',
    description: 'Monthly water tank cleaning and inspection',
    status: 'completed',
    priority: 'low',
    clientName: 'Green Valley Apts',
    clientPhone: '555-0104',
    address: '321 Valley Rd',
    scheduledDate: '2025-03-25',
    scheduledTime: '08:00',
    estimatedDuration: 60,
    assignedTo: 'tech_1',
    createdAt: '2025-03-19T07:00:00Z',
    updatedAt: '2025-03-25T10:00:00Z',
  },
];

const JobsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredJobs = MOCK_JOBS.filter(job => {
    const matchesSearch =
      search === '' ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'all' || job.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <SectionHeader title="Jobs" subtitle="All scheduled maintenance jobs" />
        <View style={styles.searchWrapper}>
          <AppInput
            placeholder="Search jobs..."
            value={search}
            onChangeText={setSearch}
            leftIcon={<Search size={18} color={Colors.gray500} />}
            containerStyle={styles.searchInput}
          />
        </View>
        <View>
          <JobFilterBar
            active={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </View>
        <FlatList
          data={filteredJobs}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title="No Jobs Found"
              message="Try adjusting your search or filter."
            />
          }
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
  },
  searchWrapper: {
    paddingHorizontal: Spacing.lg,
  },
  searchInput: {
    marginBottom: Spacing.sm,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.sm,
  },
});

export default JobsScreen;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin, Clock, ChevronRight } from 'lucide-react-native';
import { AppCard } from '../../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';
import { capitalize, getStatusColor, getPriorityColor, formatDate } from '../../../utils';
import type { Job } from '../../../types/models';

interface JobListItemProps {
  job: Job;
  onPress: () => void;
}

const JobListItem: React.FC<JobListItemProps> = ({ job, onPress }) => {
  const statusColor = getStatusColor(job.status);
  const priorityColor = getPriorityColor(job.priority);

  return (
    <AppCard onPress={onPress} style={styles.card} variant="elevated">
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {job.title}
          </Text>
          <ChevronRight size={18} color={Colors.gray500} />
        </View>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: `${statusColor}15` }]}>
            <View style={[styles.dot, { backgroundColor: statusColor }]} />
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {capitalize(job.status)}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: `${priorityColor}15` }]}>
            <Text style={[styles.badgeText, { color: priorityColor }]}>
              {capitalize(job.priority)}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.client}>{job.clientName}</Text>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <MapPin size={14} color={Colors.gray500} />
          <Text style={styles.metaText} numberOfLines={1}>
            {job.address}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Clock size={14} color={Colors.gray500} />
          <Text style={styles.metaText}>
            {formatDate(job.scheduledDate)} · {job.scheduledTime}
          </Text>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...Typography.bodyBold,
    color: Colors.navy,
    flex: 1,
    marginRight: Spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    ...Typography.small,
    fontWeight: '600',
  },
  client: {
    ...Typography.caption,
    color: Colors.gray700,
    marginBottom: Spacing.sm,
  },
  meta: {
    gap: Spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.gray500,
    flex: 1,
  },
});

export default React.memo(JobListItem);

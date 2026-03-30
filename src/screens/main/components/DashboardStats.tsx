import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Briefcase, CheckCircle, Clock, AlertTriangle } from 'lucide-react-native';
import { AppCard } from '../../../components';
import { Colors, Typography, Spacing } from '../../../theme';

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, color }) => (
  <AppCard style={styles.statCard} variant="elevated" padding="md">
    <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
      {icon}
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </AppCard>
);

const DashboardStats: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatItem
          icon={<Briefcase size={20} color={Colors.blue} />}
          label="Assigned"
          value="5"
          color={Colors.blue}
        />
        <StatItem
          icon={<Clock size={20} color={Colors.gold} />}
          label="In Progress"
          value="2"
          color={Colors.gold}
        />
      </View>
      <View style={styles.row}>
        <StatItem
          icon={<CheckCircle size={20} color={Colors.green} />}
          label="Completed"
          value="12"
          color={Colors.green}
        />
        <StatItem
          icon={<AlertTriangle size={20} color={Colors.red} />}
          label="Urgent"
          value="1"
          color={Colors.red}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    marginTop: -Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.h2,
    color: Colors.navy,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.gray500,
    marginTop: Spacing.xxs,
  },
});

export default React.memo(DashboardStats);

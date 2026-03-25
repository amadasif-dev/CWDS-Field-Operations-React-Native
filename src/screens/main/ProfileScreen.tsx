import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User, Mail, Phone, Shield } from 'lucide-react-native';
import { useAppSelector } from '../../store';
import { AppCard } from '../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { capitalize } from '../../utils';

const ProfileScreen: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <View style={styles.container}>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <User size={40} color={Colors.white} />
        </View>
        <Text style={styles.name}>{user?.name ?? 'Technician'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {capitalize(user?.role ?? 'technician')}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <AppCard variant="outlined" padding="lg">
          <View style={styles.detailRow}>
            <Mail size={18} color={Colors.blue} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{user?.email ?? '—'}</Text>
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Phone size={18} color={Colors.blue} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{user?.phone ?? '—'}</Text>
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Shield size={18} color={Colors.blue} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Role</Text>
              <Text style={styles.detailValue}>
                {capitalize(user?.role ?? 'technician')}
              </Text>
            </View>
          </View>
        </AppCard>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    backgroundColor: Colors.white,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  name: {
    ...Typography.h2,
    color: Colors.navy,
  },
  roleBadge: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  roleText: {
    ...Typography.captionBold,
    color: Colors.blue,
  },
  details: {
    padding: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...Typography.caption,
    color: Colors.gray500,
  },
  detailValue: {
    ...Typography.body,
    color: Colors.navy,
    marginTop: Spacing.xxs,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.gray100,
  },
});

export default ProfileScreen;

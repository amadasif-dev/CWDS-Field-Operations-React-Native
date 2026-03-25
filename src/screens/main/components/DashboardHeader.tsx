import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../../store';
import { Colors, Typography, Spacing } from '../../../theme';

const DashboardHeader: React.FC = () => {
  const navigation = useNavigation();
  const user = useAppSelector((state) => state.auth.user);
  const unread = useAppSelector((state) => state.app.unreadNotifications);

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <User size={24} color={Colors.white} />
        </View>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name ?? 'Technician'}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.bellWrapper}
        onPress={() => navigation.navigate('Notifications')}
        activeOpacity={0.7}>
        <Bell size={24} color={Colors.white} />
        {unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unread > 9 ? '9+' : unread}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.navy,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  greeting: {
    ...Typography.caption,
    color: Colors.gray300,
  },
  name: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
  bellWrapper: {
    position: 'relative',
    padding: Spacing.sm,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.red,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...Typography.small,
    color: Colors.white,
    fontWeight: '700',
    fontSize: 10,
  },
});

export default React.memo(DashboardHeader);

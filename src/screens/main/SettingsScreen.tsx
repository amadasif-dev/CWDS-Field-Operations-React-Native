import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { AppCard, SectionHeader, AppToggle } from '../../components';
import { Colors, Typography, Spacing } from '../../theme';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  showArrow?: boolean;
  danger?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  label,
  onPress,
  showArrow = true,
  danger = false,
}) => (
  <AppCard onPress={onPress} style={styles.row} variant="outlined" padding="lg">
    <View style={styles.rowLeft}>
      {icon}
      <Text style={[styles.rowLabel, danger && styles.dangerText]}>{label}</Text>
    </View>
    {showArrow && <ChevronRight size={18} color={Colors.gray500} />}
  </AppCard>
);

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [pushEnabled, setPushEnabled] = React.useState(true);

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => dispatch(logout()),
      },
    ]);
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Settings" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingsRow
            icon={<User size={20} color={Colors.blue} />}
            label="Profile"
            onPress={() => navigation.navigate('Profile')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <AppCard style={styles.toggleRow} variant="outlined" padding="lg">
            <AppToggle
              label="Push Notifications"
              value={pushEnabled}
              onValueChange={setPushEnabled}
            />
          </AppCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingsRow
            icon={<HelpCircle size={20} color={Colors.gray700} />}
            label="Help & FAQ"
            onPress={() => {}}
          />
          <SettingsRow
            icon={<Shield size={20} color={Colors.gray700} />}
            label="Privacy Policy"
            onPress={() => {}}
          />
        </View>

        <View style={styles.section}>
          <SettingsRow
            icon={<LogOut size={20} color={Colors.red} />}
            label="Logout"
            onPress={handleLogout}
            showArrow={false}
            danger
          />
        </View>

        <Text style={styles.version}>CWDS Field v1.0.0</Text>
      </ScrollView>
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
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.captionBold,
    color: Colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rowLabel: {
    ...Typography.body,
    color: Colors.navy,
  },
  dangerText: {
    color: Colors.red,
  },
  toggleRow: {
    marginBottom: 0,
  },
  version: {
    ...Typography.caption,
    color: Colors.gray500,
    textAlign: 'center',
    paddingVertical: Spacing.xxl,
  },
});

export default SettingsScreen;

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BellOff } from 'lucide-react-native';
import { Colors, Spacing } from '../../theme';
import { EmptyState } from '../../components';

const NotificationsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <EmptyState
        icon={<BellOff size={48} color={Colors.gray300} />}
        title="No Notifications"
        message="You're all caught up! New notifications will appear here."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    padding: Spacing.lg,
  },
});

export default NotificationsScreen;

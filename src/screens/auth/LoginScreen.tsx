import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../theme';
import LoginHeader from './components/LoginHeader';
import LoginForm from './components/LoginForm';

const LoginScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <LoginHeader />
      <LoginForm />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
});

export default LoginScreen;

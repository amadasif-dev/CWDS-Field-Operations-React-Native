import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Mail, Lock } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { login, clearError } from '../../../store/slices/authSlice';
import { AppButton, AppInput, BottomSheetAlert } from '../../../components';
import { Colors, Typography, Spacing } from '../../../theme';
import { validateEmail, validateRequired } from '../../../utils/validation';

const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);
  const [errorVisible, setErrorVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validate = useCallback((): boolean => {
    let valid = true;

    if (!validateRequired(email)) {
      setEmailError('Email is required');
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Enter a valid email');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!validateRequired(password)) {
      setPasswordError('Password is required');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  }, [email, password]);

  const handleLogin = useCallback(async () => {
    if (error) {
      dispatch(clearError());
    }

    if (!validate()) {
      return;
    }

    try {
      await dispatch(login({ email: email.trim(), password })).unwrap();
    } catch (err) {
      Alert.alert(
        'Login Failed',
        typeof err === 'string' ? err : 'Please try again.',
      );
    }
  }, [dispatch, email, password, error, validate]);

  return (
    <View style={styles.container}>
      <AppInput
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        error={emailError}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        leftIcon={<Mail size={20} color={Colors.gray500} />}
        required
      />

      <AppInput
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        error={passwordError}
        secureTextEntry
        leftIcon={<Lock size={20} color={Colors.gray500} />}
        required
      />

      {error && <Text style={styles.apiError}>{error}</Text>}

      <AppButton
        title="Sign In"
        onPress={handleLogin}
        loading={isLoading}
        fullWidth
        style={styles.button}
      />
      <BottomSheetAlert
        visible={errorVisible}
        type="error"
        title="Something went wrong"
        message="Unable to submit the inspection. Please try again."
        primaryLabel="Try Again"
        onClose={() => setErrorVisible(false)}
        // onPrimaryPress={() => retrySubmission()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  apiError: {
    ...Typography.caption,
    color: Colors.red,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  button: {
    marginTop: Spacing.sm,
  },
});

export default React.memo(LoginForm);

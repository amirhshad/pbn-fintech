import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { login, clearError } from '../../store/authSlice';
import { COLORS, APP_NAME } from '../../constants';

export const LoginScreen = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [phoneNumber, setPhoneNumber] = useState('+31');

  const handleLogin = async () => {
    // Validate phone number
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number');
      return;
    }

    // Dispatch login action
    const result = await dispatch(login({ phoneNumber }));

    if (login.fulfilled.match(result)) {
      Alert.alert('Success', 'SMS verification code sent!');
      // Navigation to verification screen will be handled by navigation
    } else if (login.rejected.match(result)) {
      Alert.alert('Error', result.payload as string || 'Login failed');
    }
  };

  React.useEffect(() => {
    // Clear error on mount
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        {/* Logo/Title */}
        <View style={styles.header}>
          <Text style={styles.logo}>{APP_NAME}</Text>
          <Text style={styles.subtitle}>P2P Cash Exchange</Text>
          <Text style={styles.description}>
            Connect with people nearby to exchange cash safely
          </Text>
        </View>

        {/* Phone Input */}
        <View style={styles.form}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+31 6 12345678"
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoComplete="tel"
            editable={!isLoading}
          />

          {error && (
            <Text style={styles.error}>{error}</Text>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>

          {/* Info */}
          <Text style={styles.info}>
            You'll receive an SMS with a verification code
          </Text>
        </View>

        {/* Test Users Info (Development Only) */}
        {__DEV__ && (
          <View style={styles.devInfo}>
            <Text style={styles.devTitle}>Test Users:</Text>
            <Text style={styles.devText}>+31612345001 (Alice)</Text>
            <Text style={styles.devText}>+31612345002 (Bob)</Text>
            <Text style={styles.devText}>+31612345003 (Charlie)</Text>
            <Text style={styles.devText}>+31612345004 (Diana)</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: COLORS.background,
    color: COLORS.text,
  },
  error: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 8,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 16,
  },
  devInfo: {
    marginTop: 32,
    padding: 16,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
  },
  devTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  devText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/providers/auth-provider';
import { getErrorMessage } from '@/utils/errors';

type AuthScreenProps = {
  mode: 'login' | 'register';
};

export function AuthScreen({ mode }: AuthScreenProps) {
  const isRegister = mode === 'register';
  const { signIn, register, error: authError, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    clearError();
    setError(null);

    if (isRegister && !name.trim()) {
      setError('Nama wajib diisi.');
      return;
    }
    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }
    if (isRegister && password !== confirmPassword) {
      setError('Konfirmasi password tidak sama.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <Ionicons name="document-text" size={18} color="#315FEA" />
            </View>
            <Text style={styles.brandName}>DAILY NOTES</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.heroIcon}>
              <Ionicons name="document-text" size={30} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>
              {isRegister ? 'Buat akun' : 'Selamat datang kembali'}
            </Text>
            <Text style={styles.subtitle}>
              {isRegister
                ? 'Daftar untuk mulai menyimpan catatan harianmu.'
                : 'Masuk untuk melanjutkan ke catatan harianmu.'}
            </Text>

            {isRegister ? (
              <TextInput
                accessibilityLabel="Nama"
                autoCapitalize="words"
                onChangeText={setName}
                placeholder="Nama"
                placeholderTextColor="#94A3B8"
                returnKeyType="next"
                style={styles.input}
                value={name}
              />
            ) : null}
            <TextInput
              accessibilityLabel="Email"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#94A3B8"
              returnKeyType="next"
              style={styles.input}
              textContentType="emailAddress"
              value={email}
            />
            <TextInput
              accessibilityLabel="Password"
              autoCapitalize="none"
              onChangeText={setPassword}
              placeholder="Password (minimal 8 karakter)"
              placeholderTextColor="#94A3B8"
              returnKeyType={isRegister ? 'next' : 'done'}
              secureTextEntry
              style={styles.input}
              textContentType={isRegister ? 'newPassword' : 'password'}
              value={password}
            />
            {isRegister ? (
              <TextInput
                accessibilityLabel="Konfirmasi password"
                autoCapitalize="none"
                onChangeText={setConfirmPassword}
                onSubmitEditing={handleSubmit}
                placeholder="Konfirmasi password"
                placeholderTextColor="#94A3B8"
                returnKeyType="done"
                secureTextEntry
                style={styles.input}
                textContentType="newPassword"
                value={confirmPassword}
              />
            ) : null}

            {error || authError ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {error ?? authError}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.pressed,
                isSubmitting && styles.disabled,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>
                  {isRegister ? 'Daftar' : 'Masuk'}
                </Text>
              )}
            </Pressable>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>
                {isRegister ? 'Sudah punya akun? ' : 'Belum punya akun? '}
              </Text>
              <Pressable
                accessibilityRole="link"
                onPress={() => router.replace(isRegister ? '/login' : '/register')}
              >
                <Text style={styles.switchAction}>
                  {isRegister ? 'Masuk' : 'Daftar'}
                </Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.footer}>
            Catatanmu tersimpan dengan aman di Daily Notes.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboard: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF1FF',
  },
  brandName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#24324A',
    letterSpacing: 0.6,
  },
  form: { width: '100%', maxWidth: 420, alignSelf: 'center', paddingVertical: 28 },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#315FEA',
    marginBottom: 18,
  },
  title: { fontSize: 25, fontWeight: '700', color: '#111827' },
  subtitle: {
    marginTop: 7,
    marginBottom: 24,
    color: '#596579',
    fontSize: 14,
    lineHeight: 21,
  },
  input: {
    minHeight: 50,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E5ED',
    borderRadius: 11,
    paddingHorizontal: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    fontSize: 14,
  },
  error: {
    marginBottom: 12,
    color: '#B42318',
    fontSize: 13,
    lineHeight: 19,
  },
  submitButton: {
    minHeight: 50,
    marginTop: 4,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#315FEA',
  },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.6 },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  switchText: { color: '#596579', fontSize: 13 },
  switchAction: { color: '#315FEA', fontSize: 13, fontWeight: '700' },
  footer: { color: '#64748B', textAlign: 'center', fontSize: 11, lineHeight: 17 },
});

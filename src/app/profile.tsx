import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/providers/auth-provider';
import { getErrorMessage } from '@/utils/errors';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (cause) {
      Alert.alert('Gagal keluar', getErrorMessage(cause));
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <View style={styles.content}>
        <Pressable
          accessibilityRole="button"
          disabled={isSigningOut}
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.pressed,
            isSigningOut && styles.disabled,
          ]}
        >
          {isSigningOut ? (
            <ActivityIndicator color="#B42318" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#B42318" />
              <Text style={styles.signOutText}>Keluar</Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  signOutButton: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    backgroundColor: '#FFF7F7',
  },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.6 },
  signOutText: { color: '#B42318', fontSize: 15, fontWeight: '700' },
});

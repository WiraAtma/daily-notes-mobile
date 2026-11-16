import { DarkTheme, DefaultTheme, router, Stack, ThemeProvider, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/providers/auth-provider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay />
          <AppNavigator />
        </ThemeProvider>
      </AuthProvider>
    </KeyboardProvider>
  );
}

function AppNavigator() {
  const { accessToken, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const isAuthRoute = segments[0] === 'login' || segments[0] === 'register';
    const currentSegmentPath = segments.join('/');
    const isEntryRoute = !currentSegmentPath || currentSegmentPath === 'index';
    if (!accessToken && !isAuthRoute) router.replace('/login');
    if (accessToken && (isAuthRoute || isEntryRoute)) {
      router.replace('/(tabs)/home');
    }
  }, [accessToken, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#315FEA" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="home/create" />
      <Stack.Screen name="home/[id]" />
      <Stack.Screen name="profile" options={{ headerShown: true, title: 'Profil' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
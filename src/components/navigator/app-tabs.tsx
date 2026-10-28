import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: '#23262c',
        tabBarActiveTintColor: '#3174e7',
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Catatan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="document-text-outline"
              size={size}
              color={color?.toString() ?? '#23262c'}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="search/index"
        options={{
          title: 'Cari',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="search-outline"
              size={size}
              color={color?.toString() ?? '#23262c'}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'Pengaturan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="settings-outline"
              size={size}
              color={color?.toString() ?? '#23262c'}
            />
          ),
        }}
      />
    </Tabs>
  );
}

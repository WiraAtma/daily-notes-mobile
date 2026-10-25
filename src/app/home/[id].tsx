
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Pressable
        onPress={() => router.back()}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginBottom: 24,
        }}
      >
        <Ionicons name="arrow-back" size={24} color="#23262c" />
        <Text style={{ fontSize: 16 }}>Back</Text>
      </Pressable>

      <Stack.Screen options={{ headerShown: false }} />

      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        Detail Home
      </Text>

      <Text style={{ fontSize: 16, marginTop: 8 }}>
        Home ID: {id}
      </Text>
    </View>
  );
}

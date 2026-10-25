import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { router } from 'expo-router';
export default function HomeScreen() {
  const notes = [
    { id: '1', title: 'Catatan pertama' },
    { id: '2', title: 'Catatan kedua' },
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Home</Text>

        <View>
          {notes.map((note) => (
            <Pressable
              key={note.id}
              onPress={() =>
                router.push({
                  pathname: '/home/[id]',
                  params: { id: note.id },
                })
              }
            >
              <Text>{note.title}</Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  title: {
    textAlign: 'center',
  },
});

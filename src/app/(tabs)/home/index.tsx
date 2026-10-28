import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateSummary } from '@/components/feature/home/date-summary';
import { FabButton } from '@/components/feature/home/fab-button';
import { FilterChips } from '@/components/feature/home/filter-chips';
import { HomeHeader } from '@/components/feature/home/home-header';
import { HomeColors } from '@/components/feature/home/home-theme';
import { NoteCard } from '@/components/feature/home/note-card';
import { Filter, NOTES } from '@/components/feature/home/notes-data';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const [filter, setFilter] = useState<Filter>('Semua');

  const notes = useMemo(
    () => (filter === 'Semua' ? NOTES : NOTES.filter((n) => n.category === filter)),
    [filter],
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <HomeHeader />
          <DateSummary dateLabel="RABU, 24 OKTOBER" />
          <FilterChips selected={filter} onSelect={setFilter} />

          <View style={styles.list}>
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onPress={() =>
                  router.push({
                    pathname: '/home/[id]',
                    params: { id: note.id },
                  })
                }
              />
            ))}
          </View>
        </ScrollView>

        <FabButton onPress={() => {}} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: HomeColors.background,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + 96,
  },
  list: { gap: 14 },
});
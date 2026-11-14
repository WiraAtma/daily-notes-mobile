import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FabButton } from '@/components/feature/home/fab-button';
import { HomeHeader } from '@/components/feature/home/home-header';
import { HomeColors } from '@/components/feature/home/home-theme';
import { NoteCard } from '@/components/feature/home/note-card';
import { useNotes } from '@/hooks/use-notes';
import { useAuth } from '@/providers/auth-provider';
import { deleteNote, getFirstImageUrl, htmlToPlainText } from '@/services/notes';
import { getErrorMessage } from '@/utils/errors';
import type { Note } from '@/components/feature/home/notes-data';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const { notes, isLoading, error, refresh } = useNotes();
  const { accessToken } = useAuth();
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);

  const handleDeleteNote = (id: string, title: string) => {
    Alert.alert(
      'Hapus catatan?',
      `Catatan "${title}" akan dihapus permanen.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => void confirmDeleteNote(Number(id)),
        },
      ],
    );
  };

  const confirmDeleteNote = async (id: number) => {
    if (!accessToken) {
      Alert.alert('Tidak dapat menghapus', 'Sesi login tidak ditemukan. Silakan masuk kembali.');
      return;
    }

    setDeletingNoteId(id);
    try {
      await deleteNote(accessToken, id);
      refresh();
    } catch (cause) {
      Alert.alert('Gagal menghapus catatan', getErrorMessage(cause));
    } finally {
      setDeletingNoteId(null);
    }
  };

  const cards: Note[] = notes.map((note) => ({
    id: String(note.id),
    title: note.title,
    excerpt: htmlToPlainText(note.content) || 'Belum ada isi catatan.',
    date: new Date(note.updated_at).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    category: 'Pribadi',
    image: getFirstImageUrl(note.content),
  }));
  const todayLabel = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).toUpperCase();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <HomeHeader onProfilePress={() => router.push('/profile')} />
          <Text style={styles.dateLabel}>{todayLabel}</Text>

          <View style={styles.list}>
            {cards.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onPress={() =>
                  router.push({
                    pathname: '/home/[id]',
                    params: { id: note.id },
                  })
                }
                onDelete={() => handleDeleteNote(note.id, note.title)}
                isDeleting={deletingNoteId === Number(note.id)}
              />
            ))}
          </View>

          {isLoading ? (
            <ActivityIndicator style={styles.status} color={HomeColors.primary} />
          ) : null}
          {error ? (
            <View style={styles.status}>
              <Text style={styles.statusText}>{error}</Text>
              <Pressable onPress={refresh} hitSlop={8}>
                <Text style={styles.retry}>Coba lagi</Text>
              </Pressable>
            </View>
          ) : null}
          {!isLoading && !error && cards.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Belum ada catatan</Text>
              <Text style={styles.emptyText}>Buat catatan pertamamu sekarang.</Text>
            </View>
          ) : null}
        </ScrollView>

        <FabButton
          onPress={() => router.push('/home/create')}
        />
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
  dateLabel: {
    marginTop: 4,
    marginBottom: 16,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: HomeColors.textMuted,
  },
  status: { alignItems: 'center', marginTop: 28, gap: 8 },
  statusText: { color: HomeColors.textMuted, textAlign: 'center', fontSize: 13 },
  retry: { color: HomeColors.primary, fontWeight: '700', fontSize: 13 },
  empty: { alignItems: 'center', marginTop: 80, gap: 6 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: HomeColors.textTitle },
  emptyText: { fontSize: 13, color: HomeColors.textMuted },
});
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NOTES } from '../../components/feature/home/notes-data';

const COLORS = {
  bg: '#FFFFFF',
  text: '#1B1E25',
  muted: '#6B7280',
  border: '#E5E7EB',
  primary: '#4361EE',
  primarySoft: '#EEF1FF',
  primaryBorder: '#D9DFFF',
  danger: '#E5484D',
};

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [pinned, setPinned] = useState(false);

  const note = NOTES.find((n) => n.id === id);

  if (!note) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
        </View>
        <View style={styles.empty}>
          <Ionicons name="document-outline" size={48} color={COLORS.muted} />
          <Text style={styles.emptyTitle}>Catatan tidak ditemukan</Text>
          <Text style={styles.emptyDesc}>
            Catatan dengan ID {id} mungkin sudah dihapus.
          </Text>
        </View>
      </View>
    );
  }

  const detail = note.detail;
  const folder = detail?.folder ?? note.category;
  const body = detail?.content ?? note.excerpt;
  const wordCount = [body, ...(detail?.keyPoints ?? [])]
    .join(' ')
    .split(/\s+/).length;
  const readMinutes = detail?.readMinutes ?? Math.max(1, Math.ceil(wordCount / 200));
  const dateLabel = detail?.time ? `${note.date}, ${detail.time}` : note.date;
  const tags = detail?.tags ?? [note.category];

  const handleShare = async () => {
    const points = detail?.keyPoints?.map((p, i) => `${i + 1}. ${p}`).join('\n');
    const message = [note.title, '', body, points ? `\n${points}` : '']
      .join('\n')
      .trim();
    try {
      await Share.share({ title: note.title, message });
    } catch {
      Alert.alert('Gagal membagikan', 'Coba lagi beberapa saat lagi.');
    }
  };

  const handleDelete = () => {
    Alert.alert('Hapus catatan?', `"${note.title}" akan dihapus permanen.`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          // TODO: hapus dari state/AsyncStorage kamu di sini
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>

        <View style={styles.folderChip}>
          <Ionicons name="folder-outline" size={14} color={COLORS.primary} />
          <Text style={styles.folderText}>{folder}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={handleShare} hitSlop={8}>
            <Ionicons name="share-social-outline" size={22} color={COLORS.text} />
          </Pressable>
          <Pressable onPress={() => setPinned((p) => !p)} hitSlop={8}>
            <Ionicons
              name={pinned ? 'pin' : 'pin-outline'}
              size={22}
              color={pinned ? COLORS.primary : COLORS.text}
            />
          </Pressable>
          <Pressable onPress={handleDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={22} color={COLORS.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{note.title}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.muted} />
            <Text style={styles.metaText}>{dateLabel}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.muted} />
            <Text style={styles.metaText}>{readMinutes} menit baca</Text>
          </View>
        </View>

        {note.image && (
          <View style={styles.imageWrap}>
            <Image source={{ uri: note.image }} style={styles.image} />
            <View style={styles.caption}>
              <Ionicons name="image-outline" size={12} color="#fff" />
              <Text style={styles.captionText}>
                {detail?.imageCaption ?? 'Lampiran Gambar'}
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.body}>{body}</Text>

        {detail?.keyPoints && detail.keyPoints.length > 0 && (
          <View style={styles.pointsCard}>
            <View style={styles.pointsHeader}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={COLORS.primary}
              />
              <Text style={styles.pointsTitle}>
                {detail.keyPointsTitle ?? 'Poin-poin penting:'}
              </Text>
            </View>
            {detail.keyPoints.map((point, index) => (
              <View key={index} style={styles.pointRow}>
                <Text style={styles.pointNumber}>{index + 1}.</Text>
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>
        )}

        {detail?.reminder && <Text style={styles.reminder}>{detail.reminder}</Text>}

        <View style={styles.tags}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name="share-outline" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Bagikan Catatan Ini</Text>
        </Pressable>

        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.muted} />
          <Text style={styles.ghostBtnText}>Hapus Catatan</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
  },
  folderText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 16 },

  content: { paddingHorizontal: 20, paddingTop: 20 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 34,
  },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 10, marginBottom: 18 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: COLORS.muted },

  imageWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 18,
    backgroundColor: COLORS.border,
  },
  image: { width: '100%', height: 190 },
  caption: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  captionText: { fontSize: 11, color: '#fff' },

  body: { fontSize: 15, lineHeight: 24, color: COLORS.text, marginBottom: 18 },

  pointsCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: 16,
    gap: 10,
  },
  pointsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pointsTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  pointRow: { flexDirection: 'row', gap: 8 },
  pointNumber: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
  pointText: { flex: 1, fontSize: 14, lineHeight: 21, color: COLORS.text },

  reminder: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.primary,
    marginBottom: 18,
  },

  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.primarySoft,
  },
  tagText: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
  },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    marginTop: 8,
  },
  ghostBtnText: { fontSize: 14, color: COLORS.muted },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptyDesc: { fontSize: 14, color: COLORS.muted, textAlign: 'center' },
});
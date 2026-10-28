import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { NoteBadge } from './note-badge';
import { HomeColors } from './home-theme';
import { Note } from './notes-data';

type Props = { note: Note; onPress?: () => void };

export function NoteCard({ note, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={2}>
          {note.title}
        </Text>
        {note.badge && <NoteBadge label={note.badge.label} icon={note.badge.icon} />}
      </View>

      <Text style={styles.excerpt} numberOfLines={2}>
        {note.excerpt}
      </Text>

      {note.image && <Image source={{ uri: note.image }} style={styles.image} />}

      <View style={styles.footer}>
        <Text style={styles.date}>{note.date}</Text>

        {note.footerMeta && (
          <View style={styles.meta}>
            <Ionicons
              name={note.footerMeta.icon}
              size={15}
              color={note.footerMeta.icon === 'attach' ? HomeColors.primary : HomeColors.textMuted}
            />
            {note.footerMeta.label && (
              <Text style={styles.metaText}>{note.footerMeta.label}</Text>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: HomeColors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: HomeColors.border,
    padding: 16,
    gap: 8,
  },
  pressed: { opacity: 0.85 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: HomeColors.textTitle },
  excerpt: { fontSize: 13, lineHeight: 19, color: HomeColors.textBody },
  image: {
    width: '100%',
    height: 130,
    borderRadius: 10,
    marginTop: 4,
    backgroundColor: HomeColors.border,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  date: { fontSize: 11, color: HomeColors.textMuted },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: HomeColors.textMuted },
});
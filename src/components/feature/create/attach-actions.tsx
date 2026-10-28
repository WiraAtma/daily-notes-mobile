import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HomeColors } from '@/components/feature/home/home-theme';

export function AttachActions() {
  return (
    <View style={styles.row}>
      <Pressable style={styles.pill}>
        <Ionicons name="image-outline" size={16} color={HomeColors.primary} />
        <Text style={styles.pillText}>Pilih Foto dari Galeri</Text>
      </Pressable>

      <Pressable style={styles.iconBtn}>
        <Ionicons name="checkbox-outline" size={18} color={HomeColors.textBody} />
      </Pressable>

      <Pressable style={styles.iconBtn}>
        <Ionicons name="pencil-outline" size={18} color={HomeColors.textBody} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: HomeColors.primary,
    backgroundColor: HomeColors.primarySoft,
  },
  pillText: { fontSize: 13, fontWeight: '600', color: HomeColors.primary },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: HomeColors.border,
    backgroundColor: HomeColors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HomeColors } from '@/components/feature/home/home-theme';

type Props = { onBack?: () => void; onSave?: () => void };

export function CreateHeader({ onBack, onSave }: Props) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack} style={styles.back} hitSlop={8}>
        <Ionicons name="chevron-back" size={20} color={HomeColors.textTitle} />
        <Text style={styles.backText}>Kembali</Text>
      </Pressable>

      <Text style={styles.title}>Catatan Baru</Text>

      <Pressable onPress={onSave} style={styles.save}>
        <Text style={styles.saveText}>Simpan</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: { flexDirection: 'row', alignItems: 'center', minWidth: 80 },
  backText: { fontSize: 14, color: HomeColors.textTitle },
  title: { fontSize: 16, fontWeight: '700', color: HomeColors.textTitle },
  save: {
    backgroundColor: HomeColors.fab,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    minWidth: 80,
    alignItems: 'center',
  },
  saveText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { HomeColors } from '@/components/feature/home/home-theme';

type Props = { createdAt: string; status: string };

export function MetaRow({ createdAt, status }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.item}>
        <Ionicons name="calendar-outline" size={14} color={HomeColors.textMuted} />
        <Text style={styles.text}>Dibuat: {createdAt}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  text: { fontSize: 12, color: HomeColors.textMuted },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
});
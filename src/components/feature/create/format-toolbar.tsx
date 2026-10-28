import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HomeColors } from '@/components/feature/home/home-theme';

type Props = { words: number; chars: number };

export function FormatToolbar({ words, chars }: Props) {
  return (
    <View style={styles.bar}>
      <View style={styles.tools}>
        <Pressable hitSlop={8}>
          <Ionicons name="checkbox-outline" size={20} color={HomeColors.textBody} />
        </Pressable>
        <Pressable hitSlop={8}>
          <Text style={[styles.letter, { fontWeight: '800' }]}>B</Text>
        </Pressable>
        <Pressable hitSlop={8}>
          <Text style={[styles.letter, { fontStyle: 'italic' }]}>I</Text>
        </Pressable>
        <Pressable hitSlop={8}>
          <Ionicons name="list" size={22} color={HomeColors.textBody} />
        </Pressable>
      </View>

      <Text style={styles.count}>
        {words} kata | {chars} karakter
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: HomeColors.border,
    backgroundColor: HomeColors.card,
  },
  tools: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  letter: { fontSize: 17, color: HomeColors.textBody },
  count: { fontSize: 11, color: HomeColors.textMuted },
});
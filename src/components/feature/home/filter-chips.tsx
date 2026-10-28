import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { FILTERS, Filter } from './notes-data';
import { HomeColors } from './home-theme';

type Props = { selected: Filter; onSelect: (f: Filter) => void };

export function FilterChips({ selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {FILTERS.map((f) => {
        const active = f === selected;
        return (
          <Pressable
            key={f}
            onPress={() => onSelect(f)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.text, active && styles.textActive]}>{f}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, marginBottom: 14 },
  container: { gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: HomeColors.card,
    borderWidth: 1,
    borderColor: HomeColors.border,
  },
  chipActive: { backgroundColor: HomeColors.primarySoft, borderColor: HomeColors.primarySoft },
  text: { fontSize: 13, fontWeight: '500', color: HomeColors.textBody },
  textActive: { color: HomeColors.primary, fontWeight: '700' },
});
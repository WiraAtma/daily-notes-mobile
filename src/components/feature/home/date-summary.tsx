import { StyleSheet, Text, View } from 'react-native';
import { HomeColors } from './home-theme';

type Props = { dateLabel: string };

export function DateSummary({ dateLabel }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.date}>{dateLabel}</Text>
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
  date: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: HomeColors.textMuted,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: HomeColors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: HomeColors.primary },
  pillText: { fontSize: 11, fontWeight: '600', color: HomeColors.primary },
});
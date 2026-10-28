import { StyleSheet, TextInput } from 'react-native';
import { HomeColors } from '@/components/feature/home/home-theme';

type Props = { value: string; onChangeText: (t: string) => void };

export function TitleInput({ value, onChangeText }: Props) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder="Judul catatan"
      placeholderTextColor={HomeColors.textMuted}
      multiline
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 28,
    fontWeight: '800',
    color: HomeColors.textTitle,
    paddingVertical: 4,
    marginBottom: 12,
  },
});
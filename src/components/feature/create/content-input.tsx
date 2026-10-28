import { StyleSheet, TextInput } from 'react-native';
import { HomeColors } from '@/components/feature/home/home-theme';

type Props = { value: string; onChangeText: (t: string) => void };

export function ContentInput({ value, onChangeText }: Props) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder="Tulis catatanmu di sini..."
      placeholderTextColor={HomeColors.textMuted}
      multiline
      scrollEnabled={false}
      textAlignVertical="top"
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 15,
    lineHeight: 24,
    color: HomeColors.textTitle,
    minHeight: 160,
  },
});
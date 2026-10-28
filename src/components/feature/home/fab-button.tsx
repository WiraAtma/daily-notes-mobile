import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { HomeColors } from './home-theme';

type Props = { onPress?: () => void; bottom?: number };

export function FabButton({ onPress, bottom = 24 }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.fab, { bottom }, pressed && styles.pressed]}
    >
      <Ionicons name="add" size={30} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: HomeColors.fab,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6, // Android
    shadowColor: '#000', // iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  pressed: { transform: [{ scale: 0.95 }] },
});
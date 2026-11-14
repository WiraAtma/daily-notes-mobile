import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HomeColors } from './home-theme';

type Props = { onProfilePress?: () => void };

export function HomeHeader({ onProfilePress }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.title}>Daily Notes</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Buka profil"
        onPress={onProfilePress}
        style={styles.right}
      >
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={17} color={HomeColors.primary} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  title: { fontSize: 18, fontWeight: '700', color: HomeColors.textTitle },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DDE1F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 12, fontWeight: '700', color: HomeColors.primary },
});
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { uri: string; fileName: string; onRemove?: () => void };

export function ImagePreview({ uri, fileName, onRemove }: Props) {
  return (
    <View style={styles.wrap}>
      <Image source={{ uri }} style={styles.image} />

      <Pressable onPress={onRemove} style={styles.close} hitSlop={8}>
        <Ionicons name="close" size={16} color="#fff" />
      </Pressable>

      <View style={styles.badge}>
        <Ionicons name="image" size={14} color="#fff" />
        <Text style={styles.badgeText}>{fileName}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  image: { width: '100%', height: 220, backgroundColor: '#E6E8F0' },
  close: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(20,22,31,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: { fontSize: 11, color: '#fff', fontWeight: '500' },
});
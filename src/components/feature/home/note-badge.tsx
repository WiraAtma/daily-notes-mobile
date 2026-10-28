import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HomeColors } from './home-theme';

type Props = {
  label: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
};

export function NoteBadge({ label, icon }: Props) {
  return (
    <View style={styles.badge}>
      {icon && <Ionicons name={icon} size={12} color={HomeColors.primary} />}
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: HomeColors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  text: { fontSize: 11, fontWeight: '600', color: HomeColors.primary },
});
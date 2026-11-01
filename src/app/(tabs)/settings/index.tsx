import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

const COLORS = {
  background: '#F8F9FC',
  surface: '#FFFFFF',
  border: '#E6E9F2',
  text: '#0F172A',
  textMuted: '#64748B',
  textFaint: '#94A3B8',
  primary: '#2F4BDB',
  primarySoft: '#EAEEFC',
  badgeBg: '#F1F3F9',
  danger: '#C62839',
  dangerSoft: '#FDECEE',
  dangerBg: '#FFF6F6',
};

/* ---------- Komponen kecil ---------- */

function SectionLabel({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

function IconBox({
  name,
  color = COLORS.primary,
  background = COLORS.primarySoft,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color?: string;
  background?: string;
}) {
  return (
    <View style={[styles.iconBox, { backgroundColor: background }]}>
      <Ionicons name={name} size={20} color={color} />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

/* ---------- Layar utama ---------- */

export default function SettingsScreen() {
  const [reminderOn, setReminderOn] = useState(true);
  const [noteCount, setNoteCount] = useState(4);

  const handleDeleteAll = () => {
    Alert.alert(
      'Hapus semua catatan?',
      'Tindakan ini permanen dan tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            // TODO: panggil AsyncStorage.removeItem / clear di sini
            setNoteCount(0);
          },
        },
      ],
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="menu" size={24} color={COLORS.primary} />
            <Text style={styles.headerTitle}>Daily Notes</Text>
          </View>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Judul */}
          <Text style={styles.title}>Pengaturan</Text>
          <Text style={styles.subtitle}>
            Konfigurasi preferensi, notifikasi, dan data aplikasi Anda.
          </Text>

          {/* Notifikasi & Pengingat */}
          <SectionLabel title="NOTIFIKASI & PENGINGAT" action="Lokal" />
          <View style={styles.card}>
            <View style={styles.row}>
              <IconBox name="notifications" />
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>Pengingat Harian</Text>
                <Text style={styles.rowDesc}>
                  Dapatkan notifikasi harian untuk menulis catatan
                </Text>
              </View>
              <Switch
                value={reminderOn}
                onValueChange={setReminderOn}
                trackColor={{ false: '#D5DAE6', true: COLORS.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#D5DAE6"
              />
            </View>

            <Divider />

            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              onPress={() => {
                // TODO: buka time picker untuk mengatur waktu pengingat
              }}
            >
              <IconBox name="time-outline" />
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>Waktu Pengingat</Text>
                <Text style={styles.rowDesc}>Jadwal harian alarm</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillTextPrimary}>20:00 WIB</Text>
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={COLORS.primary}
                />
              </View>
            </Pressable>
          </View>

          <View style={styles.note}>
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color={COLORS.primary}
            />
            <Text style={styles.noteText}>
              Menggunakan Expo Notifications lokal tanpa koneksi internet.
            </Text>
          </View>

          {/* Penyimpanan & Privasi */}
          <SectionLabel title="PENYIMPANAN & PRIVASI" />
          <View style={styles.card}>
            <View style={styles.row}>
              <IconBox name="wallet-outline" />
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>Penyimpanan Lokal</Text>
                <Text style={styles.rowDesc}>AsyncStorage (Offline First)</Text>
              </View>
              <View style={styles.pill}>
                <View style={styles.dot} />
                <Text style={styles.pillTextPrimary}>Aktif</Text>
              </View>
            </View>

            <Divider />

            <View style={styles.row}>
              <IconBox name="folder-outline" />
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>Basis Data Terpakai</Text>
              </View>
              <View style={[styles.pill, styles.pillNeutral]}>
                <Text style={styles.pillTextMuted}>Jumlah Catatan: </Text>
                <Text style={styles.pillTextStrong}>{noteCount} Catatan</Text>
              </View>
            </View>
          </View>

          {/* Tentang Aplikasi */}
          <SectionLabel title="TENTANG APLIKASI" />
          <View style={styles.card}>
            <View style={styles.row}>
              <IconBox name="information-circle-outline" />
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>Daily Notes Mobile</Text>
              </View>
              <View style={[styles.pill, styles.pillNeutral]}>
                <Text style={styles.pillTextMono}>v1.0.0</Text>
              </View>
            </View>

            <Divider />

            <View style={styles.row}>
              <IconBox name="code-slash" />
              <View style={styles.rowBody}>
                <Text style={styles.rowTitleSmall} numberOfLines={1}>
                  React Native & Expo Router
                </Text>
              </View>
              <View style={[styles.pill, styles.pillNeutral]}>
                <Text style={styles.pillTextPrimary}>TypeScript</Text>
              </View>
            </View>

            <Divider />

            <View style={styles.row}>
              <IconBox name="school-outline" />
              <View style={styles.rowBody}>
                <Text style={styles.rowTitleSmall}>
                  Proyek Tugas Akhir Pengembangan Aplikasi Mobile
                </Text>
                <Text style={styles.rowDesc}>
                  Fokus pada performa native & retensi catatan lokal.
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.row,
                styles.dangerRow,
                pressed && styles.pressed,
              ]}
              onPress={handleDeleteAll}
            >
              <IconBox
                name="trash-outline"
                color={COLORS.danger}
                background={COLORS.dangerSoft}
              />
              <View style={styles.rowBody}>
                <Text style={styles.dangerTitle}>Hapus Semua Catatan Lokal</Text>
                <Text style={styles.rowDesc}>
                  Tindakan ini permanen dan tidak dapat dibatalkan
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={COLORS.textFaint}
              />
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Daily Notes • Dirancang dengan Estetika Minimalis
            </Text>
            <Text style={styles.footerBuild}>BUILD 2024.11-RELEASE</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },

  /* Konten */
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: 24,
    paddingBottom: BottomTabInset + 96,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textMuted,
  },

  /* Section */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.textMuted,
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },

  /* Card & baris */
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  rowTitleSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  rowDesc: {
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORS.textMuted,
  },
  divider: {
    height: 1,
    marginLeft: 70,
    backgroundColor: COLORS.border,
  },
  pressed: {
    opacity: 0.6,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Pill / badge */
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
  },
  pillNeutral: {
    backgroundColor: COLORS.badgeBg,
  },
  pillTextPrimary: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  pillTextMuted: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  pillTextStrong: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  pillTextMono: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    fontFamily: 'Courier',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },

  /* Catatan kecil */
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 6,
  },
  noteText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    color: COLORS.textMuted,
  },

  /* Bahaya */
  dangerRow: {
    backgroundColor: COLORS.dangerBg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.danger,
  },

  /* Footer */
  footer: {
    alignItems: 'center',
    marginTop: 32,
    gap: 4,
  },
  footerText: {
    fontSize: 11.5,
    color: COLORS.textFaint,
  },
  footerBuild: {
    fontSize: 10,
    letterSpacing: 0.8,
    color: COLORS.textFaint,
  },
});
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { HomeHeader } from '@/components/feature/home/home-header';
export default function SearchScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header Daily Notes */}
        <View style={styles.header}>
          <Ionicons name="menu" size={24} color="#1E293B" />
          <Text style={styles.headerTitle}>Daily Notes</Text>
          <Ionicons name="search" size={22} color="#2563EB" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.content}
        >
          {/* Judul + chip buku catatan */}
          <View style={styles.titleRow}>
            <Text style={[styles.title, styles.heading]}>Pencarian</Text>
            <View style={styles.notebookChip}>
              <Text style={styles.notebookChipText}>Semua Buku Catatan</Text>
            </View>
          </View>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#475569" />
            <Text style={styles.searchText}>tugas</Text>
            <View style={styles.clearButton}>
              <Ionicons name="close" size={14} color="#1E293B" />
            </View>
          </View>

          {/* Info hasil */}
          <View style={styles.resultInfoRow}>
            <Text style={styles.resultInfo}>
              Ditemukan <Text style={styles.resultBold}>2 catatan</Text> dengan
              kata kunci <Text style={styles.resultKeyword}>“tugas”</Text>
            </Text>
            <View style={styles.sortButton}>
              <Ionicons name="swap-vertical" size={14} color="#475569" />
              <Text style={styles.sortText}>Terbaru</Text>
            </View>
          </View>

          {/* Kartu 1 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                Rencana <Text style={styles.highlight}>Tugas</Text> Akhir Mobile
                App
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </View>
            <Text style={styles.cardExcerpt}>
              Menyiapkan rancangan wireframe Expo dan integrasi AsyncStorage
              untuk penyimpanan lokal...
            </Text>
            <View style={styles.cardFooter}>
              <View style={styles.cardMeta}>
                <Ionicons name="time-outline" size={14} color="#64748B" />
                <Text style={styles.cardTime}>Hari ini, 14:20</Text>
              </View>
              <View style={styles.cardTagWrap}>
                <View style={styles.cardTag}>
                  <Text style={styles.cardTagText}>Kuliah</Text>
                </View>
                <View style={styles.dot} />
              </View>
            </View>
          </View>

          {/* Kartu 2 */}
          <View style={[styles.card, styles.cardSpacing]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                Catatan Kuliah Interaksi Manusia & Komputer
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </View>
            <Text style={styles.cardExcerpt}>
              ...mengerjakan evaluasi heuristik dan kuis{' '}
              <Text style={styles.highlight}>tugas</Text> kelompok bab 4...
            </Text>
            <View style={styles.cardFooter}>
              <View style={styles.cardMeta}>
                <Ionicons name="calendar-outline" size={14} color="#64748B" />
                <Text style={styles.cardTime}>18 Okt 2024</Text>
              </View>
              <View style={styles.cardTag}>
                <Text style={styles.cardTagText}>Kampus</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Sering dicari */}
          <Text style={styles.sectionLabel}>Sering Dicari</Text>
          <View style={styles.tagRow}>
            {['#desain', '#wireframe', '#belanja', '#rapat'].map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagChipText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Tips */}
          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Ionicons name="bulb-outline" size={18} color="#1D4ED8" />
            </View>
            <View style={styles.tipBody}>
              <Text style={styles.tipTitle}>Tips Pencarian Cepat</Text>
              <Text style={styles.tipText}>
                Ketik kata kunci judul atau isi catatan untuk mencari. Anda juga
                dapat menggunakan tag seperti{' '}
                <Text style={styles.tipLink}>#kampus</Text> atau rentang
                tanggal.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  title: {
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + 96,
  },

  // ---- style tambahan untuk desain ----
  scroll: {
    alignSelf: 'stretch',
    marginHorizontal: -Spacing.four,
  },

  // Header
  header: {
    alignSelf: 'stretch',
    marginHorizontal: -Spacing.four,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: Spacing.three,
    backgroundColor: '#F8FAFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F2',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    color: '#0F172A',
  },

  // Judul
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  notebookChip: {
    backgroundColor: '#E8EEFF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  notebookChipText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '500',
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#D5DDF5',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info hasil
  resultInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
    marginBottom: 14,
  },
  resultInfo: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
  },
  resultBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  resultKeyword: {
    color: '#1D4ED8',
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sortText: {
    fontSize: 12,
    color: '#475569',
  },

  // Kartu hasil
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  cardSpacing: {
    marginTop: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 23,
    color: '#0F172A',
  },
  cardExcerpt: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    marginTop: 4,
  },
  highlight: {
    backgroundColor: '#DBE5FF',
    color: '#1D4ED8',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    marginTop: 12,
    paddingTop: 10,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTime: {
    fontSize: 12,
    color: '#64748B',
  },
  cardTagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTag: {
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  cardTagText: {
    fontSize: 12,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#CBD5E1',
    marginTop: 24,
    marginBottom: 18,
  },

  // Sering dicari
  sectionLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tagChipText: {
    fontSize: 14,
    color: '#475569',
  },

  // Tips
  tipCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F1F5FF',
    borderWidth: 1,
    borderColor: '#DCE4F7',
    borderRadius: 16,
    padding: 16,
    marginTop: 30,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#DBE5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipBody: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
  },
  tipLink: {
    color: '#1D4ED8',
  },
});
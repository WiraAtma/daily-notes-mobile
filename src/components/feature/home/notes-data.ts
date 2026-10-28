import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type NoteCategory = 'Kuliah' | 'Pribadi' | 'Tugas';

export type Note = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: NoteCategory;
  badge?: { label: string; icon?: IconName };
  image?: string;
  footerMeta?: { icon: IconName; label?: string };
  detail?: {
    folder?: string;          
    time?: string;            
    readMinutes?: number;
    imageCaption?: string;
    content?: string;
    keyPointsTitle?: string;
    keyPoints?: string[];
    reminder?: string;
    tags?: string[];
  };
};

export const FILTERS = ['Semua', 'Kuliah', 'Pribadi', 'Tugas'] as const;
export type Filter = (typeof FILTERS)[number];

export const NOTES: Note[] = [
  {
    id: '1',
    title: 'Rencana Tugas Akhir Mobile App',
    excerpt:
      'Menyiapkan rancangan wireframe Expo dan integrasi AsyncStorage untuk penyimpanan lokal.',
    date: 'Hari Ini, 14:20',
    category: 'Tugas',
    badge: { label: 'Baru' },
    footerMeta: { icon: 'pin' },
  },
  {
    id: '2',
    title: 'Daftar Belanja Kebutuhan Kos',
    excerpt:
      'Beras 5kg, minyak goreng, kopi bubuk, susu oat, dan camilan untuk belajar malam nanti.',
    date: 'Kemarin, 19:45',
    category: 'Pribadi',
    footerMeta: { icon: 'list', label: '5 Item' },
  },
  {
    id: '3',
    title: 'Ide Desain UI Portfolio',
    excerpt:
      'Gunakan palet warna monokrom dengan aksen biru pastel. Fokus pada tipografi bersih.',
    date: '21 Okt 2024',
    category: 'Tugas',
    badge: { label: '1 Foto', icon: 'image-outline' },
    image: 'https://picsum.photos/seed/portfolio/800/400',
    footerMeta: { icon: 'attach' },
    detail: {
    folder: 'Desain & Produk',
    time: '14:20',
    readMinutes: 3,
    imageCaption: 'Lampiran Gambar - Expo Image Picker',
    content:
      'Gunakan palet warna monokrom dengan aksen biru pastel. Fokus utama adalah tipografi yang bersih, whitespace yang lega, serta hierarki visual yang jelas.',
    keyPointsTitle: 'Poin-poin penting implementasi:',
    keyPoints: [
      'Desain komponen kartu seringan mungkin tanpa shadow berlebih.',
      'Gunakan font sans-serif seperti Inter atau Roboto.',
      'Pastikan fitur berbagi ke teman berjalan mulus menggunakan Native Share Sheet bawaan Expo.',
    ],
    reminder: 'Review kembali sebelum presentasi minggu depan.',
    tags: ['MobileDesign', 'Portfolio', 'ExpoShare'],
              },
  },
  {
    id: '4',
    title: 'Catatan Kuliah Interaksi Manusia & Komputer',
    excerpt:
      'Prinsip usability menurut Nielsen: konsistensi, feedback, dan pencegahan error sistem.',
    date: '18 Okt 2024',
    category: 'Kuliah',
    footerMeta: { icon: 'folder-outline', label: 'Akademik' },
  },
];
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AttachActions } from '@/components/feature/create/attach-actions';
import { ContentInput } from '@/components/feature/create/content-input';
import { CreateHeader } from '@/components/feature/create/create-header';
import { FormatToolbar } from '@/components/feature/create/format-toolbar';
import { ImagePreview } from '@/components/feature/create/image-preview';
import { MetaRow } from '@/components/feature/create/meta-row';
import { TitleInput } from '@/components/feature/create/title-input';
import { HomeColors } from '@/components/feature/home/home-theme';
import { MaxContentWidth } from '@/constants/theme';

export default function CreateNoteScreen() {
  const [title, setTitle] = useState('Refleksi Strategi Desain');
  const [content, setContent] = useState(
    'Eksplorasi hierarki visual untuk pembaruan sistem desain aplikasi Daily Notes. Fokus utama kita pada siklus ini adalah memangkas friksi mental saat mencatat kilas ide secara spontan.\n\nBeberapa poin eksekusi utama:\n1. Menyederhanakan palet warna menuju sistem monochrome murni dengan aksen biru fungsional.\n2. Integrasi picker foto lokal yang tidak',
  );

  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const chars = content.length;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <CreateHeader onBack={() => router.back()} onSave={() => router.back()} />

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <MetaRow createdAt="24 Okt 2024, 15:30"/>
            <TitleInput value={title} onChangeText={setTitle} />
            <AttachActions />
            <ImagePreview
              uri="https://picsum.photos/seed/notes-desk/800/500"
              fileName="IMG_24102024.jpg"
            />
            <ContentInput value={content} onChangeText={setContent} />
          </ScrollView>

          <FormatToolbar words={words} chars={chars} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: HomeColors.card,
  },
  safeArea: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
  flex: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
});
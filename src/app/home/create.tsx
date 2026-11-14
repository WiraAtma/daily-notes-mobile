import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AiBottomSheet } from '@/components/feature/create/ai-bottom-sheet';
import { CreateHeader } from '@/components/feature/create/create-header';
import { editorSelectionScript } from '@/components/feature/create/editor-selection';
import { HomeColors } from '@/components/feature/home/home-theme';
import { NOTE_CONTENT_CSS } from '@/constants/note-content';
import { MaxContentWidth } from '@/constants/theme';
import { useAiGeneration } from '@/hooks/use-ai-generation';
import { useAuth } from '@/providers/auth-provider';
import {
  createNote,
  getImageObjectKeys,
  htmlToPlainText,
  uploadNoteImage,
} from '@/services/notes';
import { getErrorMessage } from '@/utils/errors';
import { markdownToHtml } from '@/utils/markdown';

export default function CreateNoteScreen() {
  const editor = useRef<RichEditor>(null);
  const { accessToken } = useAuth();
  const ai = useAiGeneration();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [selectedImageKey, setSelectedImageKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAiVisible, setIsAiVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (isUploading) {
      setError('Tunggu hingga foto selesai diunggah sebelum menyimpan.');
      return;
    }
    if (!title.trim()) {
      setError('Judul catatan wajib diisi.');
      return;
    }
    if (!accessToken) {
      setError('Sesi login tidak ditemukan. Silakan masuk kembali.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await createNote(accessToken, { title: title.trim(), content });
      router.back();
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickImage = async () => {
    if (isUploading) return;
    if (!accessToken) {
      setError('Silakan masuk untuk menambahkan foto.');
      return;
    }
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError('Izin galeri diperlukan untuk memilih foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      });
      if (result.canceled) return;

      const image = result.assets[0];
      if (!image) return;
      setIsUploading(true);
      setError(null);
      const uploaded = await uploadNoteImage(
        accessToken,
        image.uri,
        image.fileName ?? 'catatan.jpg',
        image.mimeType ?? null,
      );
      editor.current?.insertHTML(
        `<img src="${escapeHtml(uploaded.downloadUrl)}" data-object-key="${escapeHtml(uploaded.objectKey)}" alt="${escapeHtml(image.fileName ?? 'Foto catatan')}" />`,
      );
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditorMessage = (message: { type: string; data?: unknown }) => {
    if (message.type !== 'APP_SELECTION_CHANGE') return;
    if (typeof message.data !== 'object' || message.data === null) return;
    const data = message.data;
    if ('text' in data && typeof data.text === 'string') setSelectedText(data.text);
    if ('imageKey' in data && typeof data.imageKey === 'string') {
      setSelectedImageKey(data.imageKey);
    }
  };

  const handleClipboardAction = async (action: 'copy' | 'cut' | 'paste') => {
    try {
      if (action === 'paste') {
        const pastedText = await Clipboard.getStringAsync();
        if (pastedText) editor.current?.insertText(pastedText);
        return;
      }
      if (!selectedText) return;
      await Clipboard.setStringAsync(selectedText);
      if (action === 'cut') {
        editor.current?.insertText('');
        setSelectedText('');
      }
    } catch (cause) {
      Alert.alert('Clipboard tidak tersedia', getErrorMessage(cause));
    }
  };

  const handleOpenAi = () => {
    ai.clear();
    setIsAiVisible(true);
  };

  const handleGenerate = async (prompt: string) => {
    const noteContext = selectedText || htmlToPlainText(content);
    const context = noteContext
      ? `\n\n${selectedText ? 'Konteks catatan yang dipilih' : 'Konteks catatan'}:\n${noteContext.slice(0, 16000)}`
      : '';
    await ai.generate(
      `${prompt}${context}`.slice(0, 20000),
      selectedImageKey
        ? [selectedImageKey]
        : getImageObjectKeys(content),
    );
  };

  const handleInsertAnswer = () => {
    if (!ai.output) return;
    editor.current?.insertHTML(markdownToHtml(ai.output));
    setSelectedText('');
    setSelectedImageKey('');
    setIsAiVisible(false);
  };

  const handleCopyAnswer = async () => {
    if (!ai.output) return;
    try {
      await Clipboard.setStringAsync(ai.output);
    } catch (cause) {
      Alert.alert('Tidak dapat menyalin', getErrorMessage(cause));
    }
  };

  const wordCount = content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <CreateHeader
            onBack={() => router.back()}
            onSave={handleSave}
            isSaving={isSaving || isUploading}
          />

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={14} color={HomeColors.textMuted} />
              <Text style={styles.metaText}>
                Dibuat: {new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
              </Text>
            </View>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Judul catatan"
              placeholderTextColor={HomeColors.textMuted}
              multiline
              maxLength={255}
              style={styles.titleInput}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {isUploading ? (
              <Text style={styles.uploading}>Mengunggah foto...</Text>
            ) : null}

            <RichEditor
              ref={editor}
              initialContentHTML={content}
              placeholder="Tulis catatanmu di sini..."
              editorStyle={{
                backgroundColor: '#FFFFFF',
                color: HomeColors.textTitle,
                placeholderColor: HomeColors.textMuted,
                caretColor: HomeColors.primary,
                contentCSSText: `font-size: 16px; line-height: 1.65; padding: 0; ${NOTE_CONTENT_CSS}`,
              }}
              initialHeight={260}
              onChange={setContent}
              onMessage={handleEditorMessage}
              editorInitializedCallback={() =>
                editor.current?.injectJavascript(editorSelectionScript)
              }
              style={styles.editor}
            />
          </ScrollView>

          {!isAiVisible ? (
            <View style={styles.selectionToolbar}>
              {selectedText || selectedImageKey ? (
                <>
                  <SelectionAction
                    label="Salin"
                    icon="copy-outline"
                    onPress={() => void handleClipboardAction('copy')}
                    disabled={!selectedText}
                  />
                  <SelectionAction
                    label="Potong"
                    icon="cut-outline"
                    onPress={() => void handleClipboardAction('cut')}
                    disabled={!selectedText}
                  />
                  <SelectionAction
                    label="Paste"
                    icon="clipboard-outline"
                    onPress={() => void handleClipboardAction('paste')}
                  />
                </>
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={handleOpenAi}
                style={styles.askAiAction}
              >
                <Ionicons name="sparkles" size={15} color="#FFFFFF" />
                <Text style={styles.askAiText}>
                  {selectedText || selectedImageKey ? 'Tanya AI yang dipilih' : 'Tanya AI'}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {!isAiVisible ? (
            <View style={styles.toolbar}>
              <RichToolbar
                getEditor={() => editor.current!}
                actions={[
                  actions.setBold,
                  actions.setItalic,
                  actions.insertBulletsList,
                  actions.insertOrderedList,
                  actions.checkboxList,
                  actions.insertImage,
                ]}
                onPressAddImage={handlePickImage}
                iconTint={HomeColors.textBody}
                selectedIconTint={HomeColors.primary}
                disabledIconTint={HomeColors.textMuted}
                iconSize={20}
                flatContainerStyle={styles.toolbarItems}
              />
              <Text style={styles.wordCount}>{wordCount} kata</Text>
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </SafeAreaView>

      <AiBottomSheet
        visible={isAiVisible}
        selectedText={selectedText}
        hasSelectedImage={Boolean(selectedImageKey)}
        isLoading={ai.isLoading}
        output={ai.output}
        error={ai.error}
        onClose={() => setIsAiVisible(false)}
        onGenerate={handleGenerate}
        onInsert={handleInsertAnswer}
        onCopy={() => void handleCopyAnswer()}
      />
    </View>
  );
}

function SelectionAction({
  label,
  icon,
  onPress,
  disabled = false,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.selectionAction, disabled && styles.disabledAction]}
    >
      <Ionicons name={icon} size={15} color="#27334D" />
      <Text style={styles.selectionActionText}>{label}</Text>
    </Pressable>
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  metaText: { fontSize: 12, color: HomeColors.textMuted },
  titleInput: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: HomeColors.textTitle,
    paddingVertical: 4,
    marginBottom: 10,
  },
  editor: { minHeight: 260 },
  error: { marginBottom: 10, color: '#B42318', fontSize: 12 },
  uploading: { marginBottom: 10, color: HomeColors.primary, fontSize: 12 },
  selectionToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#F6F7FB',
    borderTopWidth: 1,
    borderTopColor: HomeColors.border,
  },
  selectionAction: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 5,
  },
  selectionActionText: { fontSize: 11, fontWeight: '600', color: '#27334D' },
  disabledAction: { opacity: 0.4 },
  askAiAction: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    borderRadius: 18,
    backgroundColor: HomeColors.primary,
  },
  askAiText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  toolbar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: HomeColors.border,
    backgroundColor: HomeColors.card,
  },
  toolbarItems: { flex: 1 },
  wordCount: { fontSize: 10, color: HomeColors.textMuted },
});

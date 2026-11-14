import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import * as Clipboard from 'expo-clipboard';

import { AiBottomSheet } from '@/components/feature/create/ai-bottom-sheet';
import { HomeColors } from '@/components/feature/home/home-theme';
import { NOTE_CONTENT_CSS } from '@/constants/note-content';
import { useAiGeneration } from '@/hooks/use-ai-generation';
import { editorSelectionScript } from '@/components/feature/create/editor-selection';
import { useAuth } from '@/providers/auth-provider';
import { useNote } from '@/hooks/use-notes';
import {
  getImageObjectKeys,
  htmlToPlainText,
  updateNote,
} from '@/services/notes';
import { getErrorMessage } from '@/utils/errors';
import type { ApiNote } from '@/types/api';
import { markdownToHtml } from '@/utils/markdown';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const noteId = Array.isArray(id) ? id[0] : id;
  const { note, isLoading, error } = useNote(noteId);
  const { accessToken } = useAuth();
  const editor = useRef<RichEditor>(null);
  const ai = useAiGeneration();
  const [savedNote, setSavedNote] = useState<ApiNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [contentDraft, setContentDraft] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [selectedImageKey, setSelectedImageKey] = useState('');
  const [isAiVisible, setIsAiVisible] = useState(false);
  const displayedNote = savedNote?.id === note?.id ? savedNote : note;

  const handleStartEditing = () => {
    if (!displayedNote) return;
    setTitleDraft(displayedNote.title);
    setContentDraft(displayedNote.content);
    setEditError(null);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    if (isSaving) return;
    setEditError(null);
    setSelectedText('');
    setSelectedImageKey('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!displayedNote || isSaving) return;
    if (!accessToken) {
      setEditError('Sesi login tidak ditemukan. Silakan masuk kembali.');
      return;
    }
    if (!titleDraft.trim()) {
      setEditError('Judul catatan wajib diisi.');
      return;
    }

    setIsSaving(true);
    setEditError(null);
    try {
      const updated = await updateNote(accessToken, displayedNote.id, {
        title: titleDraft.trim(),
        content: contentDraft,
      });
      setSavedNote(updated);
      setSelectedText('');
      setSelectedImageKey('');
      setIsEditing(false);
    } catch (cause) {
      setEditError(getErrorMessage(cause));
    } finally {
      setIsSaving(false);
    }
  };

  const handleInsertAnswer = () => {
    if (!isEditing || !ai.output) return;
    editor.current?.insertHTML(markdownToHtml(ai.output));
    setSelectedText('');
    setSelectedImageKey('');
    setIsAiVisible(false);
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

  const handleCopy = async () => {
    if (!selectedText) return;
    try {
      await Clipboard.setStringAsync(selectedText);
    } catch (cause) {
      Alert.alert('Tidak dapat menyalin', getErrorMessage(cause));
    }
  };

  const handleGenerate = async (prompt: string) => {
    if (!displayedNote) return;
    const context = selectedText || htmlToPlainText(displayedNote.content);
    const imageKeys = selectedImageKey
      ? [selectedImageKey]
      : getImageObjectKeys(displayedNote.content);
    await ai.generate(
      `${prompt}\n\nKonteks catatan:\n${context}`.slice(0, 20000),
      imageKeys,
    );
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.topBar}>
            <View style={styles.topBarSide}>
              <Pressable
                accessibilityLabel="Kembali ke catatan"
                onPress={() => router.back()}
                hitSlop={10}
              >
                <Ionicons name="arrow-back" size={23} color="#1B1E25" />
              </Pressable>
            </View>
            <Text style={styles.topBarTitle}>Catatan Harian</Text>
            <View style={[styles.topBarSide, styles.topBarActions]}>
              {isEditing ? (
                <>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isSaving}
                    onPress={handleCancelEditing}
                  >
                    <Text style={styles.cancelText}>Batal</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isSaving}
                    onPress={() => void handleSave()}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color={HomeColors.primary} />
                    ) : (
                      <Text style={styles.saveText}>Simpan</Text>
                    )}
                  </Pressable>
                </>
              ) : displayedNote ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Edit catatan"
                  onPress={handleStartEditing}
                  style={styles.editButton}
                >
                  <Ionicons name="create-outline" size={17} color={HomeColors.primary} />
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color="#315FEA" />
            </View>
          ) : error ? (
            <View style={styles.center}>
              <Ionicons name="alert-circle-outline" size={34} color="#B42318" />
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : displayedNote ? (
            <ScrollView
              style={styles.flex}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {isEditing ? (
                <TextInput
                  value={titleDraft}
                  onChangeText={setTitleDraft}
                  placeholder="Judul catatan"
                  placeholderTextColor="#737E91"
                  multiline
                  maxLength={255}
                  style={styles.titleInput}
                />
              ) : (
                <Text style={styles.title}>{displayedNote.title}</Text>
              )}
              <View style={styles.meta}>
                <Ionicons name="calendar-outline" size={14} color="#737E91" />
                <Text style={styles.metaText}>
                  {new Date(displayedNote.updated_at).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </Text>
              </View>
              {editError ? <Text style={styles.error}>{editError}</Text> : null}
              <RichEditor
                key={`${displayedNote.id}-${isEditing ? 'edit' : 'read'}`}
                ref={editor}
                disabled={!isEditing}
                initialContentHTML={isEditing ? contentDraft : displayedNote.content}
                initialHeight={260}
                editorStyle={{
                  backgroundColor: '#FFFFFF',
                  color: '#27334D',
                  contentCSSText: `font-size: 15px; line-height: 1.65; padding: 0; ${NOTE_CONTENT_CSS}`,
                }}
                onChange={isEditing ? setContentDraft : undefined}
                onMessage={handleEditorMessage}
                editorInitializedCallback={() =>
                  editor.current?.injectJavascript(editorSelectionScript)
                }
                style={styles.editor}
              />
            </ScrollView>
          ) : null}

          {isEditing && !isAiVisible ? (
            <View style={styles.toolbar}>
              <RichToolbar
                getEditor={() => editor.current!}
                actions={[
                  actions.setBold,
                  actions.setItalic,
                  actions.insertBulletsList,
                  actions.insertOrderedList,
                  actions.checkboxList,
                ]}
                iconTint="#27334D"
                selectedIconTint={HomeColors.primary}
                disabledIconTint="#737E91"
                iconSize={19}
                flatContainerStyle={styles.toolbarItems}
              />
            </View>
          ) : null}

          {!isAiVisible ? (
            <View style={styles.selectionBar}>
              {selectedText ? (
                <Pressable onPress={() => void handleCopy()} style={styles.selectionAction}>
                  <Ionicons name="copy-outline" size={16} color="#27334D" />
                  <Text style={styles.selectionLabel}>Salin</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={() => {
                  ai.clear();
                  setIsAiVisible(true);
                }}
                style={[styles.selectionAction, styles.aiAction]}
              >
                <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                <Text style={[styles.selectionLabel, styles.aiSelectionLabel]}>
                  {selectedText || selectedImageKey ? 'Tanya AI yang dipilih' : 'Tanya AI'}
                </Text>
              </Pressable>
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
        onInsert={isEditing ? handleInsertAnswer : undefined}
        onClose={() => setIsAiVisible(false)}
        onGenerate={handleGenerate}
        onCopy={() => {
          if (!ai.output) return;
          void Clipboard.setStringAsync(ai.output).catch((cause: unknown) =>
            Alert.alert('Tidak dapat menyalin', getErrorMessage(cause)),
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  topBarSide: { width: 82, flexDirection: 'row', alignItems: 'center' },
  topBarActions: { justifyContent: 'flex-end', gap: 10 },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E8EF',
  },
  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#27334D',
  },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editText: { color: HomeColors.primary, fontSize: 12, fontWeight: '700' },
  cancelText: { color: '#667085', fontSize: 12, fontWeight: '600' },
  saveText: { color: HomeColors.primary, fontSize: 12, fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 32 },
  title: { color: '#1B1E25', fontSize: 27, lineHeight: 34, fontWeight: '800' },
  titleInput: {
    color: '#1B1E25',
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '800',
    paddingVertical: 0,
    marginBottom: 4,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, marginBottom: 22 },
  metaText: { fontSize: 12, color: '#737E91' },
  editor: { minHeight: 260 },
  toolbar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E8EF',
    backgroundColor: '#FFFFFF',
  },
  toolbarItems: { flex: 1 },
  selectionBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E8EF',
    backgroundColor: '#F6F7FB',
  },
  selectionAction: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  aiAction: { backgroundColor: '#315FEA' },
  selectionLabel: { color: '#27334D', fontSize: 12, fontWeight: '700' },
  aiSelectionLabel: { color: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  error: { textAlign: 'center', color: '#B42318', fontSize: 13 },
});

import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import RenderHtml, { type MixedStyleDeclaration } from 'react-native-render-html';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AiBottomSheet } from '@/components/feature/create/ai-bottom-sheet';
import { editorSelectionScript } from '@/components/feature/create/editor-selection';
import { HomeColors } from '@/components/feature/home/home-theme';
import { NOTE_CONTENT_CSS } from '@/constants/note-content';
import { useAiGeneration } from '@/hooks/use-ai-generation';
import { useNote } from '@/hooks/use-notes';
import { useAuth } from '@/providers/auth-provider';
import { getImageObjectKeys, htmlToPlainText, updateNote } from '@/services/notes';
import type { ApiNote } from '@/types/api';
import { getErrorMessage } from '@/utils/errors';
import { appendHtmlContent, markdownToHtml } from '@/utils/markdown';

const CONTENT_PADDING = 20;
const MIN_EDIT_HEIGHT = 260;

// Gaya mode baca (padanan manual dari NOTE_CONTENT_CSS). Sesuaikan dengan tema kamu.
const baseStyle: MixedStyleDeclaration = { color: '#27334D', fontSize: 15, lineHeight: 25 };
const tagsStyles: Record<string, MixedStyleDeclaration> = {
  p: { marginTop: 0, marginBottom: 10 },
  h1: { fontSize: 22, lineHeight: 30, fontWeight: '700', color: '#1B1E25', marginVertical: 8 },
  h2: { fontSize: 19, lineHeight: 27, fontWeight: '700', color: '#1B1E25', marginVertical: 8 },
  h3: { fontSize: 16, lineHeight: 24, fontWeight: '700', color: '#1B1E25', marginVertical: 6 },
  ul: { marginTop: 0, marginBottom: 10 },
  ol: { marginTop: 0, marginBottom: 10 },
  li: { marginBottom: 4 },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: '#D5DAE6',
    paddingLeft: 10,
    marginLeft: 0,
    marginVertical: 8,
  },
  a: { color: '#315FEA' },
  img: { borderRadius: 8, marginVertical: 8 },
};

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const noteId = Array.isArray(id) ? id[0] : id;
  const { note, isLoading, error } = useNote(noteId);
  const { accessToken } = useAuth();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const editor = useRef<RichEditor>(null);
  const scrollRef = useRef<ScrollView>(null);
  const editorTopRef = useRef(0);
  const ai = useAiGeneration();
  const [savedNote, setSavedNote] = useState<ApiNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [contentDraft, setContentDraft] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [selectedImageKey, setSelectedImageKey] = useState('');
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [contentHeight, setContentHeight] = useState(0);
  const [isAiVisible, setIsAiVisible] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const displayedNote = savedNote?.id === note?.id ? savedNote : note;
  const contentWidth = windowWidth - CONTENT_PADDING * 2;
  const editorHeight = Math.max(contentHeight, MIN_EDIT_HEIGHT);

  const htmlSource = useMemo(
    () => ({ html: displayedNote?.content || '<p></p>' }),
    [displayedNote?.content],
  );

  // Mode baca: tap gambar = pilih / batal pilih sebagai konteks AI.
  const renderersProps = useMemo(
    () => ({
      img: {
        onPress: (_event: unknown, src: string, htmlAttribs: Record<string, string>) => {
          const key = htmlAttribs['data-object-key'] ?? '';
          if (!key) return;
          setSelectedImageKey((current) => (current === key ? '' : key));
          setSelectedImageUrl((current) => (current === src ? '' : src));
        },
      },
    }),
    [],
  );

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Editor di-remount saat masuk/keluar mode edit: reset tinggi lama.
  useEffect(() => {
    setContentHeight(0);
  }, [displayedNote?.id, isEditing]);

  const clearSelection = () => {
    setSelectedText('');
    setSelectedImageKey('');
    setSelectedImageUrl('');
  };

  const handleStartEditing = () => {
    if (!displayedNote) return;
    setTitleDraft(displayedNote.title);
    setContentDraft(displayedNote.content);
    setEditError(null);
    clearSelection();
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    if (isSaving) return;
    setEditError(null);
    clearSelection();
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
      clearSelection();
      setIsEditing(false);
    } catch (cause) {
      setEditError(getErrorMessage(cause));
    } finally {
      setIsSaving(false);
    }
  };

  const handleInsertAnswer = () => {
    if (!isEditing || !ai.output) return;
    const combined = appendHtmlContent(contentDraft, markdownToHtml(ai.output));
    setContentDraft(combined);
    editor.current?.setContentHTML(combined);
    clearSelection();
    setIsAiVisible(false);
  };

  const handleEditorMessage = (message: { type: string; data?: unknown }) => {
    if (typeof message.data !== 'object' || message.data === null) return;
    const data = message.data;
    if (message.type === 'APP_CONTENT_HEIGHT') {
      if ('height' in data && typeof data.height === 'number' && data.height > 0) {
        setContentHeight(Math.ceil(data.height));
      }
      return;
    }
    if (message.type !== 'APP_SELECTION_CHANGE') return;
    if ('text' in data && typeof data.text === 'string') setSelectedText(data.text);
    if ('imageKey' in data && typeof data.imageKey === 'string') {
      setSelectedImageKey(data.imageKey);
    }
    if ('imageUrl' in data && typeof data.imageUrl === 'string') {
      setSelectedImageUrl(data.imageUrl);
    }
  };

  const handleCursorPosition = (offsetY: number) => {
    scrollRef.current?.scrollTo({
      y: Math.max(editorTopRef.current + offsetY - 30, 0),
      animated: true,
    });
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
    await ai.generate(`${prompt}\n\nKonteks catatan:\n${context}`.slice(0, 20000), imageKeys);
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <KeyboardAvoidingView style={styles.flex} behavior="padding">
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
              ref={scrollRef}
              style={styles.flex}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
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
                <Text selectable style={styles.title}>
                  {displayedNote.title}
                </Text>
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

              {isEditing ? (
                // Sama persis dengan halaman create: tinggi mengikuti mekanisme bawaan editor.
                <View
                  style={{ height: editorHeight }}
                  onLayout={(e) => (editorTopRef.current = e.nativeEvent.layout.y)}
                >
                  <RichEditor
                    key={`${displayedNote.id}-edit`}
                    ref={editor}
                    useContainer={false}
                    scrollEnabled={false}
                    initialContentHTML={contentDraft}
                    placeholder="Tulis catatanmu di sini..."
                    editorStyle={{
                      backgroundColor: '#FFFFFF',
                      color: '#27334D',
                      placeholderColor: '#737E91',
                      caretColor: HomeColors.primary,
                      contentCSSText: `font-size: 15px; line-height: 1.65; padding: 0; ${NOTE_CONTENT_CSS}`,
                    }}
                    initialHeight={editorHeight}
                    onChange={setContentDraft}
                    onMessage={handleEditorMessage}
                    editorInitializedCallback={() =>
                      editor.current?.injectJavascript(editorSelectionScript)
                    }
                    onCursorPosition={handleCursorPosition}
                    style={{ height: editorHeight, backgroundColor: '#FFFFFF' }}
                  />
                </View>
              ) : (
                // Mode baca: render native juga, langsung penuh tanpa paint bertahap.
                <RenderHtml
                  contentWidth={contentWidth}
                  source={htmlSource}
                  baseStyle={baseStyle}
                  tagsStyles={tagsStyles}
                  defaultTextProps={{ selectable: true }}
                  renderersProps={renderersProps}
                />
              )}
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
              {selectedImageKey && selectedImageUrl ? (
                <View style={styles.imageChip}>
                  <Image source={{ uri: selectedImageUrl }} style={styles.imageChipThumb} />
                  <Pressable
                    accessibilityLabel="Batalkan pilihan gambar"
                    hitSlop={8}
                    onPress={() => {
                      setSelectedImageKey('');
                      setSelectedImageUrl('');
                    }}
                  >
                    <Ionicons name="close-circle" size={16} color="#64748B" />
                  </Pressable>
                </View>
              ) : null}
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

          <View
            style={{
              height: isKeyboardVisible ? 0 : insets.bottom,
              backgroundColor: '#F6F7FB',
            }}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>

      <AiBottomSheet
        visible={isAiVisible}
        selectedText={selectedText}
        hasSelectedImage={Boolean(selectedImageKey)}
        selectedImageUrl={selectedImageUrl}
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
  content: { paddingHorizontal: CONTENT_PADDING, paddingTop: 22, paddingBottom: 40 },
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
    gap: 4,
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
  imageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 3,
    paddingRight: 6,
    borderRadius: 10,
    backgroundColor: '#EEF1FF',
  },
  imageChipThumb: { width: 30, height: 30, borderRadius: 7, backgroundColor: '#DDE3EF' },
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
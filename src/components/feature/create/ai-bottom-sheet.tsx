import { Ionicons } from '@expo/vector-icons';
import Markdown, { type MarkdownStyleMap } from '@ronradtke/react-native-markdown-display';
import { useEffect, useState } from 'react';
import {
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { markdownParser, markdownRules } from '@/utils/markdown';

type Props = {
  visible: boolean;
  selectedText: string;
  hasSelectedImage: boolean;
  isLoading: boolean;
  output: string | null;
  error: string | null;
  onInsert?: () => void;
  onClose: () => void;
  onGenerate: (prompt: string) => Promise<void>;
  onCopy: () => void;
};

export function AiBottomSheet({
  visible,
  selectedText,
  hasSelectedImage,
  isLoading,
  output,
  error,
  onInsert,
  onClose,
  onGenerate,
  onCopy,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [prompt, setPrompt] = useState('');
  const [skeletonOpacity] = useState(() => new Animated.Value(1));
  const sheetHeight = Math.min(
    windowHeight * (output ? 0.78 : 0.52),
    windowHeight - insets.top - 16,
  );

  useEffect(() => {
    if (!isLoading) {
      skeletonOpacity.stopAnimation();
      skeletonOpacity.setValue(1);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonOpacity, {
          toValue: 0.4,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(skeletonOpacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [isLoading, skeletonOpacity]);

  const handleClose = () => {
    setPrompt('');
    onClose();
  };

  const handleGenerate = () => {
    if (!prompt.trim() || isLoading) return;
    const submittedPrompt = prompt.trim();
    setPrompt('');
    void onGenerate(submittedPrompt).catch(() => undefined);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
        >
          <View
            style={[
              styles.sheet,
              {
                height: sheetHeight,
                paddingBottom: Math.max(insets.bottom + 8, 24),
              },
            ]}
          >
            <View style={styles.handle} />
            <View style={styles.header}>
              <View style={styles.headerTitle}>
                <View style={styles.aiIcon}>
                  <Ionicons name="sparkles" size={16} color="#315FEA" />
                </View>
                <Text style={styles.title}>Tanya AI</Text>
                <Text style={styles.pro}>AI</Text>
              </View>
              <Pressable accessibilityLabel="Tutup Tanya AI" onPress={handleClose} hitSlop={10}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <View style={styles.context}>
              {hasSelectedImage ? (
                <View style={styles.contextChip}>
                  <Ionicons name="image-outline" size={14} color="#315FEA" />
                  <Text style={styles.contextText}>1 gambar dipilih</Text>
                </View>
              ) : null}
              {selectedText ? (
                <Text style={styles.selectedText} numberOfLines={3}>
                  “{selectedText}”
                </Text>
              ) : null}
              {!selectedText && !hasSelectedImage ? (
                <Text style={styles.contextHint}>
                  Tulis pertanyaan tentang catatan ini.
                </Text>
              ) : null}
            </View>

            {output ? (
              <ScrollView style={styles.answerWrap} keyboardShouldPersistTaps="handled">
                <View style={styles.answerHeader}>
                  <Ionicons name="sparkles" size={14} color="#315FEA" />
                  <Text style={styles.answerLabel}>Daily AI · baru saja</Text>
                </View>
                <View style={styles.answer}>
                  <Markdown
                    markdownit={markdownParser}
                    rules={markdownRules}
                    style={markdownStyles}
                  >
                    {output}
                  </Markdown>
                </View>
                <View style={styles.answerActions}>
                  {onInsert ? (
                    <Pressable style={styles.secondaryButton} onPress={onInsert}>
                      <Ionicons name="document-text-outline" size={15} color="#315FEA" />
                      <Text style={styles.secondaryButtonText}>Sisipkan ke Catatan</Text>
                    </Pressable>
                  ) : null}
                  <Pressable style={styles.copyButton} onPress={onCopy}>
                    <Ionicons name="copy-outline" size={15} color="#27334D" />
                    <Text style={styles.copyButtonText}>Salin</Text>
                  </Pressable>
                </View>
              </ScrollView>
            ) : (
              <View style={styles.answerSpacer}>
                {isLoading ? (
                  <View
                    accessibilityLabel="AI sedang menyusun jawaban"
                    style={styles.loadingAnswer}
                  >
                    <View style={styles.loadingHeader}>
                      <Ionicons name="sparkles" size={15} color="#315FEA" />
                      <Text style={styles.loadingTitle}>AI sedang menjawab</Text>
                    </View>
                    <Animated.View
                      style={[styles.skeletonLine, styles.skeletonLong, { opacity: skeletonOpacity }]}
                    />
                    <Animated.View
                      style={[styles.skeletonLine, styles.skeletonMedium, { opacity: skeletonOpacity }]}
                    />
                    <Animated.View
                      style={[styles.skeletonLine, styles.skeletonShort, { opacity: skeletonOpacity }]}
                    />
                  </View>
                ) : !error ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="sparkles-outline" size={18} color="#929CB0" />
                    <Text style={styles.emptyStateText}>Jawaban AI akan muncul di sini</Text>
                  </View>
                ) : null}
              </View>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.composer}>
              <TextInput
                value={prompt}
                onChangeText={setPrompt}
                placeholder="Ketik pertanyaan atau prompt..."
                placeholderTextColor="#8A93A5"
                multiline
                editable={!isLoading}
                maxLength={4000}
                style={styles.input}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Kirim pertanyaan ke AI"
                disabled={!prompt.trim() || isLoading}
                onPress={handleGenerate}
                style={[styles.sendButton, (!prompt.trim() || isLoading) && styles.disabled]}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
                )}
              </Pressable>
            </View>
            <Text style={styles.footnote}>
              Konteks catatan dikirim ke AI untuk membantu menjawab.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(20, 27, 43, 0.42)',
  },
  keyboard: { justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
    backgroundColor: '#D5DAE6',
  },
  header: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EEF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '700', color: '#1C2433' },
  pro: {
    color: '#315FEA',
    fontSize: 9,
    fontWeight: '800',
    backgroundColor: '#EEF1FF',
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 6,
  },
  context: { marginTop: 12, marginBottom: 10, gap: 8 },
  contextChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#EEF1FF',
  },
  contextText: { color: '#315FEA', fontSize: 11, fontWeight: '600' },
  selectedText: {
    color: '#43506A',
    fontSize: 12,
    lineHeight: 18,
    backgroundColor: '#F6F7FB',
    padding: 10,
    borderRadius: 10,
  },
  contextHint: { color: '#707B90', fontSize: 12 },
  answerWrap: { flex: 1, minHeight: 0, marginBottom: 8 },
  answerSpacer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingAnswer: {
    width: '100%',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F6F7FB',
  },
  loadingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingTitle: { color: '#596579', fontSize: 12, fontWeight: '600' },
  skeletonLine: { height: 9, borderRadius: 5, backgroundColor: '#DDE3EF' },
  skeletonLong: { width: '94%' },
  skeletonMedium: { width: '76%' },
  skeletonShort: { width: '54%' },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: '#F6F7FB',
  },
  emptyStateText: { color: '#707B90', fontSize: 12 },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 10,
  },
  answerLabel: { color: '#667085', fontSize: 11, fontWeight: '600' },
  answer: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8EBF3',
    borderRadius: 12,
  },
  answerActions: { flexDirection: 'row', gap: 8, marginTop: 10, marginBottom: 4 },
  secondaryButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 12,
    backgroundColor: '#EEF1FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryButtonText: { color: '#315FEA', fontSize: 11, fontWeight: '700' },
  copyButton: {
    minHeight: 38,
    paddingHorizontal: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E8EF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  copyButtonText: { color: '#27334D', fontSize: 11, fontWeight: '600' },
  error: { marginBottom: 8, color: '#B42318', fontSize: 12 },
  composer: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E1E5ED',
    borderRadius: 15,
    paddingLeft: 12,
    paddingRight: 6,
    backgroundColor: '#FFFFFF',
  },
  input: { flex: 1, minHeight: 44, maxHeight: 100, paddingVertical: 10, color: '#27334D', fontSize: 13 },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#315FEA',
  },
  disabled: { opacity: 0.5 },
  footnote: {
    marginTop: 7,
    textAlign: 'center',
    color: '#8A93A5',
    fontSize: 10,
  },
});

const markdownStyles: MarkdownStyleMap = {
  body: { color: '#27334D', fontSize: 14, lineHeight: 21 },
  text: { color: '#27334D', fontSize: 14, lineHeight: 21 },
  strong: { fontWeight: '700' },
  em: { fontStyle: 'italic' },
  s: { textDecorationLine: 'line-through' },
  paragraph: { marginTop: 0, marginBottom: 8, flexWrap: 'wrap', width: '100%' },
  heading1: { color: '#1C2433', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  heading2: { color: '#1C2433', fontSize: 16, fontWeight: '700', marginBottom: 7 },
  heading3: { color: '#1C2433', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  bullet_list: { marginBottom: 8 },
  ordered_list: { marginBottom: 8 },
  list_item: { marginBottom: 3 },
  blockquote: {
    borderLeftWidth: 3,
    borderColor: '#D5DAE6',
    paddingLeft: 8,
    marginLeft: 2,
  },
  code_inline: {
    color: '#27334D',
    backgroundColor: '#F2F4F7',
    borderRadius: 4,
    paddingHorizontal: 3,
  },
  code_block: {
    color: '#27334D',
    backgroundColor: '#F6F7FB',
    borderColor: '#E8EBF3',
    padding: 8,
    borderRadius: 8,
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E8EBF3',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tr: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8EBF3',
  },
  th: { flex: 1, padding: 6, backgroundColor: '#F3F5FB' },
  td: { flex: 1, padding: 6 },
  link: { color: '#315FEA', textDecorationLine: 'underline' },
};

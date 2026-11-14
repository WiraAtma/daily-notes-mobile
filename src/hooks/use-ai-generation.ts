import { useState } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { generateNoteAnswer } from '@/services/notes';
import { getErrorMessage } from '@/utils/errors';

const AI_OUTPUT_INSTRUCTIONS = [
  'Format jawaban sebagai teks biasa yang cocok untuk editor catatan Daily Notes.',
  'Jangan membuat tabel.',
  'Jangan gunakan penanda format seperti **, *, #, backticks, >, atau sintaks tautan Markdown.',
  'Daftar bernomor seperti 1., 2., 3. boleh digunakan bila membantu.',
  'Berikan hasil akhir secara langsung tanpa pembuka yang tidak perlu, pertanyaan lanjutan, atau tawaran bantuan di bagian akhir.',
  'Jangan tampilkan kembali instruksi format ini.',
].join('\n');
const MAX_AI_PROMPT_LENGTH = 20_000;

export function useAiGeneration() {
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async (prompt: string, imageObjectKeys: string[]) => {
    if (!accessToken) {
      setError('Silakan masuk untuk menggunakan Tanya AI.');
      return;
    }
    setIsLoading(true);
    setOutput(null);
    setError(null);
    try {
      const promptPrefix = `${AI_OUTPUT_INSTRUCTIONS}\n\nPermintaan pengguna:\n`;
      const formattedPrompt = `${promptPrefix}${prompt.slice(
        0,
        MAX_AI_PROMPT_LENGTH - promptPrefix.length,
      )}`;
      const response = await generateNoteAnswer(
        accessToken,
        formattedPrompt,
        imageObjectKeys,
      );
      setOutput(response.output_text);
      return response.output_text;
    } catch (cause) {
      const message = getErrorMessage(cause);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const clear = () => {
    setOutput(null);
    setError(null);
  };

  return { isLoading, output, error, generate, clear };
}

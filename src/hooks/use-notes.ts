import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { useAuth } from '@/providers/auth-provider';
import {
  getNote,
  listNotes,
  refreshNoteImageUrls,
} from '@/services/notes';
import type { ApiNote } from '@/types/api';
import { getErrorMessage } from '@/utils/errors';

export function useNotes() {
  const { accessToken } = useAuth();
  const [notes, setNotes] = useState<ApiNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFocused = useRef(false);

  const loadNotes = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await listNotes(accessToken);
      const items = await Promise.all(
        response.items.map(async (note) => ({
          ...note,
          content: await refreshNoteImageUrls(accessToken, note.content),
        })),
      );
      if (isFocused.current) setNotes(items);
    } catch (cause) {
      if (isFocused.current) setError(getErrorMessage(cause));
    } finally {
      if (isFocused.current) setIsLoading(false);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      void loadNotes();
      return () => {
        isFocused.current = false;
      };
    }, [loadNotes]),
  );

  const refresh = useCallback(() => void loadNotes(), [loadNotes]);
  return { notes, isLoading, error, refresh };
}

export function useNote(id: string | undefined) {
  const { accessToken } = useAuth();
  const [note, setNote] = useState<ApiNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFocused = useRef(false);
  const noteId = id ? Number(id) : null;
  const hasInvalidId =
    id !== undefined &&
    (noteId === null || !Number.isSafeInteger(noteId) || noteId < 1);

  const loadNote = useCallback(async () => {
    if (!accessToken || noteId === null || hasInvalidId) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await getNote(accessToken, noteId);
      const resolved = {
        ...result,
        content: await refreshNoteImageUrls(accessToken, result.content),
      };
      if (isFocused.current) setNote(resolved);
    } catch (cause) {
      if (isFocused.current) setError(getErrorMessage(cause));
    } finally {
      if (isFocused.current) setIsLoading(false);
    }
  }, [accessToken, hasInvalidId, noteId]);

  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      if (!hasInvalidId) void loadNote();
      return () => {
        isFocused.current = false;
      };
    }, [hasInvalidId, loadNote]),
  );

  return {
    note,
    isLoading: hasInvalidId ? false : isLoading,
    error: hasInvalidId ? 'ID catatan tidak valid.' : error,
  };
}

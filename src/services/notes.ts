import { apiRequest } from './api';
import type {
  AiGenerateResponse,
  ApiNote,
  DownloadUrlResponse,
  NoteInput,
  NoteListResponse,
  UploadUrlResponse,
} from '@/types/api';

const IMAGE_KEY_ATTRIBUTE = /\bdata-object-key=(["'])(.*?)\1/i;
const IMAGE_SRC_ATTRIBUTE = /\bsrc=(["'])(.*?)\1/i;
const IMAGE_TAG = /<img\b[^>]*>/gi;
const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_IMAGE_URL?.replace(/\/+$/, '');

export function listNotes(token: string): Promise<NoteListResponse> {
  return apiRequest<NoteListResponse>('/notes?limit=100', { token });
}

export function getNote(token: string, id: number): Promise<ApiNote> {
  return apiRequest<ApiNote>(`/notes/${id}`, { token });
}

export function createNote(token: string, note: NoteInput): Promise<ApiNote> {
  return apiRequest<ApiNote>('/notes', {
    method: 'POST',
    token,
    body: note,
  });
}

export function updateNote(
  token: string,
  id: number,
  note: NoteInput,
): Promise<ApiNote> {
  return apiRequest<ApiNote>(`/notes/${id}`, {
    method: 'PUT',
    token,
    body: note,
  });
}

export function deleteNote(token: string, id: number): Promise<void> {
  return apiRequest<void>(`/notes/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function getImageObjectKeys(content: string): string[] {
  const keys = new Set<string>();
  const tags = content.match(IMAGE_TAG) ?? [];

  for (const tag of tags) {
    const match = tag.match(IMAGE_KEY_ATTRIBUTE);
    if (match?.[2]) keys.add(match[2]);
  }

  return [...keys];
}

export async function refreshNoteImageUrls(
  token: string,
  content: string,
): Promise<string> {
  const tags = content.match(IMAGE_TAG) ?? [];
  const objectKeys = new Set<string>();

  for (const tag of tags) {
    const match = tag.match(IMAGE_KEY_ATTRIBUTE);
    if (match?.[2]) objectKeys.add(match[2]);
  }

  const downloads = new Map<string, string>();
  await Promise.all(
    [...objectKeys].map(async (objectKey) => {
      downloads.set(
        objectKey,
        IMAGE_BASE_URL
          ? getPublicImageUrl(objectKey)
          : await getSignedImageUrl(token, objectKey),
      );
    }),
  );

  return content.replace(IMAGE_TAG, (tag) => {
    const keyMatch = tag.match(IMAGE_KEY_ATTRIBUTE);
    const srcMatch = tag.match(IMAGE_SRC_ATTRIBUTE);
    const downloadUrl = keyMatch?.[2] ? downloads.get(keyMatch[2]) : undefined;
    if (!srcMatch || !downloadUrl) return tag;
    return tag.replace(
      srcMatch[0],
      `src="${escapeHtmlAttribute(downloadUrl)}"`,
    );
  });
}

export async function uploadNoteImage(
  token: string,
  uri: string,
  fileName: string,
  mimeType: string | null,
): Promise<{ objectKey: string; downloadUrl: string }> {
  const imageResponse = await fetch(uri);
  if (!imageResponse.ok) {
    throw new Error('Foto tidak dapat dibaca dari perangkat.');
  }
  const imageBlob = await imageResponse.blob();
  if (imageBlob.size === 0 || imageBlob.size > 5 * 1024 * 1024) {
    throw new Error('Ukuran foto harus lebih dari 0 dan maksimal 5 MiB.');
  }

  const contentType = getImageContentType(mimeType, fileName, imageBlob.type);
  const upload = await apiRequest<UploadUrlResponse>('/uploads/presigned-url', {
    method: 'POST',
    token,
    body: {
      file_name: fileName || `image.${getImageExtension(contentType)}`,
      content_type: contentType,
      file_size: imageBlob.size,
    },
  });

  const uploaded = await fetch(upload.upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: imageBlob,
  });
  if (!uploaded.ok) {
    throw new Error(`Unggah foto gagal (${uploaded.status}).`);
  }

  const downloadUrl = IMAGE_BASE_URL
    ? getPublicImageUrl(upload.object_key)
    : await getSignedImageUrl(token, upload.object_key);
  return { objectKey: upload.object_key, downloadUrl };
}

async function getSignedImageUrl(token: string, objectKey: string): Promise<string> {
  const download = await apiRequest<DownloadUrlResponse>(
    '/uploads/presigned-download-url',
    {
      method: 'POST',
      token,
      body: { object_key: objectKey },
    },
  );
  return download.download_url;
}

function getPublicImageUrl(objectKey: string): string {
  if (!IMAGE_BASE_URL) {
    throw new Error('EXPO_PUBLIC_IMAGE_URL belum dikonfigurasi.');
  }
  const encodedKey = objectKey.split('/').map(encodeURIComponent).join('/');
  return `${IMAGE_BASE_URL}/${encodedKey}`;
}

export function generateNoteAnswer(
  token: string,
  prompt: string,
  imageObjectKeys: string[],
): Promise<AiGenerateResponse> {
  return apiRequest<AiGenerateResponse>('/ai/generate', {
    method: 'POST',
    token,
    body: { prompt, image_object_keys: imageObjectKeys },
  });
}

export function getFirstImageUrl(content: string): string | undefined {
  const imageTag = content.match(IMAGE_TAG)?.[0];
  const src = imageTag?.match(IMAGE_SRC_ATTRIBUTE)?.[2];
  return src?.replace(/&amp;/g, '&');
}

export function htmlToPlainText(content: string): string {
  return content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function getImageContentType(
  mimeType: string | null,
  fileName: string,
  blobType: string,
): 'image/jpeg' | 'image/png' | 'image/webp' {
  const type = mimeType || blobType;
  if (type === 'image/jpeg' || type === 'image/png' || type === 'image/webp') {
    return type;
  }

  const extension = fileName.split('.').pop()?.toLowerCase();
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  throw new Error('Format foto harus JPEG, PNG, atau WebP.');
}

function getImageExtension(contentType: string): string {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  return 'jpg';
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export type ApiUser = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
};

export type AuthResponse = {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  user: ApiUser;
};

export type ApiNote = {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type NoteListResponse = {
  items: ApiNote[];
  total: number;
  limit: number;
  offset: number;
};

export type NoteInput = {
  title: string;
  content: string;
};

export type UploadUrlResponse = {
  upload_url: string;
  object_key: string;
  expires_in: number;
};

export type DownloadUrlResponse = {
  download_url: string;
  expires_in: number;
};

export type AiGenerateResponse = {
  model: string;
  output_text: string;
};

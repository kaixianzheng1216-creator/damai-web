import { uploadFormData } from '@/api/request'

// ─── Front ───────────────────────────────────────────────

export const uploadFile = (file: File): Promise<string> =>
  uploadFormData<string>('/api/file/front/file/upload', file)

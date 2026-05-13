import { uploadFormData } from '@/api/request'

// ─── Front ───────────────────────────────────────────────

export const uploadFile = (file: File): Promise<string> =>
  uploadFormData<string>('/api/file/front/file/upload', file)

export const uploadAdminFile = (file: File): Promise<string> =>
  uploadFormData<string>('/api/file/admin/file/upload', file)

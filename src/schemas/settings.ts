import { z } from 'zod';

export const appSettingsSchema = z.object({
  id: z.literal('1'),
  lastBackupDate: z.date().nullable(),
  currentView: z.enum(['quick', 'category', 'time']),
  theme: z.enum(['light', 'dark', 'system']),
  textSize: z.enum(['default', 'large', 'larger']),
  highContrast: z.boolean(),
  reducedMotion: z.boolean(),
});

/** Patch shape for `updateSettings` — every field optional; `id` is never edited. */
export const updateSettingsSchema = appSettingsSchema.partial();

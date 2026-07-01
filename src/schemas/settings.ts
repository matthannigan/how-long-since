import { z } from 'zod';

export const appSettingsSchema = z.object({
  id: z.literal('1'),
  lastBackupDate: z.date().nullable(),
  currentView: z.enum(['category', 'time']),
  theme: z.enum(['light', 'dark', 'system']),
  textSize: z.enum(['default', 'large', 'larger']),
  highContrast: z.boolean(),
  reducedMotion: z.boolean(),
});

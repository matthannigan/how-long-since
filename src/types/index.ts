import type { z } from 'zod';

import type { categorySchema } from '@/schemas/category';
import type { completionSchema } from '@/schemas/completion';
import type { appSettingsSchema } from '@/schemas/settings';
import type { taskSchema } from '@/schemas/task';

export type Task = z.infer<typeof taskSchema>;
export type Category = z.infer<typeof categorySchema>;
export type AppSettings = z.infer<typeof appSettingsSchema>;
export type Completion = z.infer<typeof completionSchema>;

export type TimeCommitment = NonNullable<Task['timeCommitment']>;
export type FrequencyUnit = NonNullable<Task['expectedFrequency']>['unit'];

export type OverdueStatus = 'none' | 'due-soon' | 'overdue' | 'very-overdue';

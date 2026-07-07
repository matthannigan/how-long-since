import { z } from 'zod';

// One row per "Just Done" (bursts included) plus synthesized bootstrap rows —
// the append-only completion log behind Phase 2's insights (B6), shipped
// silently in 1.0.0 so history accrues from the first real completion. No UI
// yet: `markTaskComplete` appends, `undoComplete` deletes, nothing edits.
export const completionSchema = z.object({
  id: z.uuid(),
  taskId: z.uuid(),
  completedAt: z.date(),
});

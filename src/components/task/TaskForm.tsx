import { zodResolver } from '@hookform/resolvers/zod';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useId, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { CategoryForm } from '@/components/category/CategoryForm';
import { InstanceLabelsField } from '@/components/task/InstanceLabelsField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioPill, RadioPills } from '@/components/ui/radio-pills';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/lib/db/schema';
import { suggestLabels } from '@/lib/series';
import { createTask, createTaskSeries, updateTask } from '@/lib/tasks';
import { formatElapsed } from '@/lib/time-format';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import type { Category, Task } from '@/types';

// timeCommitment enum → dot count + label (mirrors TaskCard's TIME_COMMITMENT_META).
const TIME_OPTIONS: ReadonlyArray<{ value: string; dots: number; label: string }> = [
  { value: '15min', dots: 1, label: '15 min' },
  { value: '30min', dots: 2, label: '30 min' },
  { value: '1hr', dots: 3, label: '1 hr' },
  { value: '2hrs', dots: 4, label: '2 hrs' },
  { value: '4hrs+', dots: 5, label: '4+ hrs' },
];

const FREQ_UNITS: ReadonlyArray<{ value: 'day' | 'week' | 'month' | 'year'; label: string }> = [
  { value: 'day', label: 'Days' },
  { value: 'week', label: 'Weeks' },
  { value: 'month', label: 'Months' },
  { value: 'year', label: 'Years' },
];

const taskFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Please add a task name.')
      .max(128, 'Task name is too long. Max 128 characters.'),
    categoryId: z.string().min(1, 'Please choose a category.'),
    timeCommitment: z.enum(['', '15min', '30min', '1hr', '2hrs', '4hrs+']),
    freqValue: z.string(),
    freqUnit: z.enum(['day', 'week', 'month', 'year']),
    lastDone: z.enum(['none', 'today', 'yesterday', 'date']),
    lastDoneDate: z.string(),
    description: z.string().max(512, 'Description is too long. Max 512 characters.'),
    notes: z.string().max(512, 'Notes are too long. Max 512 characters.'),
    // Edit mode only — create mode collects labels as chips outside RHF.
    instanceLabel: z.string().trim().max(40, 'Keep this label under 40 characters.'),
  })
  .refine(
    (v) =>
      v.freqValue.trim() === '' ||
      (Number.isInteger(Number(v.freqValue)) && Number(v.freqValue) > 0),
    { path: ['freqValue'], message: 'Enter how often, as a whole number above 0.' },
  )
  .refine((v) => v.lastDone !== 'date' || v.lastDoneDate !== '', {
    path: ['lastDoneDate'],
    message: 'Pick a date.',
  });

type TaskFormValues = z.infer<typeof taskFormSchema>;

const LEGEND = 'text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-ink-secondary';
const REQUIRED = 'ml-2 text-[0.625rem] font-medium tracking-normal text-ink-meta-aa normal-case';
const ERROR = 'mt-1 text-xs text-overdue-aa';

/** Local YYYY-MM-DD for a date (for <input type=date> and comparisons). */
function toDateInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Parse a YYYY-MM-DD string as a local date at noon (dodges TZ off-by-one). */
function parseDateInput(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

interface TaskFormProps {
  mode: 'create' | 'edit';
  task?: Task;
  categories: Category[];
  /** Called after a successful save (parent closes the modal or navigates back). */
  onDone: () => void;
  onCancel: () => void;
  /** Injectable clock so "Today"/"Yesterday" resolution is deterministic in tests. */
  now?: Date;
}

/**
 * The Add/Edit task form (app-pages §2): five controls — name, category chips,
 * time estimate, expected frequency, last done — plus a collapsed Description /
 * Notes section. One component for both modes; the parent supplies the reactive
 * category list and decides how the shell (modal vs page) frames it. Writes go
 * through `lib/tasks`; a rejected write surfaces friendly copy.
 */
export function TaskForm({
  mode,
  task,
  categories,
  onDone,
  onCancel,
  now = new Date(),
}: TaskFormProps) {
  const lastUsedCategoryId = useUIStore((s) => s.lastUsedCategoryId);
  const setLastUsedCategory = useUIStore((s) => s.setLastUsedCategory);

  const originalLast = task?.lastCompletedAt ?? null;
  const originalDateStr = originalLast ? toDateInputValue(originalLast) : '';

  const initialCategoryId =
    task?.categoryId ??
    (lastUsedCategoryId && categories.some((c) => c.id === lastUsedCategoryId)
      ? lastUsedCategoryId
      : (categories[0]?.id ?? ''));

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm<TaskFormValues>({
    mode: 'onChange',
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      name: task?.name ?? '',
      categoryId: initialCategoryId,
      timeCommitment: task?.timeCommitment ?? '',
      freqValue: task?.expectedFrequency ? String(task.expectedFrequency.value) : '',
      freqUnit: task?.expectedFrequency?.unit ?? 'week',
      lastDone: originalLast ? 'date' : 'none',
      lastDoneDate: originalDateStr,
      description: task?.description ?? '',
      notes: task?.notes ?? '',
      instanceLabel: task?.instanceLabel ?? '',
    },
  });

  const nameId = useId();
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showDetails, setShowDetails] = useState(
    mode === 'edit' && !!(task?.description || task?.notes),
  );
  // "Track in multiple places" (create mode): chips live outside RHF — they
  // never affect form validity, and one task is created per chip on save.
  const [showPlaces, setShowPlaces] = useState(false);
  const [placeLabels, setPlaceLabels] = useState<string[]>([]);

  const nameValue = watch('name');
  const descriptionValue = watch('description');
  const notesValue = watch('notes');
  const timeValue = watch('timeCommitment');
  const lastDone = watch('lastDone');
  const lastDoneDate = watch('lastDoneDate');
  const categoryIdValue = watch('categoryId');

  // Label suggestions recycle instance labels already used in the selected
  // category (the "tiny recommendation engine") — they follow category changes.
  const allTasks = useLiveQuery(() => db.tasks.toArray(), []);
  const placeSuggestions =
    mode === 'create' ? suggestLabels(allTasks ?? [], categoryIdValue, placeLabels) : [];

  /** The date the current last-done selection resolves to (null = never done). */
  function resolveLastCompleted(values: TaskFormValues): Date | null {
    switch (values.lastDone) {
      case 'today':
        return now;
      case 'yesterday':
        return new Date(now.getTime() - 864e5);
      case 'date':
        // Unchanged in edit → keep the exact original timestamp (don't lose the time).
        if (values.lastDoneDate === originalDateStr && originalLast) return originalLast;
        return parseDateInput(values.lastDoneDate);
      default:
        return null;
    }
  }

  const onSubmit = async (values: TaskFormValues) => {
    const input = {
      name: values.name,
      categoryId: values.categoryId,
      description: values.description,
      notes: values.notes,
      timeCommitment: values.timeCommitment === '' ? undefined : values.timeCommitment,
      expectedFrequency:
        values.freqValue.trim() === ''
          ? undefined
          : { value: Number(values.freqValue), unit: values.freqUnit },
      lastCompletedAt: resolveLastCompleted(values),
    };
    try {
      if (mode === 'create') {
        if (placeLabels.length > 0) {
          const created = await createTaskSeries(input, placeLabels);
          toast.success(created.length > 1 ? `${created.length} tasks added` : 'Task added');
        } else {
          await createTask(input);
          toast.success('Task added');
        }
        setLastUsedCategory(values.categoryId);
      } else if (task) {
        // The key is always present so an emptied label clears the stored one.
        await updateTask(task.id, {
          ...input,
          instanceLabel: values.instanceLabel === '' ? undefined : values.instanceLabel,
        });
        toast.success('Task updated');
      }
      onDone();
    } catch {
      toast.error("Changes couldn't be saved. Try again.");
    }
  };

  // Preview of the resolved last-done date, shown as a confirming sub-line.
  const lastDonePreview =
    lastDone === 'none' || (lastDone === 'date' && lastDoneDate === '')
      ? null
      : (() => {
          const resolved = resolveLastCompleted({ lastDone, lastDoneDate } as TaskFormValues);
          if (!resolved) return null;
          const label = resolved.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          return `Set to ${label} · ${formatElapsed(resolved, now)}`;
        })();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Task name */}
      <div>
        <Label htmlFor={nameId} className={LEGEND}>
          Task name
          <span className={REQUIRED}>Required</span>
        </Label>
        <div className="mt-1.5">
          <Input
            id={nameId}
            autoFocus
            placeholder="What needs to be done?"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${nameId}-error` : `${nameId}-count`}
            {...register('name')}
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.name ? (
              <p id={`${nameId}-error`} role="alert" className="text-xs text-overdue-aa">
                {errors.name.message}
              </p>
            ) : (
              <span />
            )}
            <span
              id={`${nameId}-count`}
              className={cn(
                'text-[0.6875rem]',
                nameValue.length > 128 ? 'text-overdue-aa' : 'text-ink-meta-aa',
              )}
            >
              {nameValue.length}/128
            </span>
          </div>
        </div>
      </div>

      {/* Category */}
      <fieldset>
        <legend className={LEGEND}>
          Category
          <span className={REQUIRED}>Required</span>
        </legend>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <RadioPills value={field.value} onValueChange={field.onChange} aria-label="Category">
                {categories.map((category) => {
                  const selected = field.value === category.id;
                  return (
                    <RadioPill
                      key={category.id}
                      value={category.id}
                      className={cn(
                        'min-h-11 rounded-chip border-[1.5px] border-border-default bg-surface-card px-3 text-[0.8125rem] font-semibold text-ink',
                        selected && 'border-2',
                      )}
                      style={
                        selected && category.color
                          ? { borderColor: category.color, backgroundColor: `${category.color}1a` }
                          : undefined
                      }
                    >
                      <span
                        className="size-[11px] rounded-full"
                        style={{ backgroundColor: category.color }}
                        aria-hidden="true"
                      />
                      {category.name}
                    </RadioPill>
                  );
                })}
              </RadioPills>
            )}
          />
          <button
            type="button"
            onClick={() => setShowNewCategory(true)}
            className="inline-flex min-h-11 items-center rounded-chip border-[1.5px] border-dashed border-border-soft px-3 text-[0.8125rem] font-semibold text-ink-secondary outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
          >
            + New
          </button>
        </div>
        {errors.categoryId && (
          <p className={ERROR} role="alert">
            {errors.categoryId.message}
          </p>
        )}

        {showNewCategory && (
          <div className="mt-3 rounded-input border border-border-default bg-surface-sunk/40 p-3">
            <p className="mb-2 font-display text-sm font-semibold text-ink">New Category</p>
            <CategoryForm
              mode="create"
              autoFocusName
              onSaved={(created) => {
                if (created) setValue('categoryId', created.id, { shouldValidate: true });
                setShowNewCategory(false);
              }}
              onCancel={() => setShowNewCategory(false)}
            />
          </div>
        )}
      </fieldset>

      {/* Instances: fan-out chips (create) / plain label field (edit) */}
      {mode === 'create' ? (
        <div>
          <button
            type="button"
            onClick={() => setShowPlaces((v) => !v)}
            aria-expanded={showPlaces}
            className="flex min-h-9 items-center gap-1 text-sm font-medium text-ink-meta-aa hover:text-ink"
          >
            {showPlaces ? (
              <ChevronUp className="size-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="size-4" aria-hidden="true" />
            )}
            Track in multiple places
            {placeLabels.length > 0 && !showPlaces && ` (${placeLabels.length})`}
          </button>
          {showPlaces && (
            <div className="mt-3">
              <InstanceLabelsField
                labels={placeLabels}
                onChange={setPlaceLabels}
                suggestions={placeSuggestions}
                inputId={`${nameId}-places`}
              />
            </div>
          )}
        </div>
      ) : (
        <div>
          <Label htmlFor={`${nameId}-place`} className={LEGEND}>
            Where — or who?
          </Label>
          <Input
            id={`${nameId}-place`}
            maxLength={40}
            placeholder="e.g. Guest room, Luna"
            className="mt-1.5"
            aria-invalid={!!errors.instanceLabel}
            {...register('instanceLabel')}
          />
          {errors.instanceLabel && (
            <p className={ERROR} role="alert">
              {errors.instanceLabel.message}
            </p>
          )}
        </div>
      )}

      {/* Time estimate */}
      <fieldset>
        <div className="flex items-center justify-between">
          <legend className={LEGEND}>Time estimate</legend>
          {timeValue !== '' && (
            <button
              type="button"
              onClick={() => setValue('timeCommitment', '', { shouldValidate: true })}
              className="text-[0.6875rem] font-medium text-ink-meta-aa underline-offset-2 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <Controller
          control={control}
          name="timeCommitment"
          render={({ field }) => (
            <RadioPills
              value={field.value}
              onValueChange={field.onChange}
              aria-label="Time estimate"
              className="mt-1.5"
            >
              {TIME_OPTIONS.map((opt) => (
                <RadioPill
                  key={opt.value}
                  value={opt.value}
                  className="min-h-9 gap-1 rounded-chip border-[1.5px] border-border-default bg-surface-card px-3 text-[0.8125rem] font-medium text-ink data-[state=checked]:border-accent data-[state=checked]:bg-accent/10 data-[state=checked]:text-accent-deep"
                >
                  <span aria-hidden="true" className="text-[0.5em] tracking-tight">
                    {'●'.repeat(opt.dots)}
                  </span>
                  {opt.label}
                </RadioPill>
              ))}
            </RadioPills>
          )}
        />
      </fieldset>

      {/* Expected frequency */}
      <fieldset>
        <legend className={LEGEND}>Should happen every</legend>
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="e.g. 2"
            aria-label="Frequency amount"
            aria-invalid={!!errors.freqValue}
            className="w-24 font-display text-xl"
            {...register('freqValue')}
          />
          <Controller
            control={control}
            name="freqUnit"
            render={({ field }) => (
              <RadioPills
                value={field.value}
                onValueChange={field.onChange}
                aria-label="Frequency unit"
                className="gap-1 rounded-input bg-surface-track p-1"
              >
                {FREQ_UNITS.map((unit) => (
                  <RadioPill
                    key={unit.value}
                    value={unit.value}
                    className="min-h-9 grow rounded-[10px] px-3 text-[0.8125rem] font-medium text-ink-secondary data-[state=checked]:bg-accent data-[state=checked]:font-bold data-[state=checked]:text-white"
                  >
                    {unit.label}
                  </RadioPill>
                ))}
              </RadioPills>
            )}
          />
        </div>
        {errors.freqValue ? (
          <p className={ERROR} role="alert">
            {errors.freqValue.message}
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-ink-meta-aa">
            We&rsquo;ll gently flag it once this much time has passed.
          </p>
        )}
      </fieldset>

      {/* Last done */}
      <fieldset>
        <legend className={LEGEND}>Last done</legend>
        <Controller
          control={control}
          name="lastDone"
          render={({ field }) => (
            <RadioPills
              value={field.value === 'none' ? '' : field.value}
              onValueChange={field.onChange}
              aria-label="Last done"
              className="mt-1.5"
            >
              {(['today', 'yesterday', 'date'] as const).map((value) => (
                <RadioPill
                  key={value}
                  value={value}
                  className="min-h-11 rounded-chip border-[1.5px] border-border-default bg-surface-card px-3 text-[0.8125rem] font-medium text-ink data-[state=checked]:border-accent data-[state=checked]:bg-accent/10 data-[state=checked]:text-accent-deep"
                >
                  {value === 'today' ? 'Today' : value === 'yesterday' ? 'Yesterday' : 'Pick date'}
                </RadioPill>
              ))}
            </RadioPills>
          )}
        />
        {lastDone === 'date' && (
          <div className="mt-2">
            <Input
              type="date"
              aria-label="Last done date"
              max={toDateInputValue(now)}
              aria-invalid={!!errors.lastDoneDate}
              className="w-fit"
              {...register('lastDoneDate')}
            />
          </div>
        )}
        {errors.lastDoneDate && (
          <p className={ERROR} role="alert">
            {errors.lastDoneDate.message}
          </p>
        )}
        {lastDonePreview && (
          <div className="mt-1.5 flex items-center gap-3">
            <p className="text-xs text-ink-meta-aa">{lastDonePreview}</p>
            <button
              type="button"
              onClick={() => setValue('lastDone', 'none', { shouldValidate: true })}
              className="text-[0.6875rem] font-medium text-ink-meta-aa underline-offset-2 hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </fieldset>

      {/* Description + Notes (collapsed) */}
      <div>
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          aria-expanded={showDetails}
          className="flex min-h-9 items-center gap-1 text-sm font-medium text-ink-meta-aa hover:text-ink"
        >
          {showDetails ? (
            <ChevronUp className="size-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="size-4" aria-hidden="true" />
          )}
          Add details
        </button>
        {showDetails && (
          <div className="mt-3 space-y-4">
            <div>
              <Label htmlFor={`${nameId}-desc`} className={LEGEND}>
                Description
              </Label>
              <Textarea
                id={`${nameId}-desc`}
                maxLength={512}
                rows={2}
                placeholder="Any extra context?"
                className="mt-1.5"
                aria-invalid={!!errors.description}
                {...register('description')}
              />
              <div className="mt-1 flex justify-between">
                {errors.description ? (
                  <p role="alert" className="text-xs text-overdue-aa">
                    {errors.description.message}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-[0.6875rem] text-ink-meta-aa">
                  {descriptionValue.length}/512
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor={`${nameId}-notes`} className={LEGEND}>
                Notes
              </Label>
              <Textarea
                id={`${nameId}-notes`}
                maxLength={512}
                rows={2}
                placeholder="Private notes for this task"
                className="mt-1.5"
                aria-invalid={!!errors.notes}
                {...register('notes')}
              />
              <div className="mt-1 flex justify-between">
                {errors.notes ? (
                  <p role="alert" className="text-xs text-overdue-aa">
                    {errors.notes.message}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-[0.6875rem] text-ink-meta-aa">{notesValue.length}/512</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 border-t border-border-default pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid || isSubmitting}>
          {mode === 'create' ? 'Save task' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}

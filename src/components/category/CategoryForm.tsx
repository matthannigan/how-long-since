import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { useId } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioPill, RadioPills } from '@/components/ui/radio-pills';
import { createCategory, updateCategory } from '@/lib/categories';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

import { ICON_NAMES } from './category-icons';
import { CategoryIcon } from './CategoryIcon';

/** Selectable base hues (style-guide §1.4) + a couple of extra custom hues. */
const COLOR_CHOICES: ReadonlyArray<{ hex: string; name: string }> = [
  { hex: '#3B82F6', name: 'Blue' },
  { hex: '#8B5CF6', name: 'Violet' },
  { hex: '#EC4899', name: 'Pink' },
  { hex: '#10B981', name: 'Green' },
  { hex: '#F59E0B', name: 'Amber' },
  { hex: '#EF4444', name: 'Red' },
  { hex: '#6366F1', name: 'Indigo' },
  { hex: '#14B8A6', name: 'Teal' },
  { hex: '#F97316', name: 'Orange' },
  { hex: '#84CC16', name: 'Lime' },
  { hex: '#F43F5E', name: 'Rose' },
  { hex: '#0EA5E9', name: 'Sky' },
];

const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Please add a category name.')
    .max(128, 'Category name is too long. Max 128 characters.'),
  color: z.string(),
  icon: z.string(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const LEGEND = 'text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-ink-secondary';

interface CategoryFormProps {
  mode: 'create' | 'edit';
  category?: Category;
  /** Create returns the new `Category`; edit returns `null`. */
  onSaved: (category: Category | null) => void;
  onCancel: () => void;
  /** Autofocus the name field (used by the inline "+ New" flow). */
  autoFocusName?: boolean;
}

/**
 * Create/edit a category: name (required) + color swatch picker + optional icon
 * picker. Reused by the task form's inline "+ New" flow and by Manage Categories
 * (Step 7b). Writes go through `lib/categories`; a rejected write surfaces the
 * content-guide "Changes couldn't be saved" copy.
 */
export function CategoryForm({
  mode,
  category,
  onSaved,
  onCancel,
  autoFocusName,
}: CategoryFormProps) {
  const nameId = useId();
  const nameErrorId = `${nameId}-error`;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    mode: 'onChange',
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name ?? '',
      color: category?.color ?? COLOR_CHOICES[0].hex,
      icon: category?.icon ?? '',
    },
  });

  const onSubmit = async (values: CategoryFormValues) => {
    const data = { name: values.name, color: values.color, icon: values.icon || undefined };
    try {
      if (mode === 'create') {
        const created = await createCategory(data);
        onSaved(created);
      } else if (category) {
        await updateCategory(category.id, data);
        onSaved(null);
      }
    } catch {
      toast.error("Changes couldn't be saved. Try again.");
    }
  };

  const submit = () => void handleSubmit(onSubmit)();

  return (
    // A <div>, NOT a <form>: this renders inline inside the task form's <form>,
    // and nesting forms hijacks submission. Enter and the button call submit().
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={nameId} className={LEGEND}>
          Category name
        </Label>
        <Input
          id={nameId}
          autoFocus={autoFocusName}
          maxLength={128}
          placeholder="e.g. Child-Related"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? nameErrorId : undefined}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          {...register('name')}
        />
        {errors.name && (
          <p id={nameErrorId} role="alert" className="text-xs text-overdue-aa">
            {errors.name.message}
          </p>
        )}
      </div>

      <fieldset className="space-y-1.5">
        <legend className={LEGEND}>Color</legend>
        <Controller
          control={control}
          name="color"
          render={({ field }) => (
            <RadioPills
              value={field.value}
              onValueChange={field.onChange}
              aria-label="Category color"
            >
              {COLOR_CHOICES.map((choice) => (
                <RadioPill
                  key={choice.hex}
                  value={choice.hex}
                  aria-label={choice.name}
                  className="size-9 rounded-full border-2 border-transparent text-white data-[state=checked]:border-ink"
                  style={{ backgroundColor: choice.hex }}
                >
                  {field.value === choice.hex && <Check className="size-4" aria-hidden="true" />}
                </RadioPill>
              ))}
            </RadioPills>
          )}
        />
      </fieldset>

      <fieldset className="space-y-1.5">
        <legend className={LEGEND}>Icon (optional)</legend>
        <Controller
          control={control}
          name="icon"
          render={({ field }) => (
            <RadioPills
              value={field.value}
              onValueChange={field.onChange}
              aria-label="Category icon"
            >
              <RadioPill
                value=""
                className={cn(
                  'min-h-11 rounded-chip border-[1.5px] border-border-default bg-surface-card px-3 text-sm text-ink-meta-aa',
                  'data-[state=checked]:border-accent data-[state=checked]:text-ink',
                )}
              >
                None
              </RadioPill>
              {ICON_NAMES.map((name) => (
                <RadioPill
                  key={name}
                  value={name}
                  aria-label={name.replace(/-/g, ' ')}
                  className={cn(
                    'size-11 rounded-chip border-[1.5px] border-border-default bg-surface-card text-ink-secondary',
                    'data-[state=checked]:border-accent data-[state=checked]:text-accent-deep',
                  )}
                >
                  <CategoryIcon name={name} className="size-[18px]" />
                </RadioPill>
              ))}
            </RadioPills>
          )}
        />
      </fieldset>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={submit} disabled={isSubmitting}>
          {mode === 'create' ? 'Add category' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}

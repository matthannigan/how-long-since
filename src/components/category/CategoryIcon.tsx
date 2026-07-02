import { ICON_MAP } from './category-icons';

interface CategoryIconProps {
  name: string;
  className?: string;
}

/** Render a category's Lucide icon by its stored name, or nothing if unknown. */
export function CategoryIcon({ name, className }: CategoryIconProps) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className={className} aria-hidden="true" />;
}

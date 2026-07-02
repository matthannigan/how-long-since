import {
  Baby,
  Bed,
  Brush,
  Car,
  Dumbbell,
  HeartPulse,
  House,
  Leaf,
  type LucideIcon,
  Monitor,
  PawPrint,
  ShowerHead,
  Sofa,
  Sparkles,
  Utensils,
  Wrench,
} from 'lucide-react';

/**
 * Category icon registry: the kebab-case name stored on `Category.icon` (the
 * same names the default categories seed with) → its Lucide component. Curated
 * for the Step 7 picker; extend as needed. Kept in a data-only module so the
 * `CategoryIcon` component file can stay a component-only export (react-refresh).
 */
export const ICON_MAP: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  utensils: Utensils,
  'shower-head': ShowerHead,
  bed: Bed,
  sofa: Sofa,
  house: House,
  car: Car,
  monitor: Monitor,
  'heart-pulse': HeartPulse,
  'paw-print': PawPrint,
  leaf: Leaf,
  wrench: Wrench,
  brush: Brush,
  baby: Baby,
  dumbbell: Dumbbell,
};

/** The selectable icon names, in registry order. */
export const ICON_NAMES = Object.keys(ICON_MAP);

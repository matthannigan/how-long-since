import { createFileRoute } from '@tanstack/react-router';

import { ByCategoryView } from '@/components/category/ByCategoryView';

export const Route = createFileRoute('/category')({
  component: ByCategoryView,
});

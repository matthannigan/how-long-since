import { createFileRoute } from '@tanstack/react-router';

import { ManageCategories } from '@/components/category/ManageCategories';

export const Route = createFileRoute('/categories')({
  component: ManageCategories,
});

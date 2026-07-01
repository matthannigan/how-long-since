import { createFileRoute } from '@tanstack/react-router';

import { ByTimeView } from '@/components/task/ByTimeView';

export const Route = createFileRoute('/time')({
  component: ByTimeView,
});

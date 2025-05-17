import { Suspense } from 'react';
import { DishCardSkeletonGrid } from '@/app/components/ui/DishCardSkeleton';
import ShopClient from './ShopClient';

export default function ShopPage() {
  return (
    <Suspense fallback={<DishCardSkeletonGrid />}>
      <ShopClient />
    </Suspense>
  );
}

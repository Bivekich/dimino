'use client';

import { Suspense } from 'react';
import Header from '@/app/components/layout/Header';
import Cart from '@/app/components/ui/Cart';
import CitySelector from '@/app/components/ui/CitySelector';
import { useSearchParams } from 'next/navigation';

function ShopLayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const selectedCity = searchParams.get('city');

  return (
    <>
      <Header>
        <div className="flex items-center gap-4">
          <CitySelector forceSelection={!selectedCity} />
          <Cart selectedCity={selectedCity} />
        </div>
      </Header>
      <div className="pt-[72px]">{children}</div>
    </>
  );
}

export default function ShopLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <Header>
          <div className="flex items-center gap-4">
            <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </Header>
      }
    >
      <ShopLayoutContent>{children}</ShopLayoutContent>
    </Suspense>
  );
}

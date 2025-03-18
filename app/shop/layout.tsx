'use client';

import Header from '@/app/components/layout/Header';
import Cart from '@/app/components/ui/Cart';
import CitySelector from '@/app/components/ui/CitySelector';
import { useSearchParams } from 'next/navigation';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

import { Suspense } from 'react';
import OrderClient from './OrderClient';

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 px-4 text-center">
          Загрузка...
        </div>
      }
    >
      <OrderClient />
    </Suspense>
  );
}

import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Suspense } from 'react';

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order: string }>;
}) {
  const { order } = await searchParams;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-semibold">Заказ оформлен!</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Спасибо за заказ! Номер вашего заказа: {order}
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            Мы свяжемся с вами в ближайшее время для подтверждения.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Вернуться в магазин
          </Link>
        </div>
      </div>
    </Suspense>
  );
}

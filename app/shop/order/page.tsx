'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '@/app/hooks/useCart';
import OrderForm from '@/app/components/ui/OrderForm';

export default function OrderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedCity = searchParams.get('city');
  const { items } = useCart();

  if (!selectedCity) {
    router.push('/shop');
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 -ml-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold mb-4">Список пуст</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">
            Добавьте деликатесы в список, чтобы узнать об их наличии
          </p>
          <Button
            onClick={() => router.push('/shop')}
            className="rounded-full bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-700 hover:to-amber-500"
          >
            Вернуться в каталог
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6 -ml-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Назад
      </Button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-8">Узнать о наличии</h1>
        <OrderForm selectedCity={selectedCity} items={items} />
      </div>
    </div>
  );
}

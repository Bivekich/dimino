'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/app/hooks/useCart';
import { useRouter, useSearchParams } from 'next/navigation';

interface CartProps {
  selectedCity: string | null;
}

export default function Cart({ selectedCity }: CartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { items, updateQuantity } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCitySelect = () => {
    setIsOpen(false);
    router.push('/shop');
  };

  const handleOrderClick = () => {
    if (!selectedCity) return;

    const params = new URLSearchParams(searchParams);
    params.set('city', selectedCity);
    router.push(`/shop/order?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:text-amber-500 transition-colors"
        >
          <ShoppingCart className="h-5 w-5" />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 text-[10px] font-medium text-white flex items-center justify-center">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Список деликатесов</SheetTitle>
        </SheetHeader>
        {items.length > 0 ? (
          <div className="mt-8 space-y-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    {item.weight} г
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </Button>
                  <span className="min-w-[2rem] text-center">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}

            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
              {selectedCity ? (
                <Button
                  size="lg"
                  className="w-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-700 hover:to-amber-500"
                  onClick={handleOrderClick}
                >
                  Узнать о наличии
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={handleCitySelect}
                >
                  Выберите город
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <ShoppingCart className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
            <h3 className="font-medium mb-2">Список пуст</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Добавьте деликатесы из нашего ассортимента
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

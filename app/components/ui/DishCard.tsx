'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCart } from '@/app/hooks/useCart';
import { Dish } from '@/app/types';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, ImageIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface DishCardProps {
  dish: Dish;
}

export default function DishCard({ dish }: DishCardProps) {
  const { addToCart, updateQuantity, items } = useCart();
  const searchParams = useSearchParams();
  const city = searchParams.get('city') || '';

  const existingItem = items.find((item) => item.id === dish.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(dish);
  };

  const handleUpdateQuantity = (e: React.MouseEvent, newQuantity: number) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(dish.id, newQuantity);
  };

  const mainImage = dish.media.find((m) => m.type === 'image')?.url;
  const hasVideo = dish.media.some((m) => m.type === 'video');

  return (
    <Link href={`/shop/dish/${dish.id}?city=${city}`} className="block w-full">
      <div className="group relative overflow-hidden rounded-lg md:rounded-xl bg-zinc-100 dark:bg-zinc-800 cursor-pointer shadow-sm hover:shadow-md transition-shadow">
        <div className="aspect-square">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={dish.name}
              width={400}
              height={400}
              className="object-cover w-full h-full transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
              <ImageIcon className="h-8 w-8 md:h-12 md:w-12 mb-1 md:mb-2" />
              <p className="text-[10px] md:text-sm text-center px-2 md:px-4">
                Изображение появится в ближайшее время
              </p>
            </div>
          )}
        </div>

        {hasVideo && (
          <div className="absolute top-1 md:top-2 left-1 md:left-2 bg-black/60 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
            Видео
          </div>
        )}

        <div className="absolute top-1 md:top-2 right-1 md:right-2 z-10">
          <Badge
            variant={dish.inStock ? 'success' : 'secondary'}
            className="shadow-md text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1"
          >
            {dish.inStock ? 'В наличии' : 'Под заказ'}
          </Badge>
        </div>

        <div className="absolute inset-0 flex items-end">
          <div className="w-full bg-gradient-to-t from-black/70 to-transparent p-2 md:p-4">
            <div className="flex items-start justify-between gap-1 md:gap-4">
              <div className="max-w-[70%]">
                <h3 className="font-medium text-xs md:text-base text-white mb-0.5 md:mb-1 line-clamp-2">
                  {dish.name}
                </h3>
                <div className="text-[10px] md:text-sm text-zinc-200">
                  {dish.weight} г
                </div>
              </div>
              <div>
                {existingItem ? (
                  <div className="flex items-center bg-white/90 rounded-full">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) =>
                        handleUpdateQuantity(e, existingItem.quantity - 1)
                      }
                      className="h-6 w-6 md:h-8 md:w-8 rounded-full text-black"
                    >
                      <Minus className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <span className="mx-1 md:mx-2 text-black font-medium text-xs md:text-sm">
                      {existingItem.quantity}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) =>
                        handleUpdateQuantity(e, existingItem.quantity + 1)
                      }
                      className="h-6 w-6 md:h-8 md:w-8 rounded-full text-black"
                    >
                      <Plus className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleAddToCart}
                    className="rounded-full bg-white/90 text-black hover:bg-white text-[10px] md:text-sm h-6 md:h-8 px-1.5 md:px-3"
                  >
                    В список
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

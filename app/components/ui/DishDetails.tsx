'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/app/hooks/useCart';
import { Scale, Plus, Minus, ArrowLeft, Play, ImageIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dish } from '@/app/types';
import { Badge } from '@/components/ui/badge';

interface DishDetailsProps {
  dish: Dish;
}

export default function DishDetails({ dish }: DishDetailsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const city = searchParams.get('city') || '';
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart, updateQuantity, items } = useCart();

  const existingItem = items.find((item) => item.id === dish.id);
  const videos = dish.media.filter((m) => m.type === 'video');
  const images = dish.media.filter((m) => m.type === 'image');
  const allMedia = [...videos, ...images];
  const mainMedia = allMedia.length > 0 ? allMedia[currentImageIndex] : null;

  const currentQuantity = existingItem?.quantity || 0;

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

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? dish.media.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === dish.media.length - 1 ? 0 : prev + 1
    );
  };

  // Сохраняем параметр города при возврате назад
  const handleBack = () => {
    if (city) {
      router.push(`/shop?city=${city}`);
    } else {
      router.back();
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
      <Button
        variant="ghost"
        className="mb-4 md:mb-6 -ml-2"
        onClick={handleBack}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Назад
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-4 md:space-y-6">
          <div className="relative group">
            <div className="absolute top-4 right-4 z-10">
              <Badge
                variant={dish.availability?.inStock ? 'success' : 'secondary'}
                className="shadow-md"
              >
                {dish.availability?.inStock ? 'В наличии' : 'Под заказ'}
              </Badge>
            </div>

            <div className="aspect-square relative rounded-xl md:rounded-2xl overflow-hidden shadow-md">
              {!mainMedia ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500">
                  <ImageIcon className="h-12 w-12 md:h-16 md:w-16 mb-2" />
                  <p className="text-sm text-center px-4">
                    Изображение товара появится в ближайшее время
                  </p>
                  <p className="text-xs mt-2">Товар доступен под заказ</p>
                </div>
              ) : mainMedia.type === 'video' ? (
                <div className="w-full h-full">
                  <video
                    src={mainMedia.url}
                    className="w-full h-full object-cover"
                    controls
                    poster={dish.media.find((m) => m.type === 'image')?.url}
                  />
                </div>
              ) : (
                <Image
                  src={mainMedia.url}
                  alt={`${dish.name} - изображение ${currentImageIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              )}
            </div>

            {dish.media.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 h-8 w-8 md:h-10 md:w-10 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  onClick={handlePreviousImage}
                >
                  <ArrowLeft className="h-4 w-4 md:h-6 md:w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 h-8 w-8 md:h-10 md:w-10 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  onClick={handleNextImage}
                >
                  <ArrowLeft className="h-4 w-4 md:h-6 md:w-6 rotate-180" />
                </Button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {dish.media.map((_, index) => (
                    <button
                      key={index}
                      className={`h-1.5 md:h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'w-3 md:w-4 bg-white'
                          : 'w-1.5 md:w-2 bg-white/50'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Миниатюры для мобильных устройств - горизонтальный скролл */}
          {dish.media.length > 1 && (
            <div className="flex overflow-x-auto pb-2 space-x-2 md:hidden scrollbar-hide">
              {dish.media.map((media, index) => (
                <button
                  key={index}
                  className={`flex-shrink-0 w-16 h-16 relative rounded-lg overflow-hidden border transition-all ${
                    index === currentImageIndex
                      ? 'border-amber-500'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  {media.type === 'video' ? (
                    <div className="w-full h-full relative">
                      <Image
                        src={
                          dish.media.find((m) => m.type === 'image')?.url ||
                          media.url
                        }
                        alt={`${dish.name} - видео ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={media.url}
                      alt={`${dish.name} - изображение ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 md:space-y-6 mt-2 md:mt-0">
          <div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 md:mb-4">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-2 md:mb-0">
                {dish.name}
              </h1>
              <Badge
                variant={dish.availability?.inStock ? 'success' : 'secondary'}
                className="self-start md:self-auto px-2 py-1 text-sm"
              >
                {dish.availability?.inStock ? 'В наличии' : 'Под заказ'}
              </Badge>
            </div>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">
              {dish.description}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <Scale className="h-4 w-4" />
              {dish.weight} г
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            {currentQuantity > 0 ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={(e) => handleUpdateQuantity(e, currentQuantity - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="min-w-[2rem] text-center text-lg">
                  {currentQuantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={(e) => handleUpdateQuantity(e, currentQuantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="lg"
                className="w-full md:w-auto rounded-full bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-700 hover:to-amber-500"
                onClick={handleAddToCart}
              >
                Добавить в список
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

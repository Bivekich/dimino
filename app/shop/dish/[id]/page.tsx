'use client';

import { useState, useEffect, use } from 'react';
import DishDetails from '@/app/components/ui/DishDetails';
import { Dish } from '@/app/types';

export default function DishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [dish, setDish] = useState<Dish | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDish = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/products/${id}`);

        if (!response.ok) {
          throw new Error('Не удалось загрузить информацию о товаре');
        }

        const productData = await response.json();

        // Преобразуем данные API в формат, который ожидает интерфейс Dish
        const formattedDish: Dish = {
          id: productData.id,
          name: productData.name,
          description: productData.description,
          weight: productData.weight,
          inStock: productData.inStock,
          fishId: productData.fishId || '',
          media: productData.media.map((m: { url: string; type: string }) => ({
            url: m.url,
            type: m.type.toLowerCase() as 'image' | 'video',
          })),
          // Добавляем информацию о доступности
          availability: {
            inStock: productData.inStock,
            stores: [],
          },
        };

        setDish(formattedDish);
      } catch (error) {
        console.error('Error fetching dish:', error);
        setError('Товар не найден или произошла ошибка загрузки');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchDish();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
          <div className="mt-4 text-zinc-600">Загрузка товара...</div>
        </div>
      </div>
    );
  }

  if (error || !dish) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-2xl font-semibold mt-8">
          Товар не найден
        </div>
        <div className="text-center text-zinc-600 mt-2">
          Запрошенный товар с ID &ldquo;{id}&rdquo; не существует или
          удален
        </div>
      </div>
    );
  }

  return <DishDetails dish={dish} />;
}

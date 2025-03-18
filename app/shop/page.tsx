'use client';

import { useState, useEffect } from 'react';
import DishCard from '@/app/components/ui/DishCard';
import Sidebar from '@/app/components/layout/Sidebar';
import { DishCardSkeletonGrid } from '@/app/components/ui/DishCardSkeleton';
import { useSearchParams } from 'next/navigation';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dish } from '@/app/types';
import { ProductDTO } from '@/app/types/index';

export default function ShopPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [categoryName, setCategoryName] = useState<string>('Наши деликатесы');
  const searchParams = useSearchParams();
  const selectedCity = searchParams.get('city');

  // Загружаем товары при изменении выбранного города
  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedCity) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Запрашиваем продукты для выбранного города
        const productsResponse = await fetch(
          `/api/products?cityId=${selectedCity}`
        );
        if (!productsResponse.ok) {
          throw new Error('Ошибка загрузки продуктов');
        }

        const productsData = await productsResponse.json();

        // Преобразуем данные API в формат, который ожидает интерфейс Dish
        const formattedDishes = productsData.map((product: ProductDTO) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          weight: product.weight,
          inStock: product.inStock,
          fishId: product.fishId || '',
          media: product.media.map((m: { url: string; type: string }) => ({
            url: m.url,
            type: m.type.toLowerCase() as 'image' | 'video',
          })),
          // Добавляем информацию о доступности, которая может отсутствовать в API
          availability: {
            inStock: product.inStock,
            stores: [],
          },
        }));

        setDishes(formattedDishes);
      } catch (error) {
        console.error('Ошибка при загрузке продуктов:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCity]);

  // Загружаем название категории при изменении фильтра категории
  useEffect(() => {
    const fetchCategoryName = async () => {
      if (!categoryFilter) {
        setCategoryName('Наши деликатесы');
        return;
      }

      try {
        const response = await fetch(`/api/fish/${categoryFilter}`);
        if (response.ok) {
          const fishData = await response.json();
          setCategoryName(fishData.name);
        } else {
          setCategoryName('Наши деликатесы');
        }
      } catch (error) {
        console.error('Ошибка при загрузке категории:', error);
        setCategoryName('Наши деликатесы');
      }
    };

    fetchCategoryName();
  }, [categoryFilter]);

  // Фильтруем товары по категории
  const filteredDishes = dishes.filter((dish) => {
    // Если указана категория, фильтруем по ней
    if (categoryFilter && dish.fishId !== categoryFilter) {
      return false;
    }

    return true;
  });

  // Обработчик для изменения категории
  const handleCategoryChange = (fishId: string | null) => {
    setCategoryFilter(fishId);
    setIsMobileSidebarOpen(false); // Закрываем мобильное меню при выборе категории
  };

  // Обработчик для переключения мобильного меню
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Обработчик для открытия селектора города
  const handleOpenCitySelector = () => {
    const citySelector = document.querySelector(
      '.city-selector'
    ) as HTMLElement;
    if (citySelector) {
      citySelector.click();
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Мобильная кнопка фильтров */}
      <div className="md:hidden sticky top-[72px] z-20 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-2 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMobileSidebar}
          className="h-8 px-3"
        >
          <Filter className="h-4 w-4 mr-1.5" />
          <span className="text-sm">Фильтры</span>
        </Button>

        {selectedCity && (
          <div className="text-sm text-zinc-500">
            {filteredDishes.length}{' '}
            {filteredDishes.length === 1
              ? 'товар'
              : filteredDishes.length > 1 && filteredDishes.length < 5
              ? 'товара'
              : 'товаров'}
          </div>
        )}
      </div>

      {/* Мобильный сайдбар */}
      <div
        className={`md:hidden fixed inset-0 z-30 transition-all duration-300 ${
          isMobileSidebarOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
        <div className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-zinc-900 shadow-xl transform transition-transform duration-300 ease-in-out">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="font-semibold">Фильтры</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <Sidebar
            onCategorySelect={handleCategoryChange}
            activeCategory={categoryFilter}
            cityParam={selectedCity}
          />
        </div>
      </div>

      {/* Десктопный сайдбар */}
      <div className="hidden md:block">
        <Sidebar
          onCategorySelect={handleCategoryChange}
          activeCategory={categoryFilter}
          cityParam={selectedCity}
        />
      </div>

      <main className="flex-1">
        <div className="p-0 md:pl-6 md:py-6 md:pr-3">
          <div className="mb-6 md:mb-8 hidden md:block">
            <h1 className="text-xl md:text-2xl font-semibold mb-2">
              {categoryName}
            </h1>
            {selectedCity ? (
              <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">
                {filteredDishes.length} наименований изысканных морских
                деликатесов ручной работы
              </p>
            ) : (
              <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">
                Пожалуйста, выберите город, чтобы увидеть доступные деликатесы
              </p>
            )}
          </div>

          {/* Мобильный заголовок */}
          <div className="md:hidden mb-3">
            <h2 className="text-lg font-medium">{categoryName}</h2>
          </div>

          {isLoading ? (
            <DishCardSkeletonGrid />
          ) : selectedCity ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 px-3 md:px-0">
              {filteredDishes.length > 0 ? (
                filteredDishes.map((dish) => (
                  <DishCard key={dish.id} dish={dish} />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-zinc-600 dark:text-zinc-400">
                  <p>
                    Товары не найдены. Попробуйте изменить фильтры или выбрать
                    другой город.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">
              <p className="mb-4">Пожалуйста, выберите город в верхнем меню</p>
              <Button
                variant="outline"
                className="rounded-full bg-gradient-to-r from-amber-600 to-amber-400 text-white border-0 hover:from-amber-700 hover:to-amber-500"
                onClick={handleOpenCitySelector}
              >
                Выбрать город
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2,
  Store as StoreIcon,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { CartItem, ProductAvailability } from '@/app/types';
import { useCart } from '@/app/hooks/useCart';
import { toast } from 'sonner';

// Интерфейс для продукта из API
interface Product {
  id: string;
  name: string;
  inStock: boolean;
}

// Интерфейс для магазина из API
interface StoreData {
  id: string;
  name: string;
  address: string;
  phone: string;
  workingHours: string;
}

interface ProductAvailabilityResultProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  selectedCity: string;
}

const ProductAvailabilityResult = ({
  isOpen,
  onClose,
  items,
  selectedCity,
}: ProductAvailabilityResultProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<ProductAvailability[]>([]);
  const { clearCart } = useCart();

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const checkAvailability = async () => {
        try {
          // Получаем список магазинов в выбранном городе
          const storesResponse = await fetch(
            `/api/cities/${selectedCity}/stores`
          );
          if (!storesResponse.ok) {
            throw new Error('Ошибка при получении списка магазинов');
          }
          const stores = (await storesResponse.json()) as StoreData[];

          // Получаем товары для выбранного города
          const productsResponse = await fetch(
            `/api/products?cityId=${selectedCity}`
          );
          if (!productsResponse.ok) {
            throw new Error('Ошибка при получении данных о товарах');
          }
          const products = (await productsResponse.json()) as Product[];

          // Формируем результаты о наличии для каждого товара в корзине
          const availabilityResults = items
            .map((item) => {
              const product = products.find((p) => p.id === item.id);
              if (!product) return null;

              // Получаем магазин, где продается товар
              const storeInfo = stores.map((store) => ({
                storeId: store.id,
                storeName: store.name,
                storeAddress: store.address || '',
                storePhone: store.phone || '',
                storeWorkingHours: store.workingHours || '10:00 - 20:00',
                inStock: product.inStock,
                preOrderOnly: !product.inStock,
              }));

              return {
                productId: product.id,
                productName: product.name,
                stores: storeInfo,
              };
            })
            .filter((result): result is ProductAvailability => result !== null);

          setResults(availabilityResults);
        } catch (error) {
          console.error('Ошибка при проверке наличия:', error);
          toast.error('Не удалось получить информацию о наличии');
        } finally {
          setIsLoading(false);
        }
      };

      checkAvailability();
    }
  }, [isOpen, items, selectedCity]);

  const handleClose = () => {
    clearCart();
    toast.success('Корзина очищена');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] w-[calc(100%-32px)] p-4 sm:p-6 max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-semibold">
            Информация о наличии
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-zinc-600 dark:text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-center">
              Собираем информацию о наличии деликатесов...
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[calc(70vh-80px)] pr-4">
            <div className="space-y-4 sm:space-y-6">
              {results.length > 0 ? (
                results.map((result) => (
                  <div
                    key={result.productId}
                    className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 sm:p-4"
                  >
                    <h3 className="font-medium text-base sm:text-lg mb-3 sm:mb-4">
                      {result.productName}
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      {result.stores.length > 0 ? (
                        result.stores.map((store) => (
                          <div
                            key={store.storeId}
                            className="flex items-start gap-3 sm:gap-4 p-2 sm:p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg"
                          >
                            <StoreIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400 flex-shrink-0 mt-1" />
                            <div className="flex-1 space-y-1">
                              <div className="font-medium text-sm sm:text-base">
                                {store.storeName}
                              </div>
                              <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                                {store.storeAddress}
                              </div>
                              <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                                Тел: {store.storePhone}
                              </div>
                              <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                                Режим работы: {store.storeWorkingHours}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                {store.preOrderOnly ? (
                                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-xs sm:text-sm font-medium">
                                      Доступно под заказ
                                    </span>
                                  </div>
                                ) : store.inStock ? (
                                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-xs sm:text-sm font-medium">
                                      В наличии
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                    <XCircle className="h-4 w-4" />
                                    <span className="text-xs sm:text-sm font-medium">
                                      Нет в наличии
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-3 sm:py-4 text-sm text-zinc-600 dark:text-zinc-400">
                          К сожалению, этот деликатес недоступен в выбранном
                          городе
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                  Ни один из выбранных деликатесов не найден в магазинах в вашем
                  городе.
                  <p className="mt-2">
                    Вы можете оформить предзаказ, и мы сообщим когда товар
                    появится в наличии.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <div className="mt-4 sm:mt-6 flex justify-end">
          <Button
            onClick={handleClose}
            className="w-full sm:w-auto rounded-full"
          >
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductAvailabilityResult;

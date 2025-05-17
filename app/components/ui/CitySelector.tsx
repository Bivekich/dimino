'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Store as StoreIcon } from 'lucide-react';
import { City } from '@/app/types/index';

interface CitySelectorProps {
  forceSelection?: boolean;
}

export default function CitySelector({ forceSelection }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(forceSelection);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCityId = searchParams.get('city');

  const selectedCity = selectedCityId
    ? cities.find((city) => city.id === selectedCityId)
    : null;

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoading(true);
        // Получаем список городов
        const citiesResponse = await fetch('/api/cities');
        if (!citiesResponse.ok) {
          throw new Error('Ошибка загрузки городов');
        }
        const citiesData = await citiesResponse.json();

        // Для каждого города получаем магазины
        const citiesWithStores = await Promise.all(
          citiesData.map(async (city: City) => {
            // Используем новый эндпоинт для получения магазинов города
            const storesResponse = await fetch(`/api/cities/${city.id}/stores`);
            if (!storesResponse.ok) {
              return { ...city, stores: [] };
            }

            const stores = await storesResponse.json();
            return {
              ...city,
              stores: stores,
            };
          })
        );

        setCities(citiesWithStores);
      } catch (error) {
        console.error('Ошибка при загрузке городов:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCities();
  }, []);

  const handleCitySelect = (cityId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('city', cityId);
    router.push(`/shop?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(true)}
        className="hover:text-amber-500 transition-colors city-selector px-2 md:px-3"
      >
        <MapPin className="h-5 w-5" />
        <span className="hidden md:inline ml-2">
          {selectedCity ? selectedCity.name : 'Выберите город'}
        </span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              Выберите город
            </DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <div className="py-8 text-center">
              <p className="text-zinc-600 dark:text-zinc-400">
                Загрузка городов...
              </p>
            </div>
          ) : cities.length > 0 ? (
            <div className="grid gap-6 mt-4">
              {cities.map((city) => (
                <div key={city.id} className="space-y-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-lg font-medium hover:text-amber-500 transition-colors"
                    onClick={() => handleCitySelect(city.id)}
                  >
                    <MapPin className="h-5 w-5 mr-2" />
                    {city.name}
                  </Button>
                  <div className="pl-7 space-y-3">
                    {city.stores && city.stores.length > 0 ? (
                      city.stores.map((store) => (
                        <div key={store.id} className="space-y-1">
                          <div className="flex items-start">
                            <StoreIcon className="h-4 w-4 mr-2 mt-1 text-zinc-400" />
                            <div className="w-full">
                              <div className="font-medium">{store.name}</div>
                              {store.address && (
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 flex gap-2">
                                  <span className="text-amber-500 whitespace-nowrap">
                                    Адрес:
                                  </span>
                                  <span>{store.address}</span>
                                </div>
                              )}
                              {store.phone && (
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 flex gap-2">
                                  <span className="text-amber-500 whitespace-nowrap">
                                    Телефон:
                                  </span>
                                  <span>{store.phone}</span>
                                </div>
                              )}
                              {store.workingHours && (
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 flex gap-2">
                                  <span className="text-amber-500 whitespace-nowrap">
                                    Режим работы:
                                  </span>
                                  <span>{store.workingHours}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        Нет доступных магазинов
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-zinc-600 dark:text-zinc-400">
                Нет доступных городов
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

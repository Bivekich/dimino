'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

interface City {
  id: string;
  name: string;
}

interface Seller {
  id: string;
  user: {
    name: string | null;
    email: string;
  };
}

interface Fish {
  id: string;
  name: string;
}

interface Media {
  url: string;
  type: 'IMAGE' | 'VIDEO';
}

export default function CreateProductPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [cities, setCities] = useState<City[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [fish, setFish] = useState<Fish[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    weight: 0,
    inStock: true,
    fishId: '',
    cityId: '',
    sellerId: '',
  });

  const [media, setMedia] = useState<Media[]>([{ url: '', type: 'IMAGE' }]);

  const isAdmin = session?.user?.role === 'ADMIN';
  const isSeller = session?.user?.role === 'SELLER';

  useEffect(() => {
    async function fetchData() {
      try {
        // Получаем города
        const citiesResponse = await fetch('/api/cities');
        if (citiesResponse.ok) {
          const citiesData = await citiesResponse.json();
          setCities(citiesData);
        }

        // Получаем виды рыб
        const fishResponse = await fetch('/api/fish');
        if (fishResponse.ok) {
          const fishData = await fishResponse.json();
          setFish(fishData);
        }

        // Если админ, получаем всех продавцов
        if (isAdmin) {
          const sellersResponse = await fetch('/api/sellers');
          if (sellersResponse.ok) {
            const sellersData = await sellersResponse.json();
            setSellers(sellersData);
          }
        }
        // Если продавец, получаем его данные
        else if (isSeller) {
          const sellerResponse = await fetch('/api/sellers/me');
          if (sellerResponse.ok) {
            const sellerData = await sellerResponse.json();

            // Устанавливаем значения для продавца
            setFormData((prev) => ({
              ...prev,
              sellerId: sellerData.id,
              cityId: sellerData.cityId,
            }));
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        toast.error('Не удалось загрузить необходимые данные');
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchData();
    }
  }, [session, isAdmin, isSeller]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: target.checked });
    } else if (name === 'weight') {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleMediaChange = (
    index: number,
    field: keyof Media,
    value: string
  ) => {
    const updatedMedia = [...media];
    updatedMedia[index] = { ...updatedMedia[index], [field]: value };
    setMedia(updatedMedia);
  };

  const addMediaField = () => {
    setMedia([...media, { url: '', type: 'IMAGE' }]);
  };

  const removeMediaField = (index: number) => {
    if (media.length > 1) {
      const updatedMedia = [...media];
      updatedMedia.splice(index, 1);
      setMedia(updatedMedia);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || formData.weight <= 0) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    // Проверяем, что URL медиа не пустые (если они добавлены)
    const validMedia = media.filter((item) => item.url.trim() !== '');

    setSubmitting(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          media: validMedia.length > 0 ? validMedia : undefined,
        }),
      });

      if (response.ok) {
        toast.success('Товар успешно добавлен');
        router.push('/admin/products');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка при добавлении товара');
      }
    } catch (error) {
      console.error('Ошибка создания товара:', error);
      toast.error('Не удалось создать товар');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin && !isSeller) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Доступ запрещен</h2>
        <p>У вас нет прав для просмотра этой страницы.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Добавление нового товара</h1>
        <Link
          href="/admin/products"
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Назад к списку
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          Загрузка данных...
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Название *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="weight"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Вес (г) *
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Описание *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="fishId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Вид рыбы
                </label>
                <select
                  id="fishId"
                  name="fishId"
                  value={formData.fishId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Выберите вид рыбы --</option>
                  {fish.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="inStock"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={(e) =>
                    setFormData({ ...formData, inStock: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="inStock"
                  className="ml-2 block text-sm text-gray-900"
                >
                  В наличии
                </label>
              </div>

              {isAdmin && (
                <>
                  <div>
                    <label
                      htmlFor="cityId"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Город *
                    </label>
                    <select
                      id="cityId"
                      name="cityId"
                      value={formData.cityId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">-- Выберите город --</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="sellerId"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Продавец *
                    </label>
                    <select
                      id="sellerId"
                      name="sellerId"
                      value={formData.sellerId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">-- Выберите продавца --</option>
                      {sellers.map((seller) => (
                        <option key={seller.id} value={seller.id}>
                          {seller.user.name || seller.user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Фото и видео</h3>

              {media.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-4 mb-4"
                >
                  <div className="flex-1">
                    <label
                      htmlFor={`mediaUrl-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      URL медиафайла
                    </label>
                    <input
                      type="text"
                      id={`mediaUrl-${index}`}
                      value={item.url}
                      onChange={(e) =>
                        handleMediaChange(index, 'url', e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="md:w-1/4">
                    <label
                      htmlFor={`mediaType-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Тип
                    </label>
                    <select
                      id={`mediaType-${index}`}
                      value={item.type}
                      onChange={(e) =>
                        handleMediaChange(
                          index,
                          'type',
                          e.target.value as 'IMAGE' | 'VIDEO'
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="IMAGE">Изображение</option>
                      <option value="VIDEO">Видео</option>
                    </select>
                  </div>

                  <div className="flex items-end mb-1">
                    <button
                      type="button"
                      onClick={() => removeMediaField(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800 focus:outline-none"
                      disabled={media.length <= 1}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addMediaField}
                className="mt-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Добавить еще медиафайл
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {submitting ? 'Создание...' : 'Создать товар'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

interface City {
  id: string;
  name: string;
}

interface Media {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO';
}

interface NewMedia {
  url: string;
  type: 'IMAGE' | 'VIDEO';
}

interface Product {
  id: string;
  name: string;
  description: string;
  weight: number;
  inStock: boolean;
  cityId: string;
  city: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    user: {
      name: string | null;
      email: string;
    };
  };
  media: Media[];
}

export default function EditProduct() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    weight: 0,
    inStock: true,
    cityId: '',
  });
  const [product, setProduct] = useState<Product | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);
  const [mediaToDelete, setMediaToDelete] = useState<string[]>([]);
  const [newMediaUrls, setNewMediaUrls] = useState<NewMedia[]>([
    { url: '', type: 'IMAGE' },
  ]);

  useEffect(() => {
    async function fetchCities() {
      try {
        const response = await fetch('/api/cities');
        if (response.ok) {
          const data = await response.json();
          setCities(data);
        } else {
          toast.error('Ошибка при загрузке городов');
        }
      } catch (error) {
        console.error('Ошибка загрузки городов:', error);
      }
    }

    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          setFormData({
            name: data.name,
            description: data.description,
            weight: data.weight,
            inStock: data.inStock,
            cityId: data.city.id,
          });
          setMedia(data.media);
        } else {
          toast.error('Ошибка при загрузке информации о товаре');
        }
      } catch (error) {
        console.error('Ошибка загрузки товара:', error);
        toast.error('Не удалось загрузить информацию о товаре');
      } finally {
        setLoading(false);
      }
    }

    fetchCities();
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setFormData({
      ...formData,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleRemoveExistingMedia = (id: string) => {
    setMediaToDelete([...mediaToDelete, id]);
    setMedia(media.filter((m) => m.id !== id));
  };

  const handleMediaUrlChange = (
    index: number,
    field: keyof NewMedia,
    value: string
  ) => {
    const updatedMedia = [...newMediaUrls];
    updatedMedia[index] = { ...updatedMedia[index], [field]: value };
    setNewMediaUrls(updatedMedia);
  };

  const addMediaUrlField = () => {
    setNewMediaUrls([...newMediaUrls, { url: '', type: 'IMAGE' }]);
  };

  const removeMediaUrlField = (index: number) => {
    if (newMediaUrls.length > 1) {
      const updatedMedia = [...newMediaUrls];
      updatedMedia.splice(index, 1);
      setNewMediaUrls(updatedMedia);
    } else {
      setNewMediaUrls([{ url: '', type: 'IMAGE' }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Название товара обязательно для заполнения');
      return;
    }

    setSubmitting(true);

    try {
      // Фильтруем непустые URL медиафайлов
      const validMediaUrls = newMediaUrls.filter(
        (item) => item.url.trim() !== ''
      );

      // Обновляем основную информацию о товаре и добавляем новые медиа по URL
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          media: validMediaUrls.length > 0 ? validMediaUrls : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при обновлении товара');
      }

      // Удаляем медиафайлы, если есть
      if (mediaToDelete.length > 0) {
        for (const mediaId of mediaToDelete) {
          await fetch(`/api/media/${mediaId}`, {
            method: 'DELETE',
          });
        }
      }

      toast.success('Товар успешно обновлен');
      router.push(`/admin/products/${productId}`);
    } catch (error) {
      console.error('Ошибка обновления товара:', error);
      toast.error(
        error instanceof Error ? error.message : 'Не удалось обновить товар'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isAdmin = session?.user?.role === 'ADMIN';
  const isSeller = session?.user?.role === 'SELLER';
  const isOwner = product?.seller.user.email === session?.user?.email;

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4">Загрузка информации о товаре...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Товар не найден</h2>
        <p>Запрашиваемый товар не существует или был удален.</p>
        <Link
          href="/admin/products"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Вернуться к списку товаров
        </Link>
      </div>
    );
  }

  if (!isAdmin && !(isSeller && isOwner)) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Доступ запрещен</h2>
        <p>У вас нет прав для редактирования этого товара.</p>
        <Link
          href="/admin/products"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Вернуться к списку товаров
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Редактирование товара</h1>
        <Link
          href={`/admin/products/${productId}`}
          className="text-blue-600 hover:underline"
        >
          Вернуться к просмотру товара
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Название товара *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="weight"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Вес (г)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="cityId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Город
                </label>
                <select
                  id="cityId"
                  name="cityId"
                  value={formData.cityId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите город</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
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
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="inStock"
                  className="ml-2 block text-sm text-gray-700"
                >
                  В наличии
                </label>
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Описание
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Текущие изображения
              </label>
              {media.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {media.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="h-32 bg-gray-100 rounded-md overflow-hidden relative">
                        <Image
                          src={item.url}
                          alt="Изображение товара"
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingMedia(item.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Нет загруженных изображений</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Добавить ссылки на изображения
              </label>

              {newMediaUrls.map((item, index) => (
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
                        handleMediaUrlChange(index, 'url', e.target.value)
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
                        handleMediaUrlChange(
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
                      onClick={() => removeMediaUrlField(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800 focus:outline-none"
                      disabled={newMediaUrls.length <= 1}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addMediaUrlField}
                className="mt-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Добавить еще URL медиафайла
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Link
              href={`/admin/products/${productId}`}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

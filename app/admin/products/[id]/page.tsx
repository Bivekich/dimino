'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

interface Media {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO';
}

interface Product {
  id: string;
  name: string;
  description: string;
  weight: number;
  inStock: boolean;
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
  createdAt: string;
}

export default function ProductDetails() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
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

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleDeleteProduct = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Товар успешно удален');
        router.push('/admin/products');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка при удалении товара');
      }
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
      toast.error('Не удалось удалить товар');
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
        <p>У вас нет прав для просмотра этого товара.</p>
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
        <h1 className="text-2xl font-bold">Информация о товаре</h1>
        <Link href="/admin/products" className="text-blue-600 hover:underline">
          Вернуться к списку товаров
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div>
            {product.media.length > 0 ? (
              <div className="space-y-4">
                <div className="h-80 bg-gray-100 relative rounded-lg overflow-hidden">
                  <img
                    src={product.media[currentImageIndex].url}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                {product.media.length > 1 && (
                  <div className="flex space-x-2 overflow-auto py-2">
                    {product.media.map((media, index) => (
                      <button
                        key={media.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-16 w-16 flex-shrink-0 rounded border-2 ${
                          currentImageIndex === index
                            ? 'border-blue-500'
                            : 'border-transparent'
                        }`}
                      >
                        <img
                          src={media.url}
                          alt={`${product.name} - изображение ${index + 1}`}
                          className="h-full w-full object-cover rounded"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-80 bg-gray-100 flex items-center justify-center rounded-lg">
                <p className="text-gray-500">Нет изображений</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
              <div className="flex items-center space-x-2 mb-4">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    product.inStock
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {product.inStock ? 'В наличии' : 'Нет в наличии'}
                </span>
                <span className="text-sm text-gray-600">
                  {product.weight} г
                </span>
              </div>

              <div className="prose max-w-none mb-6">
                <h3 className="text-lg font-medium mb-2">Описание</h3>
                <p className="whitespace-pre-line">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Город</h3>
                  <p>{product.city.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Продавец
                  </h3>
                  <p>{product.seller.user.name || product.seller.user.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Дата добавления
                  </h3>
                  <p>
                    {new Date(product.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 pt-6 border-t">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Редактировать
                </Link>
                <button
                  onClick={handleDeleteProduct}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

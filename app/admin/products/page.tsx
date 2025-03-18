'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  inStock: boolean;
  city: {
    name: string;
  };
  seller: {
    user: {
      name: string | null;
      email: string;
    };
  };
  media: {
    url: string;
  }[];
  createdAt: string;
}

export default function ProductsPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellerId, setSellerId] = useState<string | null>(null);

  // Для продавцов получаем их ID
  useEffect(() => {
    const fetchSellerInfo = async () => {
      if (session?.user?.role === 'SELLER') {
        try {
          const response = await fetch('/api/sellers/me');
          if (response.ok) {
            const data = await response.json();
            setSellerId(data.id);
          } else {
            toast.error('Ошибка при получении информации о продавце');
          }
        } catch (error) {
          console.error('Ошибка получения информации о продавце:', error);
        }
      }
    };

    if (session?.user) {
      fetchSellerInfo();
    }
  }, [session]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Для продавцов запрашиваем только их товары
        let url = '/api/products';
        if (session?.user?.role === 'SELLER' && sellerId) {
          url += `?sellerId=${sellerId}`;
        }

        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          toast.error('Ошибка при загрузке товаров');
        }
      } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        toast.error('Не удалось загрузить товары');
      } finally {
        setLoading(false);
      }
    }

    // Для админов загружаем сразу, для продавцов - когда получен их ID
    if (
      session?.user?.role === 'ADMIN' ||
      (session?.user?.role === 'SELLER' && sellerId)
    ) {
      fetchProducts();
    }
  }, [session, sellerId]);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4">Загрузка товаров...</p>
      </div>
    );
  }

  const isAdmin = session?.user?.role === 'ADMIN';
  const isSeller = session?.user?.role === 'SELLER';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isSeller ? 'Мои товары' : 'Все товары'}
        </h1>
        <Link
          href="/admin/products/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Добавить товар
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">
            {isSeller
              ? 'У вас пока нет добавленных товаров'
              : 'Пока нет добавленных товаров'}
          </p>
          <Link
            href="/admin/products/create"
            className="text-blue-600 hover:underline"
          >
            Добавить первый товар
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Изображение
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Название
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Город
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Продавец
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата добавления
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-12 w-12 bg-gray-100 rounded overflow-hidden">
                        {product.media.length > 0 ? (
                          <img
                            src={product.media[0].url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            Нет фото
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.city.name}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.seller.user.name || product.seller.user.email}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.inStock
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.inStock ? 'В наличии' : 'Нет в наличии'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(product.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Просмотр
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-green-600 hover:text-green-900 ml-2"
                        >
                          Редактировать
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

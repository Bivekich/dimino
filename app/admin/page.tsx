'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'sonner';

interface DashboardStats {
  productsCount: number;
  sellersCount: number;
  citiesCount: number;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    productsCount: 0,
    sellersCount: 0,
    citiesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      // Получаем количество товаров
      const productsResponse = await fetch('/api/products', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const products = await productsResponse.json();

      // Получаем количество городов
      const citiesResponse = await fetch('/api/cities', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const cities = await citiesResponse.json();

      // Получаем количество продавцов (только для админа)
      let sellers = [];
      if (session?.user?.role === 'ADMIN') {
        const sellersResponse = await fetch('/api/sellers', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        sellers = await sellersResponse.json();
      }

      setStats({
        productsCount: Array.isArray(products) ? products.length : 0,
        sellersCount: Array.isArray(sellers) ? sellers.length : 0,
        citiesCount: Array.isArray(cities) ? cities.length : 0,
      });
      toast.success('Данные обновлены');
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchStats();
    }
  }, [session, fetchStats]);

  if (loading) {
    return <div className="text-center mt-8">Загрузка данных...</div>;
  }

  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Обзор системы</h1>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Обновить данные
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Товары</h2>
          <p className="text-3xl font-bold text-blue-600">
            {stats.productsCount}
          </p>
          <div className="mt-4">
            <Link
              href="/admin/products"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Просмотреть все товары
            </Link>
          </div>
        </div>

        {isAdmin && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Продавцы</h2>
            <p className="text-3xl font-bold text-green-600">
              {stats.sellersCount}
            </p>
            <div className="mt-4">
              <Link
                href="/admin/sellers"
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Управление продавцами
              </Link>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Города</h2>
          <p className="text-3xl font-bold text-purple-600">
            {stats.citiesCount}
          </p>
          <div className="mt-4">
            <Link
              href="/admin/cities"
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              Просмотреть города
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/products/create"
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center"
          >
            <div className="font-medium">Добавить новый товар</div>
            <div className="text-sm text-gray-600 mt-1">
              Создать новый товар в каталоге
            </div>
          </Link>

          {isAdmin && (
            <>
              <Link
                href="/admin/cities"
                className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center"
              >
                <div className="font-medium">Управление городами</div>
                <div className="text-sm text-gray-600 mt-1">
                  Добавить или изменить города
                </div>
              </Link>

              <Link
                href="/admin/sellers"
                className="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center"
              >
                <div className="font-medium">Управление продавцами</div>
                <div className="text-sm text-gray-600 mt-1">
                  Добавить или изменить продавцов
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

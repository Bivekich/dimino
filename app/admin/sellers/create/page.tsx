'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface City {
  id: string;
  name: string;
}

export default function CreateSellerPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedUserId = searchParams.get('userId');

  const [users, setUsers] = useState<User[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(
    preselectedUserId || ''
  );
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Получаем пользователей
        const usersResponse = await fetch('/api/users');
        let usersData: User[] = [];

        if (usersResponse.ok) {
          const allUsers = await usersResponse.json();
          // Фильтруем только пользователей с ролью USER
          usersData = allUsers.filter((user: User) => user.role === 'USER');
        } else {
          toast.error('Ошибка при загрузке пользователей');
        }

        // Получаем города
        const citiesResponse = await fetch('/api/cities');
        let citiesData: City[] = [];

        if (citiesResponse.ok) {
          citiesData = await citiesResponse.json();
        } else {
          toast.error('Ошибка при загрузке городов');
        }

        setUsers(usersData);
        setCities(citiesData);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        toast.error('Не удалось загрузить необходимые данные');
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId || !selectedCityId) {
      toast.error('Выберите пользователя и город');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/sellers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUserId,
          cityId: selectedCityId,
        }),
      });

      if (response.ok) {
        toast.success('Продавец успешно добавлен');
        router.push('/admin/sellers');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка при добавлении продавца');
      }
    } catch (error) {
      console.error('Ошибка создания продавца:', error);
      toast.error('Не удалось создать продавца');
    } finally {
      setSubmitting(false);
    }
  };

  const isAdmin = session?.user?.role === 'ADMIN';

  if (!isAdmin) {
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
        <h1 className="text-2xl font-bold">Добавление нового продавца</h1>
        <Link
          href="/admin/sellers"
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
          {users.length === 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
              <p className="font-medium">
                Нет доступных пользователей для назначения продавцом.
              </p>
              <p className="mt-1">
                <Link href="/admin/users" className="underline">
                  Сначала создайте обычного пользователя
                </Link>
              </p>
            </div>
          )}

          {cities.length === 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
              <p className="font-medium">Не найдено ни одного города.</p>
              <p className="mt-1">
                <Link href="/admin/cities" className="underline">
                  Сначала добавьте хотя бы один город
                </Link>
              </p>
            </div>
          )}

          {users.length > 0 && cities.length > 0 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="userId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Выберите пользователя
                </label>
                <select
                  id="userId"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Выберите пользователя --</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name ? `${user.name} (${user.email})` : user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="cityId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Выберите город
                </label>
                <select
                  id="cityId"
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
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

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !selectedUserId || !selectedCityId}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {submitting ? 'Создание...' : 'Создать продавца'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Для создания продавца требуется как минимум один пользователь и
              один город
            </div>
          )}
        </div>
      )}
    </div>
  );
}

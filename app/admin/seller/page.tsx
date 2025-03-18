'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Seller {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  city: {
    id: string;
    name: string;
  };
  address: string | null;
  phone: string | null;
  workingHours: string | null;
  createdAt: string;
}

export default function SellerDashboard() {
  const { data: session, status } = useSession();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    workingHours: '',
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (
      !session ||
      (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN')
    ) {
      setLoading(false);
      return;
    }

    async function fetchSellerData() {
      try {
        const response = await fetch('/api/sellers/me');
        if (response.ok) {
          const data = await response.json();
          setSeller(data);
          setFormData({
            address: data.address || '',
            phone: data.phone || '',
            workingHours: data.workingHours || '',
          });
        } else {
          toast.error('Ошибка при загрузке данных продавца');
        }
      } catch (error) {
        console.error('Ошибка загрузки данных продавца:', error);
        toast.error('Не удалось загрузить информацию о продавце');
      } finally {
        setLoading(false);
      }
    }

    fetchSellerData();
  }, [session, status]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/sellers/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedSeller = await response.json();
        setSeller(updatedSeller);
        setIsEditing(false);
        toast.success('Данные успешно обновлены');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка при обновлении данных');
      }
    } catch (error) {
      console.error('Ошибка обновления данных:', error);
      toast.error('Не удалось обновить информацию');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4">Загрузка...</p>
      </div>
    );
  }

  if (
    !session ||
    (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN')
  ) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Доступ запрещен</h2>
        <p>У вас нет прав для просмотра этой страницы.</p>
        <p className="mt-4">
          <Link href="/" className="text-blue-600 hover:underline">
            Вернуться на главную
          </Link>
        </p>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Информация не найдена</h2>
        <p>Не удалось найти информацию о вашем профиле продавца.</p>
        <p className="mt-4">
          <Link href="/" className="text-blue-600 hover:underline">
            Вернуться на главную
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Личный кабинет продавца</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Информация о продавце</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Редактировать
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Адрес
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите адрес магазина"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Телефон
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите контактный телефон"
              />
            </div>

            <div>
              <label
                htmlFor="workingHours"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Режим работы
              </label>
              <input
                type="text"
                id="workingHours"
                name="workingHours"
                value={formData.workingHours}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Например: Пн-Пт: 9:00-18:00"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    address: seller.address || '',
                    phone: seller.phone || '',
                    workingHours: seller.workingHours || '',
                  });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Сохранить
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Имя</h3>
                <p>{seller.user.name || 'Не указано'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p>{seller.user.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Город</h3>
                <p>{seller.city.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Дата регистрации
                </h3>
                <p>{new Date(seller.createdAt).toLocaleDateString('ru-RU')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Адрес</h3>
                <p>{seller.address || 'Не указан'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Телефон</h3>
                <p>{seller.phone || 'Не указан'}</p>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">
                  Режим работы
                </h3>
                <p>{seller.workingHours || 'Не указан'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Управление товарами</h2>
        <p className="mb-4">
          Здесь вы можете управлять своими товарами, добавлять новые или
          редактировать существующие.
        </p>
        <Link
          href="/admin/products"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Перейти к управлению товарами
        </Link>
      </div>
    </div>
  );
}

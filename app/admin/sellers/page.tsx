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

interface City {
  id: string;
  name: string;
}

export default function SellersPage() {
  const { data: session } = useSession();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [editSeller, setEditSeller] = useState<{
    id: string;
    cityId: string;
    address: string;
    phone: string;
    workingHours: string;
    isEditing: boolean;
  } | null>(null);

  useEffect(() => {
    async function fetchSellers() {
      try {
        const response = await fetch('/api/sellers');
        if (response.ok) {
          const data = await response.json();
          setSellers(data);
        } else {
          toast.error('Ошибка при загрузке продавцов');
        }
      } catch (error) {
        console.error('Ошибка загрузки продавцов:', error);
        toast.error('Не удалось загрузить список продавцов');
      } finally {
        setLoading(false);
      }
    }

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
        toast.error('Не удалось загрузить список городов');
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchSellers();
      fetchCities();
    } else {
      setLoading(false);
    }
  }, [session]);

  const handleEdit = (seller: Seller) => {
    setEditSeller({
      id: seller.id,
      cityId: seller.city.id,
      address: seller.address || '',
      phone: seller.phone || '',
      workingHours: seller.workingHours || '',
      isEditing: true,
    });
  };

  const handleCancelEdit = () => {
    setEditSeller(null);
  };

  const handleUpdateChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    if (editSeller) {
      setEditSeller({ ...editSeller, [name]: value });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editSeller) return;

    try {
      const response = await fetch(`/api/sellers/${editSeller.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cityId: editSeller.cityId,
          address: editSeller.address,
          phone: editSeller.phone,
          workingHours: editSeller.workingHours,
        }),
      });

      if (response.ok) {
        const updatedSeller = await response.json();
        setSellers(
          sellers.map((seller) =>
            seller.id === updatedSeller.id ? updatedSeller : seller
          )
        );
        setEditSeller(null);
        toast.success('Продавец успешно обновлен');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка при обновлении продавца');
      }
    } catch (error) {
      console.error('Ошибка обновления продавца:', error);
      toast.error('Не удалось обновить продавца');
    }
  };

  const handleDelete = async (sellerId: string, sellerEmail: string) => {
    if (!confirm(`Вы уверены, что хотите удалить продавца ${sellerEmail}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/sellers/${sellerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSellers(sellers.filter((seller) => seller.id !== sellerId));
        toast.success('Продавец успешно удален');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка при удалении продавца');
      }
    } catch (error) {
      console.error('Ошибка удаления продавца:', error);
      toast.error('Не удалось удалить продавца');
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление продавцами</h1>
        <button
          onClick={() => {
            setLoading(true);
            fetch('/api/sellers', {
              cache: 'no-store',
              headers: {
                'Cache-Control': 'no-cache',
              },
            })
              .then((response) => response.json())
              .then((data) => {
                setSellers(data);
                toast.success('Данные обновлены');
              })
              .catch((error) => {
                console.error('Ошибка обновления продавцов:', error);
                toast.error('Не удалось обновить данные');
              })
              .finally(() => {
                setLoading(false);
              });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Обновить данные
        </button>
      </div>

      {isAdmin && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Информация о продавцах</h2>
          <p className="text-gray-600 mb-4">
            Для создания продавца перейдите на страницу{' '}
            <Link href="/admin/users" className="text-blue-600 hover:underline">
              Управление пользователями
            </Link>{' '}
            и добавьте нового пользователя с ролью &ldquo;Продавец&rdquo;.
          </p>
          <p className="text-gray-600">
            На этой странице вы можете управлять уже созданными продавцами:
            менять им города и просматривать информацию.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">Загрузка...</div>
        ) : sellers.length === 0 ? (
          <div className="p-6 text-center">
            <p className="mb-4">Продавцы не найдены.</p>
            <p>
              Для создания продавца перейдите на страницу{' '}
              <Link
                href="/admin/users"
                className="text-blue-600 hover:underline"
              >
                Управление пользователями
              </Link>{' '}
              и добавьте нового пользователя с ролью &ldquo;Продавец&rdquo;.
            </p>
            <p className="mt-4">
              Если вы уже создали продавца, нажмите на кнопку &ldquo;Обновить
              данные&rdquo; выше.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Имя
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Город
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Адрес
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Телефон
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Режим работы
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Дата регистрации
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sellers.map((seller) => (
                  <tr key={seller.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {seller.user.name || 'Не указано'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {seller.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {seller.city.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {seller.address || 'Не указан'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {seller.phone || 'Не указан'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {seller.workingHours || 'Не указан'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(seller.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(seller)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(seller.id, seller.user.email)
                        }
                        className="text-red-600 hover:text-red-900"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Форма редактирования продавца */}
      {editSeller?.isEditing && (
        <div className="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Редактировать продавца</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label
                  htmlFor="edit-city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Город
                </label>
                <select
                  id="edit-city"
                  name="cityId"
                  value={editSeller.cityId}
                  onChange={handleUpdateChange}
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
              <div>
                <label
                  htmlFor="edit-address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Адрес
                </label>
                <input
                  type="text"
                  id="edit-address"
                  name="address"
                  value={editSeller.address}
                  onChange={handleUpdateChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите адрес"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Телефон
                </label>
                <input
                  type="text"
                  id="edit-phone"
                  name="phone"
                  value={editSeller.phone}
                  onChange={handleUpdateChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите номер телефона"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-working-hours"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Режим работы
                </label>
                <input
                  type="text"
                  id="edit-working-hours"
                  name="workingHours"
                  value={editSeller.workingHours}
                  onChange={handleUpdateChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Например: Пн-Пт: 9:00-18:00"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
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
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    role: 'SELLER',
  });
  const [submitting, setSubmitting] = useState(false);
  const [editUser, setEditUser] = useState<{
    id: string;
    name: string | null;
    role: string;
    isEditing: boolean;
  } | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          toast.error('Ошибка при загрузке пользователей');
        }
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
        toast.error('Не удалось загрузить список пользователей');
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUser.email || !newUser.password) {
      toast.error('Email и пароль обязательны для заполнения');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const createdUser = await response.json();

        // Если создан пользователь с ролью SELLER, добавляем запись в таблицу продавцов
        if (createdUser.role === 'SELLER') {
          // Получаем список городов
          const cityResponse = await fetch('/api/cities', {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            },
          });

          if (cityResponse.ok) {
            const cities = await cityResponse.json();
            if (cities.length > 0) {
              // Добавляем пользователя как продавца, прикрепляя к первому доступному городу
              const sellerResponse = await fetch('/api/sellers', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userId: createdUser.id,
                  cityId: cities[0].id,
                }),
              });

              if (!sellerResponse.ok) {
                const error = await sellerResponse.json();
                console.error('Ошибка создания записи продавца:', error);
              }
            } else {
              toast.warning(
                'Не найдено ни одного города для продавца. Создайте город и назначьте продавца снова.'
              );
            }
          }
        }

        setUsers([...users, createdUser]);
        setNewUser({
          email: '',
          name: '',
          password: '',
          role: 'SELLER',
        });
        toast.success('Пользователь успешно добавлен');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка при создании пользователя');
      }
    } catch (error) {
      console.error('Ошибка создания пользователя:', error);
      toast.error('Не удалось создать пользователя');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId: string, userEmail: string) => {
    if (!confirm(`Вы уверены, что хотите удалить пользователя ${userEmail}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter((user) => user.id !== userId));
        toast.success('Пользователь успешно удален');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка при удалении пользователя');
      }
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error);
      toast.error('Не удалось удалить пользователя');
    }
  };

  const handleEdit = (user: User) => {
    setEditUser({
      id: user.id,
      name: user.name,
      role: user.role,
      isEditing: true,
    });
  };

  const handleCancelEdit = () => {
    setEditUser(null);
  };

  const handleUpdateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (editUser) {
      setEditUser({ ...editUser, [name]: value });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editUser) return;

    try {
      const response = await fetch(`/api/users/${editUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editUser.name,
          role: editUser.role,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();

        // Если роль пользователя была изменена на SELLER, добавляем его в таблицу продавцов
        if (updatedUser.role === 'SELLER') {
          // Получаем список городов
          const cityResponse = await fetch('/api/cities', {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            },
          });

          if (cityResponse.ok) {
            const cities = await cityResponse.json();
            if (cities.length > 0) {
              // Добавляем пользователя как продавца, прикрепляя к первому доступному городу
              const sellerResponse = await fetch('/api/sellers', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userId: updatedUser.id,
                  cityId: cities[0].id,
                }),
              });

              if (!sellerResponse.ok) {
                const error = await sellerResponse.json();
                console.error('Ошибка создания записи продавца:', error);
              }
            }
          }
        }

        setUsers(
          users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
        );
        setEditUser(null);
        toast.success('Пользователь успешно обновлен');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка при обновлении пользователя');
      }
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error);
      toast.error('Не удалось обновить пользователя');
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
      <h1 className="text-2xl font-bold mb-6">Управление пользователями</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">
          Добавить нового пользователя
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={newUser.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Имя
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newUser.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Пароль *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={newUser.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Роль
              </label>
              <select
                id="role"
                name="role"
                value={newUser.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ADMIN">Администратор</option>
                <option value="SELLER">Продавец</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? 'Создание...' : 'Создать пользователя'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-lg font-semibold p-6 border-b">
          Список пользователей
        </h2>

        {loading ? (
          <div className="p-6 text-center">
            Загрузка списка пользователей...
          </div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Нет пользователей</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                    Имя
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Роль
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
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.name || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'SELLER'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.role === 'ADMIN'
                          ? 'Администратор'
                          : user.role === 'SELLER'
                          ? 'Продавец'
                          : 'Пользователь системы'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.role === 'CUSTOMER' && (
                        <button
                          onClick={async () => {
                            if (confirm(`Сделать ${user.email} продавцом?`)) {
                              try {
                                // Получаем список городов
                                const cityResponse = await fetch('/api/cities');
                                if (!cityResponse.ok) {
                                  toast.error(
                                    'Не удалось загрузить список городов'
                                  );
                                  return;
                                }

                                const cities = await cityResponse.json();
                                if (cities.length === 0) {
                                  toast.error(
                                    'Нет доступных городов для продавца'
                                  );
                                  return;
                                }

                                // Выбираем первый город из списка
                                const cityId = cities[0].id;

                                // Создаем продавца
                                const response = await fetch('/api/sellers', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    userId: user.id,
                                    cityId,
                                  }),
                                });

                                if (response.ok) {
                                  // Обновляем пользователя в списке
                                  const updatedUser = {
                                    ...user,
                                    role: 'SELLER',
                                  };
                                  setUsers(
                                    users.map((u) =>
                                      u.id === user.id ? updatedUser : u
                                    )
                                  );
                                  toast.success('Пользователь стал продавцом');
                                } else {
                                  const error = await response.json();
                                  toast.error(
                                    error.error ||
                                      'Ошибка при назначении продавцом'
                                  );
                                }
                              } catch (error) {
                                console.error(
                                  'Ошибка назначения продавцом:',
                                  error
                                );
                                toast.error(
                                  'Не удалось назначить пользователя продавцом'
                                );
                              }
                            }
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Сделать продавцом
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.email)}
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

        {/* Форма редактирования пользователя */}
        {editUser?.isEditing && (
          <div className="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">
                Редактировать пользователя
              </h3>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label
                    htmlFor="edit-name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Имя
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={editUser.name || ''}
                    onChange={handleUpdateChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-role"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Роль
                  </label>
                  <select
                    id="edit-role"
                    name="role"
                    value={editUser.role}
                    onChange={handleUpdateChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ADMIN">Администратор</option>
                    <option value="SELLER">Продавец</option>
                  </select>
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
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Fish {
  id: string;
  name: string;
  createdAt: string;
}

export default function FishPage() {
  const { data: session } = useSession();
  const [fish, setFish] = useState<Fish[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFish, setNewFish] = useState({ name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editFish, setEditFish] = useState<{
    id: string;
    name: string;
    isEditing: boolean;
  } | null>(null);

  useEffect(() => {
    async function fetchFish() {
      try {
        const response = await fetch('/api/fish', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setFish(data);
        } else {
          toast.error('Ошибка при загрузке видов рыб');
        }
      } catch (error) {
        console.error('Ошибка загрузки видов рыб:', error);
        toast.error('Не удалось загрузить список видов рыб');
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchFish();
    } else {
      setLoading(false);
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewFish({ ...newFish, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newFish.name) {
      toast.error('Название вида рыбы обязательно для заполнения');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/fish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFish),
      });

      if (response.ok) {
        const createdFish = await response.json();
        setFish([...fish, createdFish]);
        setNewFish({ name: '' });
        toast.success('Вид рыбы успешно добавлен');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка при создании вида рыбы');
      }
    } catch (error) {
      console.error('Ошибка создания вида рыбы:', error);
      toast.error('Не удалось создать вид рыбы');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (fishId: string, fishName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить вид рыбы "${fishName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/fish/${fishId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFish(fish.filter((f) => f.id !== fishId));
        toast.success('Вид рыбы успешно удален');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка при удалении вида рыбы');
      }
    } catch (error) {
      console.error('Ошибка удаления вида рыбы:', error);
      toast.error('Не удалось удалить вид рыбы');
    }
  };

  const handleEdit = (f: Fish) => {
    setEditFish({
      id: f.id,
      name: f.name,
      isEditing: true,
    });
  };

  const handleCancelEdit = () => {
    setEditFish(null);
  };

  const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editFish) {
      setEditFish({ ...editFish, [name]: value });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editFish) return;
    if (!editFish.name) {
      toast.error('Название вида рыбы обязательно для заполнения');
      return;
    }

    try {
      const response = await fetch(`/api/fish/${editFish.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editFish.name,
        }),
      });

      if (response.ok) {
        const updatedFish = await response.json();
        setFish(fish.map((f) => (f.id === updatedFish.id ? updatedFish : f)));
        setEditFish(null);
        toast.success('Вид рыбы успешно обновлен');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка при обновлении вида рыбы');
      }
    } catch (error) {
      console.error('Ошибка обновления вида рыбы:', error);
      toast.error('Не удалось обновить вид рыбы');
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fish', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFish(data);
        toast.success('Данные обновлены');
      } else {
        toast.error('Ошибка при загрузке видов рыб');
      }
    } catch (error) {
      console.error('Ошибка загрузки видов рыб:', error);
      toast.error('Не удалось загрузить список видов рыб');
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold">Управление видами рыб</h1>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Обновить данные
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Добавить новый вид рыбы</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              value={newFish.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? 'Создание...' : 'Создать вид рыбы'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-lg font-semibold p-6 border-b">Список видов рыб</h2>

        {loading ? (
          <div className="p-6 text-center">Загрузка списка видов рыб...</div>
        ) : fish.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Нет видов рыб</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Название
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Дата создания
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
                {fish.map((f) => (
                  <tr key={f.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {f.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(f.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(f)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => handleDelete(f.id, f.name)}
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

        {/* Форма редактирования вида рыбы */}
        {editFish?.isEditing && (
          <div className="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">
                Редактировать вид рыбы
              </h3>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label
                    htmlFor="edit-name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Название
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={editFish.name}
                    onChange={handleUpdateChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
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
    </div>
  );
}

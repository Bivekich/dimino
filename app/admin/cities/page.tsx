'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface City {
  id: string;
  name: string;
  createdAt: string;
}

export default function CitiesPage() {
  const { data: session } = useSession();
  const [cities, setCities] = useState<City[]>([]);
  const [newCityName, setNewCityName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
        toast.error('Не удалось загрузить список городов');
      } finally {
        setLoading(false);
      }
    }

    fetchCities();
  }, []);

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCityName.trim()) {
      toast.error('Введите название города');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCityName }),
      });

      if (response.ok) {
        const newCity = await response.json();
        setCities([...cities, newCity]);
        setNewCityName('');
        toast.success('Город успешно добавлен');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка при добавлении города');
      }
    } catch (error) {
      console.error('Ошибка добавления города:', error);
      toast.error('Не удалось добавить город');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCity = async (cityId: string, cityName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить город "${cityName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/cities/${cityId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCities(cities.filter((city) => city.id !== cityId));
        toast.success(`Город "${cityName}" успешно удален`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка при удалении города');
      }
    } catch (error) {
      console.error('Ошибка удаления города:', error);
      toast.error('Не удалось удалить город');
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
      <h1 className="text-2xl font-bold mb-6">Управление городами</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Добавить новый город</h2>
        <form
          onSubmit={handleAddCity}
          className="flex flex-col md:flex-row gap-4"
        >
          <input
            type="text"
            value={newCityName}
            onChange={(e) => setNewCityName(e.target.value)}
            placeholder="Название города"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {submitting ? 'Добавление...' : 'Добавить город'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-lg font-semibold p-6 border-b">Список городов</h2>

        {loading ? (
          <div className="p-6 text-center">Загрузка списка городов...</div>
        ) : cities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Нет добавленных городов
          </div>
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
                    Дата добавления
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
                {cities.map((city) => (
                  <tr key={city.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {city.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(city.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteCity(city.id, city.name)}
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
    </div>
  );
}

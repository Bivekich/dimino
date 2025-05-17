'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderClient() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = useCallback(() => {
    setLoading(true);
    // Имитация отправки данных на сервер
    setTimeout(() => {
      router.push('/shop/order/success');
    }, 1000);
  }, [router]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Оформление заказа</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Данные доставки</h2>
          <form className="space-y-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                type="tel"
                id="phone"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Адрес доставки
              </label>
              <textarea
                id="address"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Комментарий к заказу
              </label>
              <textarea
                id="comment"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
              disabled={loading}
            >
              {loading ? 'Обработка...' : 'Оформить заказ'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Ваш заказ</h2>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-gray-500 italic">Корзина пуста</p>
            {/* Здесь будет содержимое корзины */}
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex justify-between font-semibold">
              <p>Итого:</p>
              <p>0 ₽</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

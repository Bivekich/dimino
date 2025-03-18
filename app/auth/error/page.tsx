'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    switch (error) {
      case 'CredentialsSignin':
        setErrorMessage('Неверный email или пароль');
        break;
      case 'AccessDenied':
        setErrorMessage('Доступ запрещен');
        break;
      case 'CallbackRouteError':
        setErrorMessage('Ошибка аутентификации');
        break;
      default:
        setErrorMessage('Произошла ошибка при входе в систему');
    }
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-red-600">
          Ошибка авторизации
        </h1>
        <p className="text-center mb-6">{errorMessage}</p>
        <div className="flex justify-center">
          <Link
            href="/auth/signin"
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Вернуться к форме входа
          </Link>
        </div>
      </div>
    </div>
  );
}

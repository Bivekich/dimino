'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      console.error('Authentication error:', error);
    }
  }, [error]);

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Ошибка аутентификации
      </h2>
      <p className="text-gray-700 mb-4">
        {error === 'OAuthSignin' && 'Ошибка при входе через провайдера OAuth.'}
        {error === 'OAuthCallback' &&
          'Ошибка при обработке обратного вызова OAuth.'}
        {error === 'OAuthCreateAccount' &&
          'Не удалось создать учетную запись OAuth.'}
        {error === 'EmailCreateAccount' &&
          'Не удалось создать учетную запись Email.'}
        {error === 'Callback' && 'Ошибка при обработке обратного вызова.'}
        {error === 'OAuthAccountNotLinked' &&
          'Этот адрес электронной почты уже связан с другой учетной записью.'}
        {error === 'EmailSignin' && 'Проверьте свою электронную почту.'}
        {error === 'CredentialsSignin' && 'Неверные учетные данные.'}
        {error === 'SessionRequired' &&
          'Требуется авторизация для доступа к этой странице.'}
        {!error && 'Произошла неизвестная ошибка при авторизации.'}
      </p>
      <a
        href="/auth/signin"
        className="block text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
      >
        Вернуться на страницу входа
      </a>
    </div>
  );
}

export default function AuthError() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Suspense fallback={<div className="p-8 text-center">Загрузка...</div>}>
        <ErrorContent />
      </Suspense>
    </div>
  );
}

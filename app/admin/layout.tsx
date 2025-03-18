'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
  Store,
  ShoppingBag,
  ShoppingCart,
  LayoutDashboard,
  Users,
  MapPin,
  FileText,
  Fish as FishIcon,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = session?.user?.role === 'ADMIN';
  const isSeller = session?.user?.role === 'SELLER';

  // Перенаправляем неавторизованных пользователей
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && !isAdmin && !isSeller) {
      router.push('/auth/signin');
    }
  }, [status, isAdmin, isSeller, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Загрузка...
      </div>
    );
  }

  if (!isAdmin && !isSeller) {
    return null;
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const sellerMenuItems = [
    {
      name: 'Информация о магазине',
      href: '/admin/seller',
      icon: Store,
      permissions: ['SELLER', 'ADMIN'],
    },
    {
      name: 'Заявки',
      href: '/admin/seller/orders',
      icon: ShoppingBag,
      permissions: ['SELLER', 'ADMIN'],
    },
    {
      name: 'Мои товары',
      href: '/admin/products',
      icon: ShoppingCart,
      permissions: ['SELLER', 'ADMIN'],
    },
  ];

  const renderMenuItem = (
    href: string,
    name: string,
    Icon: React.ElementType
  ) => (
    <li>
      <Link
        href={href}
        className={`flex items-center px-4 py-2 text-gray-700 ${
          pathname === href
            ? 'bg-gray-200 rounded-md'
            : 'hover:bg-gray-100 rounded-md'
        }`}
      >
        <Icon className="h-5 w-5 mr-2" />
        <span>{name}</span>
      </Link>
    </li>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Боковое меню */}
      <div
        className={`w-64 bg-white shadow-md transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:relative z-20 h-full`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-xl font-semibold text-gray-800">
            Панель управления
          </h1>
          <button onClick={toggleMenu} className="md:hidden text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="mt-4 px-2">
          <div className="text-sm text-gray-500 px-2 mb-2">Основное</div>
          <Link
            href="/admin"
            className={`flex items-center px-4 py-2 mt-1 text-gray-700 ${
              pathname === '/admin'
                ? 'bg-gray-200 rounded-md'
                : 'hover:bg-gray-100 rounded-md'
            }`}
          >
            <span>Обзор</span>
          </Link>

          <div className="border-t my-2"></div>

          {session.user.role === 'ADMIN' ? (
            <>
              <h3 className="text-sm font-medium mb-2 pl-3">
                Административное меню
              </h3>
              <ul className="space-y-1">
                {renderMenuItem('/admin', 'Панель управления', LayoutDashboard)}
                {renderMenuItem('/admin/users', 'Пользователи', Users)}
                {renderMenuItem('/admin/sellers', 'Продавцы', Store)}
                {renderMenuItem('/admin/cities', 'Города', MapPin)}
                {renderMenuItem('/admin/fish', 'Виды рыб', FishIcon)}
                {renderMenuItem('/admin/products', 'Товары', ShoppingCart)}
                {renderMenuItem('/admin/audit', 'Аудит действий', FileText)}
              </ul>
            </>
          ) : session.user.role === 'SELLER' ? (
            <>
              <h3 className="text-sm font-medium mb-2 pl-3">Меню продавца</h3>
              <ul className="space-y-1">
                {sellerMenuItems.map((item) =>
                  renderMenuItem(item.href, item.name, item.icon)
                )}
              </ul>
            </>
          ) : null}

          <div className="px-4 py-2 mt-8">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-100 rounded-md"
            >
              <span>Выйти</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Основное содержимое */}
      <div className="flex-1">
        {/* Верхняя панель */}
        <div className="bg-white shadow-sm">
          <div className="flex justify-between items-center p-4">
            <button onClick={toggleMenu} className="md:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {session?.user?.name || session?.user?.email}
              </span>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {isAdmin ? 'Администратор' : 'Продавец'}
              </span>
            </div>
          </div>
        </div>

        {/* Содержимое страницы */}
        <div className="p-6">{children}</div>
      </div>

      {/* Затемнение для мобильного меню */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleMenu}
        ></div>
      )}
    </div>
  );
}

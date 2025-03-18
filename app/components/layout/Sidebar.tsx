'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Clock, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Fish } from '@/app/types';

interface SidebarProps {
  activeCategory?: string | null;
  onCategorySelect?: (fishId: string | null) => void;
  cityParam?: string | null;
}

const Sidebar = ({
  activeCategory,
  onCategorySelect,
  cityParam,
}: SidebarProps) => {
  const pathname = usePathname();
  const [fishes, setFishes] = useState<Fish[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFishes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/fish');
        if (!response.ok) {
          throw new Error('Ошибка загрузки категорий');
        }
        const data = await response.json();
        setFishes(data);
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFishes();
  }, []);

  const handleCategoryClick = (fishId: string, e: React.MouseEvent) => {
    if (onCategorySelect) {
      e.preventDefault();
      onCategorySelect(fishId);
    }
  };

  // Формируем URL с сохранением параметра города
  const buildUrl = (path: string) => {
    return cityParam ? `${path}?city=${cityParam}` : path;
  };

  return (
    <aside className="w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 h-[calc(100vh-72px)] sticky top-[72px] flex flex-col">
      <div className="flex-1 p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
            Каталог деликатесов
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Выберите категорию морских деликатесов
          </p>
        </div>

        <nav>
          <ul className="space-y-1">
            <li>
              {onCategorySelect ? (
                <button
                  onClick={() => onCategorySelect(null)}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-all
                    ${
                      !activeCategory
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 font-medium'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                >
                  Все деликатесы
                </button>
              ) : (
                <Link
                  href={buildUrl('/shop')}
                  className={`block px-3 py-2 rounded-lg transition-all
                    ${
                      pathname === '/shop'
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 font-medium'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                >
                  Все деликатесы
                </Link>
              )}
            </li>
            {isLoading ? (
              <li className="px-3 py-2 text-sm text-zinc-500">
                Загрузка категорий...
              </li>
            ) : fishes.length > 0 ? (
              fishes.map((fish) => (
                <li key={fish.id}>
                  {onCategorySelect ? (
                    <button
                      onClick={(e) => handleCategoryClick(fish.id, e)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-all
                        ${
                          activeCategory === fish.id
                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 font-medium'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                    >
                      {fish.name}
                    </button>
                  ) : (
                    <Link
                      href={buildUrl(`/shop/${fish.id}`)}
                      className={`block px-3 py-2 rounded-lg transition-all
                        ${
                          pathname === `/shop/${fish.id}`
                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 font-medium'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                    >
                      {fish.name}
                    </Link>
                  )}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-zinc-500">
                Категории не найдены
              </li>
            )}
          </ul>
        </nav>
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <a href="tel:+79991234567">+7 (999) 123-45-67</a>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <a href="mailto:info@dimino.ru">info@dimino.ru</a>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Пн-Вс: 10:00 - 22:00</span>
          </div>
          <div className="pt-2 text-xs">
            <p>© 2024 МКД &ldquo;Дымино&rdquo;</p>
            <p>
              Разработка сайта{' '}
              <a
                href="https://biveki.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 hover:text-amber-600 dark:hover:text-amber-400"
              >
                Biveki Group
              </a>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

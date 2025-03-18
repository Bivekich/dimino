import Link from 'next/link';
import { Phone, Mail, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">О компании</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Мастерская крафтовых деликатесов &ldquo;Дымино&rdquo; -
              единственный в мире создатель уникальной, секретной технологии
              копчения морских деликатесов.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Контакты</h3>
            <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
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
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Навигация</h3>
            <div className="space-y-2 text-sm">
              <div>
                <Link
                  href="/"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400"
                >
                  Главная
                </Link>
              </div>
              <div>
                <Link
                  href="/shop"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400"
                >
                  Магазин
                </Link>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Мы в соцсетях</h3>
            <div className="space-y-2 text-sm">
              <div>
                <a
                  href="https://t.me/dimino"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400"
                >
                  Telegram
                </a>
              </div>
              <div>
                <a
                  href="https://vk.com/dimino"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400"
                >
                  VKontakte
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <div>© 2024 МКД &ldquo;Дымино&rdquo;. Все права защищены</div>
            <div>
              Разработка сайта{' '}
              <a
                href="https://biveki.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 hover:text-amber-600 dark:hover:text-amber-400"
              >
                Biveki Group
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Fish, HandMetal, Flame } from 'lucide-react';
import Loader from '@/app/components/ui/Loader';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] md:h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.jpg"
            alt="МКД Дымино"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        </div>

        <div className="container relative z-10 text-white px-4 md:px-6">
          <div className="max-w-4xl">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-8 leading-tight">
              Мастерская{' '}
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                крафтовых деликатесов
              </span>
            </h1>
            <p className="text-base sm:text-xl md:text-2xl mb-6 md:mb-12 text-zinc-200 leading-relaxed">
              Единственный в мире создатель уникальной, секретной технологии
              копчения морских деликатесов
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 md:gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-6 md:px-10 py-3 md:py-5 rounded-xl md:rounded-2xl text-base md:text-xl font-medium transition-all transform hover:scale-105"
            >
              Перейти в каталог
              <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white dark:from-zinc-900 h-16 md:h-32" />
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-32 bg-white dark:bg-zinc-900">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-6">
              Почему выбирают{' '}
              <span className="bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
                Дымино
              </span>
            </h2>
            <p className="text-base md:text-xl text-zinc-600 dark:text-zinc-400">
              Мы создаем деликатесы с особым вниманием к каждой детали
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
            <div className="group p-6 md:p-8 rounded-2xl md:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-amber-500/50 transition-all">
              <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-xl md:rounded-2xl bg-amber-50 dark:bg-amber-950/50 w-fit">
                <Fish className="h-6 w-6 md:h-8 md:w-8 text-amber-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-4">
                Уникальная рецептура
              </h3>
              <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Секретная, экологически чистая технология приготовления морских
                деликатесов, созданная нашими мастерами
              </p>
            </div>

            <div className="group p-6 md:p-8 rounded-2xl md:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-amber-500/50 transition-all">
              <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-xl md:rounded-2xl bg-amber-50 dark:bg-amber-950/50 w-fit">
                <HandMetal className="h-6 w-6 md:h-8 md:w-8 text-amber-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-4">
                Ручная работа
              </h3>
              <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                88 наименований продукции, каждое изделие создается вручную с
                особым вниманием к деталям
              </p>
            </div>

            <div className="group p-6 md:p-8 rounded-2xl md:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-amber-500/50 transition-all">
              <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-xl md:rounded-2xl bg-amber-50 dark:bg-amber-950/50 w-fit">
                <Flame className="h-6 w-6 md:h-8 md:w-8 text-amber-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-4">
                Два вида копчения
              </h3>
              <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Используем технологии как холодного, так и горячего копчения для
                создания неповторимого вкуса
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/cta-bg.jpg"
            alt="Морские деликатесы"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60" />
        </div>

        <div className="container relative z-10 px-4 md:px-6">
          <div className="max-w-2xl text-white">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-6">
              Откройте для себя мир изысканных вкусов
            </h2>
            <p className="text-base md:text-xl text-zinc-200 mb-6 md:mb-8 leading-relaxed">
              Погрузитесь в гастрономическое путешествие с нашими крафтовыми
              деликатесами, созданными с любовью к традициям и инновациям
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 md:gap-3 bg-white hover:bg-zinc-100 text-zinc-900 px-5 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-base md:text-lg font-medium transition-all transform hover:scale-105"
            >
              Выбрать деликатесы
              <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

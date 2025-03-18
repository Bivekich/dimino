import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/app/components/layout/Footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 h-[72px] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800 z-50">
        <div className="h-full px-3 md:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <Image
              src="/logo.png"
              alt="Дымино"
              width={44}
              height={44}
              className="w-10 h-10 md:w-11 md:h-11 rounded-xl"
            />
            <div>
              <h1 className="text-lg md:text-xl font-semibold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
                Дымино
              </h1>
              <p className="text-[10px] md:text-xs text-zinc-600 dark:text-zinc-400">
                Натуральное копчение
              </p>
            </div>
          </Link>

          <Link
            href="/shop"
            className="px-4 md:px-5 py-1.5 md:py-2 text-sm md:text-base rounded-full bg-gradient-to-r from-amber-600 to-amber-400 text-white font-medium hover:from-amber-700 hover:to-amber-500 transition-all"
          >
            Перейти в магазин
          </Link>
        </div>
      </header>

      <main className="flex-1 pt-[72px]">{children}</main>
      <Footer />
    </div>
  );
}

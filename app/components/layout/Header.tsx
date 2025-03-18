'use client';

import Image from 'next/image';
import Link from 'next/link';

interface HeaderProps {
  children?: React.ReactNode;
}

export default function Header({ children }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-[72px] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800 z-50">
      <div className="h-full px-3 md:px-6 w-full flex items-center justify-between">
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

        {/* Правая часть с корзиной и селектором города */}
        <div className="flex items-center gap-1 md:gap-4">{children}</div>
      </div>
    </header>
  );
}

'use client';

import Link from 'next/link';
import { Fish, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-900 relative overflow-hidden">
      {/* Волны на фоне */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0 animate-wave-slow"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='wave' width='100' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 15 Q25 5 50 15 T100 15' stroke='%23D97706' fill='none'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23wave)'/%3E%3C/svg%3E")`,
            backgroundSize: '100px 20px',
          }}
        />
        <div
          className="absolute inset-0 animate-wave-fast"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='wave' width='80' height='15' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 10 Q20 0 40 10 T80 10' stroke='%23D97706' fill='none'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23wave)'/%3E%3C/svg%3E")`,
            backgroundSize: '80px 15px',
          }}
        />
      </div>

      <div className="relative z-10 text-center px-6">
        {/* Анимированная рыбка */}
        <div className="relative mb-8 inline-block">
          <div className="animate-float">
            <Fish className="h-32 w-32 text-amber-500 transform -scale-x-100" />
            <div className="absolute top-1/2 -right-8 w-8 h-8 animate-bubble opacity-50">
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/50 animate-ping" />
            </div>
            <div className="absolute top-1/3 -right-4 w-4 h-4 animate-bubble-delay opacity-50">
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/50 animate-ping" />
            </div>
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-2 bg-amber-500/20 rounded-full filter blur-sm animate-pulse" />
        </div>

        {/* Текст */}
        <h1 className="text-8xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-3xl font-semibold mb-6 text-zinc-900 dark:text-zinc-100">
          Упс! Кажется, рыбка уплыла не туда
        </h2>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-12 max-w-lg mx-auto">
          Эта страница затерялась в глубинах интернета. Давайте вернёмся на
          поверхность!
        </p>

        {/* Кнопка возврата */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-4 rounded-2xl text-lg font-medium transition-all transform hover:scale-105"
        >
          <ArrowLeft className="h-6 w-6" />
          Вернуться на главную
        </Link>
      </div>

      <style jsx>{`
        @keyframes wave-slow {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100px);
          }
        }
        @keyframes wave-fast {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-80px);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes bubble {
          0%,
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-10px) scale(1.2);
            opacity: 0.8;
          }
        }
        @keyframes bubble-delay {
          0%,
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-15px) scale(1.1);
            opacity: 0.7;
          }
        }
        .animate-wave-slow {
          animation: wave-slow 10s linear infinite;
        }
        .animate-wave-fast {
          animation: wave-fast 8s linear infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-bubble {
          animation: bubble 2s ease-in-out infinite;
        }
        .animate-bubble-delay {
          animation: bubble-delay 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

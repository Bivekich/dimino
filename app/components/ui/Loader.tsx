import { Fish } from 'lucide-react';

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-zinc-900 z-[100] flex items-center justify-center">
      <div className="text-center flex flex-col items-center">
        <div className="relative flex items-center justify-center w-32 h-32">
          <div className="absolute inset-0 flex items-center justify-center">
            <Fish className="h-16 w-16 text-amber-500 animate-bounce" />
            <div className="absolute top-1/2 -right-4 w-4 h-4">
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/50 animate-ping" />
            </div>
            <div className="absolute top-1/3 -right-2 w-3 h-3">
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/50 animate-ping delay-150" />
            </div>
          </div>
          <div className="absolute bottom-4 w-12 h-1 bg-amber-500/20 rounded-full filter blur-sm animate-pulse" />
        </div>
        <p className="text-xl font-medium bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent animate-pulse mt-8">
          Загрузка...
        </p>
      </div>
    </div>
  );
}

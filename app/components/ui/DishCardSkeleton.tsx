export default function DishCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      <div className="p-4 space-y-4">
        <div className="h-6 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
          <div className="h-4 w-2/3 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
          <div className="h-9 w-9 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function DishCardSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <DishCardSkeleton key={index} />
      ))}
    </div>
  );
}

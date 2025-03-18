import DishCard from '@/app/components/ui/DishCard';
import Sidebar from '@/app/components/layout/Sidebar';
import { mockFishes, mockDishes } from '@/app/data';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  const filteredDishes = mockDishes.filter((dish) => dish.fishId === category);

  const currentFish = mockFishes.find((fish) => fish.id === category);

  return (
    <div className="flex min-h-screen">
      <Sidebar activeCategory={category} cityParam={null} />

      <main className="flex-1">
        <div className="md:pl-6 md:py-6 md:pr-3">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-2">
              {currentFish ? currentFish.name : 'Категория не найдена'}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              {currentFish
                ? 'Изысканные морские деликатесы ручной работы'
                : 'Попробуйте другую категорию'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 px-3 md:px-0">
            {filteredDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

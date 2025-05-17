import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Получение всех магазинов в конкретном городе
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cityId } = await params;

    // Проверяем существование города
    const city = await prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!city) {
      return NextResponse.json({ error: 'Город не найден' }, { status: 404 });
    }

    // Получаем всех продавцов в данном городе
    const sellers = await prisma.seller.findMany({
      where: { cityId },
      select: {
        id: true,
        address: true,
        phone: true,
        workingHours: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // Преобразуем формат данных для клиента
    const stores = sellers.map((seller) => ({
      id: seller.id,
      name: seller.user.name,
      address: seller.address || '',
      phone: seller.phone || '',
      workingHours: seller.workingHours || '',
    }));

    return NextResponse.json(stores);
  } catch (error) {
    console.error('Ошибка при получении магазинов города:', error);
    return NextResponse.json(
      { error: 'Не удалось получить магазины' },
      { status: 500 }
    );
  }
}

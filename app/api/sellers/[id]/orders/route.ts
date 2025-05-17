import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

interface RouteParams {
  params: Promise<{ id: string }>; 
}

// Получение всех заявок, связанных с товарами продавца
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: sellerId } = await params;
    const session = await getServerSession(authOptions);

    // Проверяем авторизацию
    if (!session) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    // Проверяем права: админ может видеть заявки любого продавца,
    // продавец только свои
    if (
      session.user.role !== 'ADMIN' &&
      (session.user.role !== 'SELLER' ||
        !(await isSeller(session.user.id, sellerId)))
    ) {
      return NextResponse.json(
        { error: 'Нет прав для просмотра этих заявок' },
        { status: 403 }
      );
    }

    // Получаем все товары продавца
    const products = await prisma.product.findMany({
      where: { sellerId },
      select: { id: true },
    });

    const productIds = products.map((p) => p.id);

    // Если у продавца нет товаров, возвращаем пустой массив
    if (productIds.length === 0) {
      return NextResponse.json([]);
    }

    // Находим все заказы, содержащие товары продавца
    const orders = await prisma.order.findMany({
      where: {
        orderItems: {
          some: {
            productId: {
              in: productIds,
            },
          },
        },
      },
      include: {
        city: true,
        orderItems: {
          include: {
            product: {
              include: {
                media: {
                  where: { type: 'IMAGE' },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Ошибка при получении заявок:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке заявок' },
      { status: 500 }
    );
  }
}

// Вспомогательная функция для проверки, является ли пользователь продавцом
async function isSeller(userId: string, sellerId: string): Promise<boolean> {
  const seller = await prisma.seller.findFirst({
    where: {
      id: sellerId,
      userId,
    },
  });

  return !!seller;
}

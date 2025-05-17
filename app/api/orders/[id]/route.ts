import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Обновление статуса заказа
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id: orderId } = await params;
    const session = await getServerSession(authOptions);
    const { status } = await request.json();

    // Проверяем авторизацию
    if (!session) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    // Проверяем, что статус является допустимым значением
    const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Недопустимый статус заказа' },
        { status: 400 }
      );
    }

    // Получаем заказ
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                sellerId: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    // Проверяем права: админ может обновлять любой заказ,
    // продавец только заказы с его товарами
    if (session.user.role !== 'ADMIN') {
      if (session.user.role !== 'SELLER') {
        return NextResponse.json(
          { error: 'Нет прав для обновления этого заказа' },
          { status: 403 }
        );
      }

      // Получаем данные о продавце
      const seller = await prisma.seller.findFirst({
        where: { userId: session.user.id },
      });

      if (!seller) {
        return NextResponse.json(
          { error: 'Продавец не найден' },
          { status: 403 }
        );
      }

      // Проверяем, есть ли в заказе товары этого продавца
      const hasSellerProducts = order.orderItems.some(
        (item) => item.product.sellerId === seller.id
      );

      if (!hasSellerProducts) {
        return NextResponse.json(
          { error: 'Нет прав для обновления этого заказа' },
          { status: 403 }
        );
      }
    }

    // Обновляем статус заказа
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
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
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Ошибка при обновлении заказа:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении заказа' },
      { status: 500 }
    );
  }
}

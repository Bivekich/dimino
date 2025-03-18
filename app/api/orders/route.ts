import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { CartItem } from '@/app/types';

interface OrderData {
  name: string;
  phone: string;
  email: string;
  comment: string;
  items: CartItem[];
  selectedCity: string;
}

export async function POST(request: Request) {
  try {
    const data: OrderData = await request.json();
    const { name, phone, email, comment, items, selectedCity } = data;

    // Проверяем наличие всех необходимых данных
    if (!name || !phone || !email || !items.length || !selectedCity) {
      return NextResponse.json(
        {
          success: false,
          message: 'Пожалуйста, заполните все обязательные поля',
        },
        { status: 400 }
      );
    }

    // Создаем заявку в базе данных
    const order = await prisma.order.create({
      data: {
        name,
        email,
        phone,
        comment: comment || '',
        cityId: selectedCity,
        orderItems: {
          create: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Генерируем номер заказа на основе ID
    const orderNumber = order.id.slice(-6).toUpperCase();

    return NextResponse.json({
      success: true,
      message: 'Заявка успешно создана',
      orderNumber,
      orderId: order.id,
    });
  } catch (error) {
    console.error('Ошибка при создании заявки:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Произошла ошибка при создании заявки',
      },
      { status: 500 }
    );
  }
}

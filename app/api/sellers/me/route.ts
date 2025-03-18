import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

// Получение информации о текущем продавце
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступно только для продавцов' },
        { status: 403 }
      );
    }

    // Если пользователь админ, но не связан с продавцом, возвращаем ошибку
    // В реальной ситуации здесь может быть более гибкая логика
    const seller = await prisma.seller.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        city: true,
      },
    });

    if (!seller) {
      return NextResponse.json(
        { error: 'Информация о продавце не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json(seller);
  } catch (error) {
    console.error('Ошибка получения данных продавца:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении данных' },
      { status: 500 }
    );
  }
}

// Обновление информации о текущем продавце
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступно только для продавцов' },
        { status: 403 }
      );
    }

    const seller = await prisma.seller.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    if (!seller) {
      return NextResponse.json(
        { error: 'Информация о продавце не найдена' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { address, phone, workingHours } = body;

    const updatedSeller = await prisma.seller.update({
      where: {
        id: seller.id,
      },
      data: {
        address: address ?? seller.address,
        phone: phone ?? seller.phone,
        workingHours: workingHours ?? seller.workingHours,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        city: true,
      },
    });

    return NextResponse.json(updatedSeller);
  } catch (error) {
    console.error('Ошибка обновления данных продавца:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении данных' },
      { status: 500 }
    );
  }
}

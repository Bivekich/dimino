import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';
import { logAuditAction } from '@/lib/audit';

// Получение всех продавцов (только для админа)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Получаем всех продавцов с информацией о пользователе и городе
    const sellers = await prisma.seller.findMany({
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

    return NextResponse.json(sellers);
  } catch (error) {
    console.error('Error getting sellers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sellers' },
      { status: 500 }
    );
  }
}

// Создание нового продавца (только для админа)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, cityId } = body;

    if (!userId || !cityId) {
      return NextResponse.json(
        { error: 'User ID and City ID are required' },
        { status: 400 }
      );
    }

    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Проверяем существование города
    const city = await prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!city) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }

    // Проверяем, не является ли пользователь уже продавцом
    const existingSeller = await prisma.seller.findFirst({
      where: { userId },
    });

    if (existingSeller) {
      return NextResponse.json(
        { error: 'This user is already a seller' },
        { status: 400 }
      );
    }

    // Обновляем роль пользователя на SELLER
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'SELLER' },
    });

    // Создаем запись продавца
    const seller = await prisma.seller.create({
      data: {
        userId,
        cityId,
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

    // Логируем действие в аудит
    await logAuditAction({
      action: 'CREATE',
      entityId: seller.id,
      entityType: 'SELLER',
      description: `Пользователь "${seller.user.email}" добавлен как продавец`,
      userId: session.user.id,
    });

    return NextResponse.json(seller);
  } catch (error) {
    console.error('Error creating seller:', error);
    return NextResponse.json(
      { error: 'Failed to create seller' },
      { status: 500 }
    );
  }
}

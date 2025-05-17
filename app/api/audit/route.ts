import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Формируем базовое условие запроса в зависимости от роли пользователя
    const where =
      session.user.role === 'ADMIN'
        ? {} // Админ видит все записи
        : { userId: session.user.id }; // Обычный пользователь видит только свои записи

    // Получение общего количества записей
    const total = await prisma.audit.count({ where });

    // Получение записей с пагинацией
    const audits = await prisma.audit.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      audits,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Ошибка при получении данных аудита:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при получении данных аудита' },
      { status: 500 }
    );
  }
}

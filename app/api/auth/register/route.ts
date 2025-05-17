import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { authOptions } from '../[...nextauth]/auth';
import { logAuditAction } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Только админы могут создавать пользователей
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, name, password, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли пользователь с таким email
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        role: role || 'USER',
      },
    });

    // Логируем действие в аудит
    await logAuditAction({
      action: 'CREATE',
      entityId: user.id,
      entityType: 'USER',
      description: `Создан пользователь "${user.email}" с ролью ${user.role}`,
      userId: session.user.id,
    });

    // Если пользователь создается с ролью SELLER, но не указывается город,
    // логируем это отдельно для понимания причины отсутствия в таблице продавцов
    if (user.role === 'SELLER') {
      // Получаем первый доступный город
      const firstCity = await prisma.city.findFirst();

      if (firstCity) {
        // Создаем запись продавца
        const seller = await prisma.seller.create({
          data: {
            userId: user.id,
            cityId: firstCity.id,
          },
        });

        await logAuditAction({
          action: 'CREATE',
          entityId: seller.id,
          entityType: 'SELLER',
          description: `Пользователь "${user.email}" добавлен как продавец в городе "${firstCity.name}"`,
          userId: session.user.id,
        });
      } else {
        await logAuditAction({
          action: 'CREATE',
          entityId: user.id,
          entityType: 'SELLER',
          description: `Пользователь "${user.email}" установлен как продавец без назначения города (нет доступных городов)`,
          userId: session.user.id,
        });
      }
    }

    // Не возвращаем пароль
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}

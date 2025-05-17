import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/auth';
import { logAuditAction } from '@/lib/audit';

// Получение пользователя по ID (только для админа)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Несанкционированный доступ' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    return NextResponse.json(
      { error: 'Не удалось получить данные пользователя' },
      { status: 500 }
    );
  }
}

// Обновление пользователя (только для админа)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Несанкционированный доступ' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, role } = body;

    // Получаем текущего пользователя
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Подготавливаем данные для обновления
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;

    // Обновляем пользователя
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Если роль пользователя изменилась на SELLER, создаем запись продавца
    if (role === 'SELLER' && existingUser.role !== 'SELLER') {
      // Проверяем, нет ли уже записи продавца для этого пользователя
      const existingSeller = await prisma.seller.findFirst({
        where: { userId: id },
      });

      if (!existingSeller) {
        // Получаем первый доступный город
        const firstCity = await prisma.city.findFirst();

        if (firstCity) {
          // Создаем запись продавца
          await prisma.seller.create({
            data: {
              userId: id,
              cityId: firstCity.id,
            },
          });

          // Логируем действие в аудит
          await logAuditAction({
            action: 'CREATE',
            entityId: id,
            entityType: 'SELLER',
            description: `Пользователь "${updatedUser.email}" добавлен как продавец`,
            userId: session.user.id,
          });
        }
      }
    }

    // Логируем действие в аудит
    await logAuditAction({
      action: 'UPDATE',
      entityId: id,
      entityType: 'USER',
      description: `Обновлен пользователь "${updatedUser.email}"`,
      userId: session.user.id,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    return NextResponse.json(
      { error: 'Не удалось обновить пользователя' },
      { status: 500 }
    );
  }
}

// Удаление пользователя (только для админа)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Несанкционированный доступ' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Получаем текущего пользователя для логирования
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Удаляем пользователя
    await prisma.user.delete({
      where: { id },
    });

    // Логируем действие в аудит
    await logAuditAction({
      action: 'DELETE',
      entityId: id,
      entityType: 'USER',
      description: `Удален пользователь "${existingUser.email}"`,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    return NextResponse.json(
      { error: 'Не удалось удалить пользователя' },
      { status: 500 }
    );
  }
}

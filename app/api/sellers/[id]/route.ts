import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';
import { logAuditAction } from '@/lib/audit';

// Получение продавца по ID (только для админа)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Несанкционированный доступ' },
        { status: 401 }
      );
    }

    const id = params.id;
    const seller = await prisma.seller.findUnique({
      where: { id },
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
        { error: 'Продавец не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(seller);
  } catch (error) {
    console.error('Ошибка при получении продавца:', error);
    return NextResponse.json(
      { error: 'Не удалось получить данные продавца' },
      { status: 500 }
    );
  }
}

// Обновление продавца (только для админа)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Несанкционированный доступ' },
        { status: 401 }
      );
    }

    const id = params.id;
    const body = await request.json();
    const { cityId, address, phone, workingHours } = body;

    // Получаем текущего продавца
    const existingSeller = await prisma.seller.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!existingSeller) {
      return NextResponse.json(
        { error: 'Продавец не найден' },
        { status: 404 }
      );
    }

    // Проверяем, существует ли город
    if (cityId) {
      const city = await prisma.city.findUnique({
        where: { id: cityId },
      });

      if (!city) {
        return NextResponse.json({ error: 'Город не найден' }, { status: 404 });
      }
    }

    // Обновляем продавца
    const updatedSeller = await prisma.seller.update({
      where: { id },
      data: {
        cityId: cityId || undefined,
        address: address !== undefined ? address : undefined,
        phone: phone !== undefined ? phone : undefined,
        workingHours: workingHours !== undefined ? workingHours : undefined,
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
      action: 'UPDATE',
      entityId: id,
      entityType: 'SELLER',
      description: `Обновлен продавец "${updatedSeller.user.email}"`,
      userId: session.user.id,
    });

    return NextResponse.json(updatedSeller);
  } catch (error) {
    console.error('Ошибка при обновлении продавца:', error);
    return NextResponse.json(
      { error: 'Не удалось обновить продавца' },
      { status: 500 }
    );
  }
}

// Удаление продавца (только для админа)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Несанкционированный доступ' },
        { status: 401 }
      );
    }

    const id = params.id;

    // Получаем текущего продавца для логирования
    const existingSeller = await prisma.seller.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!existingSeller) {
      return NextResponse.json(
        { error: 'Продавец не найден' },
        { status: 404 }
      );
    }

    // Обновляем роль пользователя на USER
    await prisma.user.update({
      where: { id: existingSeller.user.id },
      data: { role: 'USER' },
    });

    // Удаляем продавца
    await prisma.seller.delete({
      where: { id },
    });

    // Логируем действие в аудит
    await logAuditAction({
      action: 'DELETE',
      entityId: id,
      entityType: 'SELLER',
      description: `Удален продавец "${existingSeller.user.email}"`,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка при удалении продавца:', error);
    return NextResponse.json(
      { error: 'Не удалось удалить продавца' },
      { status: 500 }
    );
  }
}

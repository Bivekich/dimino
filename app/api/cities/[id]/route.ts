import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/auth';
import { logAuditAction } from '@/lib/audit';

// Получение города по ID
export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop();
    const city = await prisma.city.findUnique({
      where: { id },
    });

    if (!city) {
      return NextResponse.json({ error: 'Город не найден' }, { status: 404 });
    }

    return NextResponse.json(city);
  } catch (error) {
    console.error('Ошибка при получении города:', error);
    return NextResponse.json(
      { error: 'Не удалось получить данные города' },
      { status: 500 }
    );
  }
}

// Обновление города (только для админа)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Несанкционированный доступ' },
        { status: 401 }
      );
    }

    const id = request.nextUrl.pathname.split('/').pop();
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Название города обязательно' },
        { status: 400 }
      );
    }

    // Проверяем существование города
    const existingCity = await prisma.city.findUnique({
      where: { id },
    });

    if (!existingCity) {
      return NextResponse.json({ error: 'Город не найден' }, { status: 404 });
    }

    // Проверяем, не существует ли другой город с таким же названием
    const duplicateCity = await prisma.city.findUnique({
      where: { name },
    });

    if (duplicateCity && duplicateCity.id !== id) {
      return NextResponse.json(
        { error: 'Город с таким названием уже существует' },
        { status: 400 }
      );
    }

    // Обновляем город
    const updatedCity = await prisma.city.update({
      where: { id },
      data: { name },
    });

    // Логируем действие в аудит
    await logAuditAction({
      action: 'UPDATE',
      entityId: id || '',
      entityType: 'CITY',
      description: `Обновлен город "${updatedCity.name}"`,
      userId: session.user.id,
    });

    return NextResponse.json(updatedCity);
  } catch (error) {
    console.error('Ошибка при обновлении города:', error);
    return NextResponse.json(
      { error: 'Не удалось обновить город' },
      { status: 500 }
    );
  }
}

// Удаление города (только для админа)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Несанкционированный доступ' },
        { status: 401 }
      );
    }

    const id = request.nextUrl.pathname.split('/').pop();

    // Проверяем существование города
    const existingCity = await prisma.city.findUnique({
      where: { id },
    });

    if (!existingCity) {
      return NextResponse.json({ error: 'Город не найден' }, { status: 404 });
    }

    // Проверяем, используется ли город продавцами
    const sellersUsingCity = await prisma.seller.count({
      where: { cityId: id },
    });

    if (sellersUsingCity > 0) {
      return NextResponse.json(
        {
          error: 'Невозможно удалить город, так как он используется продавцами',
        },
        { status: 400 }
      );
    }

    // Проверяем, используется ли город товарами
    const productsUsingCity = await prisma.product.count({
      where: { cityId: id },
    });

    if (productsUsingCity > 0) {
      return NextResponse.json(
        {
          error: 'Невозможно удалить город, так как он используется в товарах',
        },
        { status: 400 }
      );
    }

    // Удаляем город
    await prisma.city.delete({
      where: { id },
    });

    // Логируем действие в аудит
    await logAuditAction({
      action: 'DELETE',
      entityId: id || '',
      entityType: 'CITY',
      description: `Удален город "${existingCity.name}"`,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка при удалении города:', error);
    return NextResponse.json(
      { error: 'Не удалось удалить город' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';
import { logAuditAction } from '@/lib/audit';

// Получение вида рыбы по ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const fish = await prisma.fish.findUnique({
      where: { id },
    });

    if (!fish) {
      return NextResponse.json(
        { error: 'Вид рыбы не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(fish);
  } catch (error) {
    console.error('Ошибка при получении вида рыбы:', error);
    return NextResponse.json(
      { error: 'Не удалось получить данные о виде рыбы' },
      { status: 500 }
    );
  }
}

// Обновление вида рыбы (только для админа)
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
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Название вида рыбы обязательно' },
        { status: 400 }
      );
    }

    // Проверяем существование вида рыбы
    const existingFish = await prisma.fish.findUnique({
      where: { id },
    });

    if (!existingFish) {
      return NextResponse.json(
        { error: 'Вид рыбы не найден' },
        { status: 404 }
      );
    }

    // Проверяем, не существует ли уже другой вид рыбы с таким же названием
    const duplicateFish = await prisma.fish.findFirst({
      where: {
        name,
        id: { not: id },
      },
    });

    if (duplicateFish) {
      return NextResponse.json(
        { error: 'Вид рыбы с таким названием уже существует' },
        { status: 400 }
      );
    }

    // Обновляем вид рыбы
    const updatedFish = await prisma.fish.update({
      where: { id },
      data: { name },
    });

    // Логируем действие в аудит
    await logAuditAction({
      action: 'UPDATE',
      entityId: id,
      entityType: 'FISH',
      description: `Обновлен вид рыбы: "${existingFish.name}" -> "${updatedFish.name}"`,
      userId: session.user.id,
    });

    return NextResponse.json(updatedFish);
  } catch (error) {
    console.error('Ошибка при обновлении вида рыбы:', error);
    return NextResponse.json(
      { error: 'Не удалось обновить вид рыбы' },
      { status: 500 }
    );
  }
}

// Удаление вида рыбы (только для админа)
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

    // Проверяем существование вида рыбы
    const existingFish = await prisma.fish.findUnique({
      where: { id },
    });

    if (!existingFish) {
      return NextResponse.json(
        { error: 'Вид рыбы не найден' },
        { status: 404 }
      );
    }

    // Проверяем, используется ли вид рыбы в товарах
    const productsUsingFish = await prisma.product.count({
      where: { fishId: id },
    });

    if (productsUsingFish > 0) {
      return NextResponse.json(
        {
          error: `Невозможно удалить вид рыбы, так как он используется в ${productsUsingFish} товарах`,
        },
        { status: 400 }
      );
    }

    // Удаляем вид рыбы
    await prisma.fish.delete({
      where: { id },
    });

    // Логируем действие в аудит
    await logAuditAction({
      action: 'DELETE',
      entityId: id,
      entityType: 'FISH',
      description: `Удален вид рыбы "${existingFish.name}"`,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка при удалении вида рыбы:', error);
    return NextResponse.json(
      { error: 'Не удалось удалить вид рыбы' },
      { status: 500 }
    );
  }
}

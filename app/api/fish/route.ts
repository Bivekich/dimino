import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';
import { logAuditAction } from '@/lib/audit';

// Получение всех видов рыб
export async function GET() {
  try {
    const fish = await prisma.fish.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(fish);
  } catch (error) {
    console.error('Error getting fish:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fish' },
      { status: 500 }
    );
  }
}

// Создание нового вида рыбы (только для админа)
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
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Fish name is required' },
        { status: 400 }
      );
    }

    // Проверяем, не существует ли уже рыба с таким названием
    const existingFish = await prisma.fish.findUnique({
      where: { name },
    });

    if (existingFish) {
      return NextResponse.json(
        { error: 'Fish with this name already exists' },
        { status: 400 }
      );
    }

    // Создаем новую рыбу
    const fish = await prisma.fish.create({
      data: { name },
    });

    // Логируем действие в аудит
    await logAuditAction({
      action: 'CREATE',
      entityId: fish.id,
      entityType: 'FISH',
      description: `Создан новый вид рыбы "${fish.name}"`,
      userId: session.user.id,
    });

    return NextResponse.json(fish);
  } catch (error) {
    console.error('Error creating fish:', error);
    return NextResponse.json(
      { error: 'Failed to create fish' },
      { status: 500 }
    );
  }
}

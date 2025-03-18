import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

// Получение всех городов
export async function GET() {
  try {
    const cities = await prisma.city.findMany();
    return NextResponse.json(cities);
  } catch (error) {
    console.error('Error getting cities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}

// Создание нового города (только для админа)
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
        { error: 'City name is required' },
        { status: 400 }
      );
    }

    // Проверяем, не существует ли уже город с таким названием
    const existingCity = await prisma.city.findUnique({
      where: { name },
    });

    if (existingCity) {
      return NextResponse.json(
        { error: 'City with this name already exists' },
        { status: 400 }
      );
    }

    // Создаем новый город
    const city = await prisma.city.create({
      data: { name },
    });

    return NextResponse.json(city);
  } catch (error) {
    console.error('Error creating city:', error);
    return NextResponse.json(
      { error: 'Failed to create city' },
      { status: 500 }
    );
  }
}

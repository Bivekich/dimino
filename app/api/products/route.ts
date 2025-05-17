import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/auth';
import { logAuditAction } from '@/lib/audit';

// Получение всех товаров с фильтрацией по городу
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('cityId');
    const sellerId = searchParams.get('sellerId');

    let whereCondition = {};

    if (cityId) {
      whereCondition = { ...whereCondition, cityId };
    }

    if (sellerId) {
      whereCondition = { ...whereCondition, sellerId };
    }

    const products = await prisma.product.findMany({
      where: whereCondition,
      include: {
        seller: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        city: true,
        fish: true,
        media: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// Создание нового товара (для продавцов)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN')
    ) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, weight, inStock, fishId, media } = body;

    if (!name || !description || !weight) {
      return NextResponse.json(
        { error: 'Name, description and weight are required' },
        { status: 400 }
      );
    }

    // Если пользователь - продавец, получаем его данные
    let sellerId: string;
    let cityId: string;

    if (session.user.role === 'SELLER') {
      const seller = await prisma.seller.findFirst({
        where: { userId: session.user.id },
        select: { id: true, cityId: true },
      });

      if (!seller) {
        return NextResponse.json(
          { error: 'Seller information not found' },
          { status: 404 }
        );
      }

      sellerId = seller.id;
      cityId = seller.cityId;
    } else {
      // Для админа требуем указать sellerId и cityId
      sellerId = body.sellerId;
      cityId = body.cityId;

      if (!sellerId || !cityId) {
        return NextResponse.json(
          { error: 'Seller ID and City ID are required for admin' },
          { status: 400 }
        );
      }
    }

    // Создаем товар
    const product = await prisma.product.create({
      data: {
        name,
        description,
        weight,
        inStock: inStock ?? true,
        fishId: fishId || null,
        sellerId,
        cityId,
        media: {
          create:
            media?.map((item: { url: string; type: 'IMAGE' | 'VIDEO' }) => ({
              url: item.url,
              type: item.type,
            })) || [],
        },
      },
      include: {
        seller: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        city: true,
        fish: true,
        media: true,
      },
    });

    // Логируем действие в аудит
    await logAuditAction({
      action: 'CREATE',
      entityId: product.id,
      entityType: 'PRODUCT',
      description: `Создан товар "${name}"`,
      userId: session.user.id,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

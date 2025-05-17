import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/auth';
import { logAuditAction } from '@/lib/audit';

// Получение информации о товаре
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Получаем ID из params асинхронно
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        city: true,
        fish: true,
        media: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error getting product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// Обновление товара (только для владельца-продавца или админа)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Получаем ID из params асинхронно
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Получаем товар для проверки прав доступа
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Проверяем, имеет ли пользователь право редактировать товар
    if (
      session.user.role !== 'ADMIN' &&
      (session.user.role !== 'SELLER' ||
        product.seller.userId !== session.user.id)
    ) {
      return NextResponse.json(
        { error: "You don't have permission to edit this product" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, weight, inStock, fishId, media } = body;

    // Подготавливаем данные для обновления
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (weight !== undefined) updateData.weight = weight;
    if (inStock !== undefined) updateData.inStock = inStock;
    if (fishId !== undefined) updateData.fishId = fishId || null;

    // Обновляем товар
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
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

    // Если указаны новые медиа, обновляем их
    if (media) {
      // Удаляем все существующие медиа
      await prisma.media.deleteMany({
        where: { productId: id },
      });

      // Создаем новые медиа
      await Promise.all(
        media.map((item: { url: string; type: 'IMAGE' | 'VIDEO' }) =>
          prisma.media.create({
            data: {
              url: item.url,
              type: item.type,
              productId: id,
            },
          })
        )
      );

      // Получаем обновленный товар со всеми медиа
      const productWithMedia = await prisma.product.findUnique({
        where: { id },
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
        action: 'UPDATE',
        entityId: id,
        entityType: 'PRODUCT',
        description: `Обновлен товар "${
          productWithMedia?.name || 'Неизвестный товар'
        }"`,
        userId: session.user.id,
      });

      return NextResponse.json(productWithMedia);
    }

    // Логируем действие в аудит
    await logAuditAction({
      action: 'UPDATE',
      entityId: id,
      entityType: 'PRODUCT',
      description: `Обновлен товар "${updatedProduct.name}"`,
      userId: session.user.id,
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// Удаление товара (только для владельца-продавца или админа)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Получаем ID из params асинхронно
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Получаем товар для проверки прав доступа
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Проверяем, имеет ли пользователь право удалить товар
    if (
      session.user.role !== 'ADMIN' &&
      (session.user.role !== 'SELLER' ||
        product.seller.userId !== session.user.id)
    ) {
      return NextResponse.json(
        { error: "You don't have permission to delete this product" },
        { status: 403 }
      );
    }

    // Удаляем товар (каскадно удалятся и все связанные медиа благодаря onDelete: Cascade)
    await prisma.product.delete({
      where: { id },
    });

    // Логируем действие в аудит
    await logAuditAction({
      action: 'DELETE',
      entityId: id,
      entityType: 'PRODUCT',
      description: `Удален товар "${product.name}"`,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

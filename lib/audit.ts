import prisma from '@/lib/prisma';
import { AuditAction, EntityType } from '@prisma/client';

interface AuditLogParams {
  action: AuditAction;
  entityId: string;
  entityType: EntityType;
  description: string;
  userId: string;
}

/**
 * Записывает действие в журнал аудита
 */
export const logAuditAction = async ({
  action,
  entityId,
  entityType,
  description,
  userId,
}: AuditLogParams) => {
  try {
    await prisma.audit.create({
      data: {
        action,
        entityId,
        entityType,
        description,
        userId,
      },
    });
  } catch (error) {
    console.error('Ошибка при записи аудита:', error);
  }
};

/**
 * Создает читаемое описание действия для аудита
 */
export const getActionDescription = (
  action: AuditAction,
  entityType: EntityType,
  entityName: string
): string => {
  const actionText = {
    CREATE: 'создан',
    UPDATE: 'обновлен',
    DELETE: 'удален',
  };

  const entityText = {
    USER: 'Пользователь',
    SELLER: 'Продавец',
    CITY: 'Город',
    FISH: 'Вид рыбы',
    PRODUCT: 'Товар',
    MEDIA: 'Медиа',
  };

  return `${entityText[entityType]} "${entityName}" был ${actionText[action]}`;
};

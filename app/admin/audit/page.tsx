'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const ACTION_COLORS = {
  CREATE: 'bg-green-600',
  UPDATE: 'bg-blue-600',
  DELETE: 'bg-red-600',
};

const ENTITY_LABELS = {
  USER: 'Пользователь',
  SELLER: 'Продавец',
  CITY: 'Город',
  FISH: 'Рыба',
  PRODUCT: 'Товар',
  MEDIA: 'Медиа',
};

const ACTION_LABELS = {
  CREATE: 'Создание',
  UPDATE: 'Обновление',
  DELETE: 'Удаление',
};

type Audit = {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityId: string;
  entityType: 'USER' | 'SELLER' | 'CITY' | 'FISH' | 'PRODUCT' | 'MEDIA';
  description: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: 'USER' | 'SELLER' | 'ADMIN';
  };
};

type AuditResponse = {
  audits: Audit[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export default function AuditPage() {
  const { data: session } = useSession();
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditData = async (pageNumber: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/audit?page=${pageNumber}&limit=10`);

      if (!response.ok) {
        throw new Error('Не удалось загрузить данные аудита');
      }

      const data = await response.json();
      setAuditData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
      console.error('Ошибка при загрузке данных аудита:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchAuditData(page);
    }
  }, [session, page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Загрузка сессии...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Журнал аудита</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : auditData && auditData.audits.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Время</TableHead>
                    <TableHead>Действие</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Пользователь</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditData.audits.map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell className="font-medium">
                        {format(
                          new Date(audit.createdAt),
                          'dd MMM yyyy HH:mm',
                          { locale: ru }
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={ACTION_COLORS[audit.action]}>
                          {ACTION_LABELS[audit.action]}
                        </Badge>
                      </TableCell>
                      <TableCell>{ENTITY_LABELS[audit.entityType]}</TableCell>
                      <TableCell>{audit.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{audit.user.name || 'Без имени'}</span>
                          <span className="text-sm text-gray-500">
                            {audit.user.email}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Всего: {auditData.meta.total} записей
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    Назад
                  </Button>
                  <span className="py-2 px-3">
                    {page} из {auditData.meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= auditData.meta.totalPages}
                  >
                    Вперед
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">
              Записи аудита отсутствуют
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

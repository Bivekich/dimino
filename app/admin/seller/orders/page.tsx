'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OrderItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    media: {
      url: string;
    }[];
  };
}

interface Order {
  id: string;
  name: string;
  email: string;
  phone: string;
  comment: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  orderItems: OrderItem[];
  city: {
    name: string;
  };
}

export default function SellerOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (
      !session ||
      (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN')
    ) {
      setLoading(false);
      return;
    }

    async function fetchOrders() {
      try {
        // Получаем данные о продавце
        const sellerResponse = await fetch('/api/sellers/me');
        if (!sellerResponse.ok) {
          throw new Error('Не удалось получить данные о продавце');
        }
        const sellerData = await sellerResponse.json();

        // Получаем заявки для продавца
        const response = await fetch(`/api/sellers/${sellerData.id}/orders`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          toast.error('Ошибка при загрузке заявок');
        }
      } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
        toast.error('Не удалось загрузить заявки');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [session, status]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    if (!selectedOrder) return;

    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();

        // Обновляем заказ в локальном состоянии
        setOrders(orders.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        ));

        // Обновляем выбранный заказ
        setSelectedOrder(updatedOrder);

        toast.success('Статус заказа успешно обновлен');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка при обновлении статуса заказа');
      }
    } catch (error) {
      console.error('Ошибка при обновлении статуса заказа:', error);
      toast.error('Не удалось обновить статус заказа');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <Clock className="w-3.5 h-3.5 mr-1" />
            Ожидает обработки
          </Badge>
        );
      case 'PROCESSING':
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <Clock className="w-3.5 h-3.5 mr-1" />В обработке
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            Выполнено
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Отменено
          </Badge>
        );
      default:
        return <Badge variant="outline">Неизвестно</Badge>;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-4">Загрузка...</p>
      </div>
    );
  }

  if (
    !session ||
    (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN')
  ) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Доступ запрещен</h2>
        <p>У вас нет прав для просмотра этой страницы.</p>
        <p className="mt-4">
          <Link href="/" className="text-blue-600 hover:underline">
            Вернуться на главную
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Заявки от покупателей</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-lg text-gray-600">
            У вас пока нет заявок от покупателей
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Номер</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Покупатель</TableHead>
                <TableHead>Город</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.id.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm', {
                      locale: ru,
                    })}
                  </TableCell>
                  <TableCell>{order.name}</TableCell>
                  <TableCell>{order.city.name}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Подробности
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Информация о заявке №{selectedOrder?.id.slice(-6).toUpperCase()}
            </AlertDialogTitle>
          </AlertDialogHeader>

          {selectedOrder && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-lg mb-3">
                  Информация о покупателе
                </h3>
                <dl className="space-y-2">
                  <div className="grid grid-cols-2">
                    <dt className="text-gray-600">ФИО:</dt>
                    <dd>{selectedOrder.name}</dd>
                  </div>
                  <div className="grid grid-cols-2">
                    <dt className="text-gray-600">Email:</dt>
                    <dd>{selectedOrder.email}</dd>
                  </div>
                  <div className="grid grid-cols-2">
                    <dt className="text-gray-600">Телефон:</dt>
                    <dd>{selectedOrder.phone}</dd>
                  </div>
                  <div className="grid grid-cols-2">
                    <dt className="text-gray-600">Город:</dt>
                    <dd>{selectedOrder.city.name}</dd>
                  </div>
                  <div className="grid grid-cols-2">
                    <dt className="text-gray-600">Дата заявки:</dt>
                    <dd>
                      {format(
                        new Date(selectedOrder.createdAt),
                        'dd MMMM yyyy, HH:mm',
                        { locale: ru }
                      )}
                    </dd>
                  </div>
                  <div className="grid grid-cols-2">
                    <dt className="text-gray-600">Статус:</dt>
                    <dd className="flex items-center space-x-2">
                      {getStatusBadge(selectedOrder.status)}
                      <Select
                        defaultValue={selectedOrder.status}
                        onValueChange={(value) => 
                          handleUpdateStatus(
                            selectedOrder.id, 
                            value as Order['status']
                          )
                        }
                        disabled={updatingStatus}
                      >
                        <SelectTrigger className="w-[180px] ml-2">
                          <SelectValue placeholder="Изменить статус" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Ожидает обработки</SelectItem>
                          <SelectItem value="PROCESSING">В обработке</SelectItem>
                          <SelectItem value="COMPLETED">Выполнено</SelectItem>
                          <SelectItem value="CANCELLED">Отменено</SelectItem>
                        </SelectContent>
                      </Select>
                      {updatingStatus && (
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      )}
                    </dd>
                  </div>
                </dl>

                {selectedOrder.comment && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-600 mb-1">
                      Комментарий:
                    </h4>
                    <p className="bg-gray-50 p-3 rounded text-sm">
                      {selectedOrder.comment}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium text-lg mb-3">Товары в заявке</h3>
                <div className="space-y-3">
                  {selectedOrder.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-3 border rounded-md p-2"
                    >
                      {item.product.media[0] && (
                        <div className="h-12 w-12 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
                          <Image
                            src={item.product.media[0].url}
                            alt={item.product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Количество: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Закрыть</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

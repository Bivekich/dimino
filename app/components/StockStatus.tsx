import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface StockStatusProps {
  inStock: boolean;
  preOrderOnly: boolean;
  className?: string;
}

export const StockStatus = ({
  inStock,
  preOrderOnly,
  className,
}: StockStatusProps) => {
  if (preOrderOnly) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          'flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium',
          'bg-amber-500 hover:bg-amber-600 text-white border-none',
          className
        )}
      >
        <Clock className="h-4 w-4" />
        <span>Под заказ</span>
      </Badge>
    );
  }

  if (inStock) {
    return (
      <Badge
        variant="default"
        className={cn(
          'flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium',
          'bg-green-600 hover:bg-green-700 text-white border-none',
          className
        )}
      >
        <CheckCircle className="h-4 w-4" />
        <span>В наличии</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="destructive"
      className={cn(
        'flex items-center gap-1.5 py-1.5 px-3 text-sm font-medium',
        'bg-red-600 hover:bg-red-700 text-white border-none',
        className
      )}
    >
      <XCircle className="h-4 w-4" />
      <span>Нет в наличии</span>
    </Badge>
  );
};

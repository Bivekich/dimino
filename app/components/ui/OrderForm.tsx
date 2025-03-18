'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import type { CartItem } from '@/app/types';
import { toast } from 'sonner';
import ProductAvailabilityResult from './ProductAvailabilityResult';
import { useRouter } from 'next/navigation';

interface OrderFormProps {
  items: CartItem[];
  selectedCity: string;
  isModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onOrderComplete?: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  comment: string;
}

const OrderForm = ({
  items,
  selectedCity,
  isModal = false,
  isOpen = false,
  onClose = () => {},
  onOrderComplete = () => {},
}: OrderFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    comment: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Отправляем данные на сервер
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items,
          selectedCity,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Заявка успешно отправлена');
        setShowResults(true);
        if (isModal) {
          onClose();
        }
      } else {
        toast.error(result.message || 'Произошла ошибка при отправке запроса');
      }
    } catch (error) {
      console.error('Ошибка при отправке заявки:', error);
      toast.error('Произошла ошибка при отправке запроса');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultsClose = () => {
    setShowResults(false);
    if (isModal) {
      onOrderComplete();
    } else {
      router.push('/shop');
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-1 sm:space-y-2">
          <Label htmlFor="name" className="text-sm sm:text-base">
            Ваше имя*
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            className="h-10 sm:h-11"
          />
        </div>
        <div className="space-y-1 sm:space-y-2">
          <Label htmlFor="email" className="text-sm sm:text-base">
            Email*
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            className="h-10 sm:h-11"
          />
        </div>
        <div className="space-y-1 sm:space-y-2">
          <Label htmlFor="phone" className="text-sm sm:text-base">
            Телефон*
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            className="h-10 sm:h-11"
          />
        </div>
        <div className="space-y-1 sm:space-y-2">
          <Label htmlFor="comment" className="text-sm sm:text-base">
            Дополнительные вопросы
          </Label>
          <Textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            placeholder="Укажите, если у вас есть дополнительные вопросы по деликатесам"
            className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="space-y-3 sm:space-y-4">
        <div className="border rounded-lg p-3 sm:p-4">
          <h3 className="font-medium text-sm sm:text-base mb-2">
            Выбранные деликатесы:
          </h3>
          <div className="max-h-[120px] overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-xs sm:text-sm py-1"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
        <Button
          type="submit"
          className="w-full h-11 sm:h-12 text-sm sm:text-base rounded-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Отправка запроса...
            </>
          ) : (
            'Узнать о наличии'
          )}
        </Button>
      </div>
    </form>
  );

  if (isModal) {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[600px] w-[calc(100%-32px)] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-semibold">
                Узнать о наличии деликатесов
              </DialogTitle>
            </DialogHeader>
            {formContent}
          </DialogContent>
        </Dialog>

        <ProductAvailabilityResult
          isOpen={showResults}
          onClose={handleResultsClose}
          items={items}
          selectedCity={selectedCity}
        />
      </>
    );
  }

  return (
    <>
      {formContent}
      <ProductAvailabilityResult
        isOpen={showResults}
        onClose={handleResultsClose}
        items={items}
        selectedCity={selectedCity}
      />
    </>
  );
};

export default OrderForm;

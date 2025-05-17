'use client';

import { useState } from 'react';
import Image from 'next/image';
export interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  thumbnailUrl?: string;
}
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaGalleryProps {
  media: MediaFile[];
  className?: string;
}

export const MediaGallery = ({ media, className }: MediaGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  if (!media.length) return null;

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div className="relative aspect-square w-full overflow-hidden rounded-lg">
        {media[currentIndex].type === 'video' ? (
          <video
            src={media[currentIndex].url}
            className="h-full w-full object-cover"
            controls
            aria-label="Видео продукта"
          />
        ) : (
          <Image
            src={media[currentIndex].url}
            alt="Изображение продукта"
            fill
            className="object-cover"
            priority
          />
        )}

        {media.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white"
              onClick={handlePrevious}
              aria-label="Предыдущее изображение"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white"
              onClick={handleNext}
              aria-label="Следующее изображение"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                'relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md',
                currentIndex === index && 'ring-2 ring-primary'
              )}
              aria-label={`Переключиться на ${
                item.type === 'video' ? 'видео' : 'изображение'
              } ${index + 1}`}
            >
              {item.type === 'video' ? (
                <Image
                  src={item.thumbnailUrl || item.url}
                  alt="Миниатюра видео"
                  fill
                  className="object-cover"
                />
              ) : (
                <Image
                  src={item.url}
                  alt="Миниатюра изображения"
                  fill
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

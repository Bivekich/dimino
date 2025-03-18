'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Phone } from 'lucide-react';
import type { Location } from '@/app/types';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
}

const LocationModal = ({
  isOpen,
  onClose,
  locations,
  selectedLocation,
  onLocationSelect,
}: LocationModalProps) => {
  const [selectedCity, setSelectedCity] = useState<Location | null>(
    selectedLocation
  );

  const handleCitySelect = (location: Location) => {
    setSelectedCity(location);
    onLocationSelect(location);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-semibold">
            <MapPin className="h-6 w-6 text-amber-500" />
            Выберите город
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-3">
            {locations.map((location) => (
              <div key={location.id}>
                <Button
                  variant={
                    selectedCity?.id === location.id ? 'default' : 'outline'
                  }
                  className={`w-full h-auto p-4 justify-start gap-3 text-left rounded-xl border-zinc-200 dark:border-zinc-800
                    ${
                      selectedCity?.id === location.id
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  onClick={() => handleCitySelect(location)}
                >
                  <MapPin
                    className={`h-5 w-5 flex-shrink-0 ${
                      selectedCity?.id === location.id
                        ? 'text-amber-500'
                        : 'text-zinc-400'
                    }`}
                  />
                  <span className="font-medium text-lg">{location.city}</span>
                </Button>

                {selectedCity?.id === location.id && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {location.stores.map((store) => (
                      <div
                        key={store.id}
                        className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                      >
                        <h3 className="font-medium mb-2">{store.name}</h3>
                        <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {store.address}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {store.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {store.workingHours}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationModal;

export interface City {
  id: string;
  name: string;
  stores: Store[];
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  workingHours?: string;
}

export interface Media {
  id?: string;
  url: string;
  type: 'image' | 'video';
  thumbnailUrl?: string;
}

export interface Fish {
  id: string;
  name: string;
  description?: string;
  media?: Media[];
  inStock?: boolean;
  preOrderOnly?: boolean;
  availableInCities?: string[];
}

export interface RelatedDish {
  id: string;
  name: string;
  weight: number;
  media: Media[];
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  weight: number;
  media: Media[];
  fishId: string;
  inStock: boolean;
  preOrderOnly?: boolean;
  availableInStores?: string[];
  availability: {
    inStock: boolean;
    stores: string[]; // ID магазинов, где товар в наличии
  };
}

export interface CartItem {
  id: string;
  name: string;
  weight: number;
  quantity: number;
}

export interface OrderFormData {
  name: string;
  phone: string;
  comment?: string;
  selectedCity: string;
  items: CartItem[];
}

export interface ProductAvailability {
  productId: string;
  productName: string;
  stores: {
    storeId: string;
    storeName: string;
    storeAddress: string;
    storePhone: string;
    storeWorkingHours: string;
    inStock: boolean;
    preOrderOnly: boolean;
  }[];
}

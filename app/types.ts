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
}

export interface Media {
  url: string;
  type: 'image' | 'video';
}

export interface Fish {
  id: string;
  name: string;
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

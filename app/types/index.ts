import { Role } from '@prisma/client';

export interface UserDTO {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
}

export interface SellerDTO {
  id: string;
  userId: string;
  cityId: string;
  city: {
    id: string;
    name: string;
  };
  user: UserDTO;
}

export interface ProductDTO {
  id: string;
  name: string;
  description: string;
  weight: number;
  inStock: boolean;
  sellerId: string;
  cityId: string;
  fishId?: string;
  city: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    user: {
      name?: string | null;
    };
  };
  fish?: {
    id: string;
    name: string;
  } | null;
  media: {
    id: string;
    url: string;
    type: 'IMAGE' | 'VIDEO';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  workingHours: string;
}

export interface City {
  id: string;
  name: string;
  stores?: Store[];
}

export interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  thumbnailUrl?: string;
}

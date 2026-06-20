export type UserRole = 'merchant' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Hotel {
  id: string;
  nameZh: string;
  nameEn: string;
  address: string;
  starRating: number;
  openingDate: string; // ISO
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'offline';
  rejectionReason?: string;
  merchantId: string;
  createdAt: string;
  updatedAt: string;
  merchant?: {
    id: string;
    name: string;
    email: string;
  };
  rooms?: Room[];
  promotions?: Promotion[];
  images?: HotelImage[];
  facilities?: Facility[];
  nearbyAttractions?: NearbyAttraction[];
  tags?: { tag: Tag }[];
}

export enum AttractionType {
  attraction = 'attraction',
  transportation = 'transportation',
  shopping = 'shopping',
}

export interface NearbyAttraction {
  id: string;
  name: string;
  type: AttractionType;
  distance?: string;
}

export interface Facility {
  id: string;
  name: string;
  description?: string;
}

export interface Room {
  id: string;
  name: string;
  price: number;
  capacity: number;
  quantity: number;
  description?: string;
  hotelId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface Promotion {
  id: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed' | 'package';
  discountValue: number;
  startDate: string;
  endDate: string;
  hotelId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHotelDto {
  tagIds: any;
  facilities: any;
  nameZh: string;
  nameEn: string;
  address: string;
  starRating: number;
  openingDate: Date;
  description?: string;
  nearbyAttractions?: string;
  rooms?: Room[];
  promotions?: Promotion[];
}

export interface UpdateHotelDto extends Partial<CreateHotelDto> { }

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role?: UserRole;
}

export interface HotelImage {
  id: string;
  url: string;
  description?: string;
  isMain: boolean;
  hotelId: string;
  createdAt: string;
}


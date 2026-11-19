export type PropertyType = 'APARTMENT' | 'HOUSE' | 'LAND' | 'VILLA' | 'OFFICE';
export type ListingType = 'SALE' | 'RENT';

export interface PropertyImage {
  id: string;
  url: string;
  position: number;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: PropertyType;
  listingType: ListingType;
  status: string;
  price: number;
  area: number;
  bedrooms: number | null;
  bathrooms: number | null;
  address: string;
  ward: string | null;
  district: string;
  city: string;
  images: PropertyImage[];
  agent?: { id: string; fullName: string; phone: string | null; email: string };
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface PropertyFilters {
  q?: string;
  city?: string;
  type?: PropertyType | '';
  listingType?: ListingType | '';
  minPrice?: string;
  maxPrice?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'area_desc';
  page?: number;
}

export interface InquiryInput {
  name: string;
  phone: string;
  email?: string;
  message: string;
}

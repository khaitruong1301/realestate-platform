import type { ListingType, PropertyType } from '../api/types';

/** 5_200_000_000 -> "5,2 tỷ"; 9_000_000 -> "9 triệu"; thuê thêm "/tháng" */
export function formatPrice(price: number, listingType: ListingType = 'SALE'): string {
  const fmt = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
  let text: string;
  if (price >= 1e9) text = `${fmt(price / 1e9)} tỷ`;
  else if (price >= 1e6) text = `${fmt(price / 1e6)} triệu`;
  else text = `${fmt(price)} đ`;
  return listingType === 'RENT' ? `${text}/tháng` : text;
}

export function formatArea(area: number): string {
  return `${area.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} m²`;
}

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  APARTMENT: 'Căn hộ',
  HOUSE: 'Nhà phố',
  LAND: 'Đất nền',
  VILLA: 'Biệt thự',
  OFFICE: 'Văn phòng',
};

export const LISTING_TYPE_LABEL: Record<ListingType, string> = {
  SALE: 'Bán',
  RENT: 'Cho thuê',
};

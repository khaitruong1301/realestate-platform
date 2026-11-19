import { api } from './client';
import type { InquiryInput, Paginated, Property, PropertyFilters } from './types';

export function toQueryString(filters: PropertyFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '' && value !== null) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const propertyApi = {
  list: (filters: PropertyFilters = {}) => api<Paginated<Property>>(`/properties${toQueryString(filters)}`),
  get: (idOrSlug: string) => api<Property>(`/properties/${encodeURIComponent(idOrSlug)}`),
  sendInquiry: (propertyId: string, input: InquiryInput) =>
    api(`/properties/${propertyId}/inquiries`, { method: 'POST', body: JSON.stringify(input) }),
};

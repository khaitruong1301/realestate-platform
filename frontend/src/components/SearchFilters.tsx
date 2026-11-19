import { useState, type FormEvent } from 'react';
import type { PropertyFilters } from '../api/types';
import { LISTING_TYPE_LABEL, PROPERTY_TYPE_LABEL } from '../utils/format';

interface Props {
  initial: PropertyFilters;
  onSearch: (filters: PropertyFilters) => void;
}

export function SearchFilters({ initial, onSearch }: Props) {
  const [form, setForm] = useState<PropertyFilters>(initial);
  const set = (key: keyof PropertyFilters) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSearch({ ...form, page: 1 });
  };

  return (
    <form className="filters" onSubmit={submit} role="search">
      <input
        aria-label="Từ khoá"
        placeholder="Tìm theo tiêu đề, địa chỉ, quận..."
        value={form.q ?? ''}
        onChange={set('q')}
      />
      <select aria-label="Hình thức" value={form.listingType ?? ''} onChange={set('listingType')}>
        <option value="">Mua & thuê</option>
        {Object.entries(LISTING_TYPE_LABEL).map(([v, label]) => (
          <option key={v} value={v}>{label}</option>
        ))}
      </select>
      <select aria-label="Loại BĐS" value={form.type ?? ''} onChange={set('type')}>
        <option value="">Tất cả loại</option>
        {Object.entries(PROPERTY_TYPE_LABEL).map(([v, label]) => (
          <option key={v} value={v}>{label}</option>
        ))}
      </select>
      <input aria-label="Thành phố" placeholder="Thành phố" value={form.city ?? ''} onChange={set('city')} />
      <input aria-label="Giá từ" type="number" min={0} placeholder="Giá từ (VND)" value={form.minPrice ?? ''} onChange={set('minPrice')} />
      <input aria-label="Giá đến" type="number" min={0} placeholder="Giá đến (VND)" value={form.maxPrice ?? ''} onChange={set('maxPrice')} />
      <select aria-label="Sắp xếp" value={form.sort ?? 'newest'} onChange={set('sort')}>
        <option value="newest">Mới nhất</option>
        <option value="price_asc">Giá thấp → cao</option>
        <option value="price_desc">Giá cao → thấp</option>
        <option value="area_desc">Diện tích lớn nhất</option>
      </select>
      <button type="submit">Tìm kiếm</button>
    </form>
  );
}

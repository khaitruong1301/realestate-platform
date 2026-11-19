import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertyApi } from '../api/properties';
import type { Paginated, Property, PropertyFilters } from '../api/types';
import { PropertyCard } from '../components/PropertyCard';
import { SearchFilters } from '../components/SearchFilters';

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => Object.fromEntries(searchParams) as PropertyFilters, [searchParams]);
  const [data, setData] = useState<Paginated<Property> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    propertyApi
      .list(filters)
      .then((res) => !cancelled && (setData(res), setError('')))
      .catch(() => !cancelled && setError('Không tải được danh sách. Vui lòng thử lại.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filters]);

  const search = (f: PropertyFilters) =>
    setSearchParams(Object.fromEntries(Object.entries(f).filter(([, v]) => v !== '' && v !== undefined).map(([k, v]) => [k, String(v)])));

  const page = Number(filters.page ?? 1);

  return (
    <section>
      <h1 className="hero">Tìm ngôi nhà phù hợp với bạn</h1>
      <SearchFilters key={searchParams.toString()} initial={filters} onSearch={search} />

      {error && <p className="alert alert--error">{error}</p>}
      {loading && !data && <p>Đang tải...</p>}
      {data && (
        <>
          <p className="result-count">{data.pagination.total} bất động sản</p>
          {data.items.length === 0 ? (
            <p className="empty">Không có kết quả phù hợp. Thử bỏ bớt bộ lọc.</p>
          ) : (
            <div className="grid">{data.items.map((p) => <PropertyCard key={p.id} property={p} />)}</div>
          )}
          {data.pagination.totalPages > 1 && (
            <nav className="pagination" aria-label="Phân trang">
              <button disabled={page <= 1} onClick={() => search({ ...filters, page: page - 1 })}>‹ Trước</button>
              <span>Trang {page}/{data.pagination.totalPages}</span>
              <button disabled={page >= data.pagination.totalPages} onClick={() => search({ ...filters, page: page + 1 })}>Sau ›</button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import { propertyApi } from '../api/properties';
import type { Property } from '../api/types';
import { InquiryForm } from '../components/InquiryForm';
import { formatArea, formatPrice, LISTING_TYPE_LABEL, PROPERTY_TYPE_LABEL } from '../utils/format';

export function PropertyDetailPage() {
  const { slug = '' } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    propertyApi
      .get(slug)
      .then((p) => {
        setProperty(p);
        document.title = `${p.title} | NhàĐất`;
      })
      .catch((e) => setError(e instanceof ApiError && e.status === 404 ? 'Tin đăng không tồn tại hoặc đã bị gỡ.' : 'Có lỗi xảy ra.'));
  }, [slug]);

  if (error) return <div className="empty"><p>{error}</p><Link to="/">← Về trang chủ</Link></div>;
  if (!property) return <p>Đang tải...</p>;

  return (
    <article className="detail">
      <Link to="/">← Quay lại</Link>
      <h1>{property.title}</h1>
      <p className="detail__location">{property.address}, {property.district}, {property.city}</p>
      <div className="detail__gallery">
        {property.images.map((img) => <img key={img.id} src={img.url} alt={property.title} />)}
      </div>
      <div className="detail__layout">
        <div>
          <dl className="detail__facts">
            <div><dt>Giá</dt><dd className="card__price">{formatPrice(property.price, property.listingType)}</dd></div>
            <div><dt>Diện tích</dt><dd>{formatArea(property.area)}</dd></div>
            <div><dt>Loại</dt><dd>{PROPERTY_TYPE_LABEL[property.type]} · {LISTING_TYPE_LABEL[property.listingType]}</dd></div>
            {property.bedrooms != null && <div><dt>Phòng ngủ</dt><dd>{property.bedrooms}</dd></div>}
            {property.bathrooms != null && <div><dt>Phòng tắm</dt><dd>{property.bathrooms}</dd></div>}
          </dl>
          <h2>Mô tả</h2>
          <p className="detail__desc">{property.description}</p>
          {property.agent && (
            <p>Môi giới: <strong>{property.agent.fullName}</strong>{property.agent.phone && <> · <a href={`tel:${property.agent.phone}`}>{property.agent.phone}</a></>}</p>
          )}
        </div>
        <aside><InquiryForm propertyId={property.id} /></aside>
      </div>
    </article>
  );
}

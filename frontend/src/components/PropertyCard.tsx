import { Link } from 'react-router-dom';
import type { Property } from '../api/types';
import { formatArea, formatPrice, LISTING_TYPE_LABEL, PROPERTY_TYPE_LABEL } from '../utils/format';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="%23e2e8f0"/></svg>';

export function PropertyCard({ property }: { property: Property }) {
  const cover = property.images[0]?.url ?? PLACEHOLDER;
  return (
    <article className="card">
      <Link to={`/bat-dong-san/${property.slug}`} className="card__link">
        <div className="card__media">
          <img src={cover} alt={property.title} loading="lazy" />
          <span className={`badge badge--${property.listingType.toLowerCase()}`}>
            {LISTING_TYPE_LABEL[property.listingType]}
          </span>
        </div>
        <div className="card__body">
          <h3 className="card__title">{property.title}</h3>
          <p className="card__price">{formatPrice(property.price, property.listingType)}</p>
          <ul className="card__meta">
            <li>{PROPERTY_TYPE_LABEL[property.type]}</li>
            <li>{formatArea(property.area)}</li>
            {property.bedrooms ? <li>{property.bedrooms} PN</li> : null}
          </ul>
          <p className="card__location">
            {property.district}, {property.city}
          </p>
        </div>
      </Link>
    </article>
  );
}

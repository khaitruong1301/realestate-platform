import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { makeProperty } from '../test/fixtures';
import { PropertyCard } from './PropertyCard';

const renderCard = (p = makeProperty()) => render(<MemoryRouter><PropertyCard property={p} /></MemoryRouter>);

describe('PropertyCard', () => {
  it('hiển thị tiêu đề, giá, diện tích, vị trí và link chi tiết', () => {
    renderCard();
    expect(screen.getByRole('heading', { name: /Căn hộ 2PN/ })).toBeInTheDocument();
    expect(screen.getByText('5,2 tỷ')).toBeInTheDocument();
    expect(screen.getByText('75 m²')).toBeInTheDocument();
    expect(screen.getByText('Thủ Đức, Hồ Chí Minh')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/bat-dong-san/can-ho-2pn-view-song-quan-2-abc123');
  });

  it('tin cho thuê hiện badge "Cho thuê" và giá theo tháng', () => {
    renderCard(makeProperty({ listingType: 'RENT', price: 9_000_000 }));
    expect(screen.getByText('Cho thuê')).toBeInTheDocument();
    expect(screen.getByText('9 triệu/tháng')).toBeInTheDocument();
  });

  it('không có ảnh vẫn render ảnh placeholder', () => {
    renderCard(makeProperty({ images: [] }));
    expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('data:image/svg+xml'));
  });
});

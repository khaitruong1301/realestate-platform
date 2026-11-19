import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { makeProperty, mockFetchJson } from '../test/fixtures';
import { HomePage } from './HomePage';

const page = (items = [makeProperty()]) => ({
  items,
  pagination: { page: 1, limit: 12, total: items.length, totalPages: 1 },
});

describe('HomePage', () => {
  it('tải và hiển thị danh sách bất động sản', async () => {
    mockFetchJson(page([makeProperty(), makeProperty({ id: 'p2', title: 'Nhà phố Phú Nhuận', slug: 'nha-pho' })]));
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(await screen.findByText('2 bất động sản')).toBeInTheDocument();
    expect(screen.getByText('Nhà phố Phú Nhuận')).toBeInTheDocument();
  });

  it('hiện thông báo khi không có kết quả', async () => {
    mockFetchJson(page([]));
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(await screen.findByText(/Không có kết quả phù hợp/)).toBeInTheDocument();
  });

  it('hiện lỗi khi API lỗi', async () => {
    mockFetchJson({ error: { message: 'Lỗi' } }, 500);
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(await screen.findByText(/Không tải được danh sách/)).toBeInTheDocument();
  });

  it('gửi bộ lọc lên API khi bấm Tìm kiếm', async () => {
    const fetchSpy = mockFetchJson(page());
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    await screen.findByText('1 bất động sản');

    await userEvent.type(screen.getByLabelText('Từ khoá'), 'quan 7');
    await userEvent.selectOptions(screen.getByLabelText('Hình thức'), 'RENT');
    await userEvent.click(screen.getByRole('button', { name: 'Tìm kiếm' }));

    await vi.waitFor(() => {
      const lastUrl = String(fetchSpy.mock.calls.at(-1)?.[0]);
      expect(lastUrl).toContain('q=quan+7');
      expect(lastUrl).toContain('listingType=RENT');
    });
  });
});

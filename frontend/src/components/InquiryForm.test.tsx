import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockFetchJson } from '../test/fixtures';
import { InquiryForm } from './InquiryForm';

describe('InquiryForm', () => {
  it('gửi thành công thì hiện thông báo cảm ơn', async () => {
    const fetchSpy = mockFetchJson({ id: 'inq1' }, 201);
    render(<InquiryForm propertyId="p1" />);
    await userEvent.type(screen.getByLabelText('Họ tên'), 'Anh Nam');
    await userEvent.type(screen.getByLabelText('Số điện thoại'), '0912345678');
    await userEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }));

    expect(await screen.findByText(/Đã gửi!/)).toBeInTheDocument();
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe('/api/properties/p1/inquiries');
    expect(JSON.parse(String(init?.body))).toMatchObject({ name: 'Anh Nam', phone: '0912345678' });
  });

  it('hiện lỗi validate từ server', async () => {
    mockFetchJson({ error: { message: 'Dữ liệu không hợp lệ', details: { phone: ['Số điện thoại không hợp lệ'] } } }, 400);
    render(<InquiryForm propertyId="p1" />);
    await userEvent.type(screen.getByLabelText('Họ tên'), 'Anh Nam');
    await userEvent.type(screen.getByLabelText('Số điện thoại'), '123');
    await userEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }));
    expect(await screen.findByText('Số điện thoại không hợp lệ')).toBeInTheDocument();
  });
});

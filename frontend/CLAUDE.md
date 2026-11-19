# Frontend — React + Vite + TypeScript

## Cấu trúc

```
src/
  main.tsx, App.tsx      # router: / (HomePage), /bat-dong-san/:slug (chi tiết), * (404)
  api/
    client.ts            # api<T>(): fetch wrapper, gắn JWT từ localStorage, ném ApiError
    properties.ts        # propertyApi.list/get/sendInquiry, toQueryString
    types.ts             # type khớp với response backend — SỬA KHI BACKEND ĐỔI
  components/            # PropertyCard, SearchFilters, InquiryForm, Layout
  pages/                 # HomePage, PropertyDetailPage, NotFoundPage
  utils/format.ts        # formatPrice (tỷ/triệu), formatArea, nhãn tiếng Việt
  test/                  # setup.ts, fixtures.ts (makeProperty, mockFetchJson)
  index.css              # CSS thuần, biến màu ở :root
nginx.conf               # production: phục vụ SPA + proxy /api → backend:4000
```

## Quy ước

- Gọi API **chỉ** qua `src/api/*` — component không gọi `fetch` trực tiếp.
- Đường dẫn API luôn tương đối `/api/...` (dev: Vite proxy; prod: nginx proxy). Không hardcode domain.
- Bộ lọc tìm kiếm lưu trên URL (`useSearchParams`) để share link / back được.
- Text giao diện tiếng Việt có dấu. URL thân thiện tiếng Việt không dấu (`/bat-dong-san/:slug`).
- Mọi `<img>` có `alt`; input có `aria-label` hoặc `<label>` (vừa a11y vừa để test bằng `getByLabelText`).
- Xử lý đủ 3 trạng thái: đang tải, lỗi, rỗng.

## Test

- Test đặt cạnh file: `Foo.tsx` → `Foo.test.tsx`.
- Query theo vai trò người dùng thấy: `getByRole`, `getByLabelText`, `findByText` — tránh `querySelector` / class.
- Mock API bằng `mockFetchJson(body, status)` trong `src/test/fixtures.ts`; dữ liệu mẫu bằng `makeProperty({...})`.
- Component dùng `Link`/router phải bọc `<MemoryRouter>`.

```bash
npm run dev          # http://localhost:5173 (cần backend :4000)
npm test             # vitest run
npm run build        # tsc + vite build → dist/
```

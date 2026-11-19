# Backend — Express + Prisma + PostgreSQL

## Cấu trúc

```
src/
  server.ts            # entry: load .env, listen, graceful shutdown
  app.ts               # createApp(): middleware + mount router (test import trực tiếp hàm này)
  config/env.ts        # validate biến môi trường bằng Zod — thêm biến mới ở ĐÂY
  lib/                 # prisma client, HttpError, asyncHandler, slugify
  middleware/          # auth (requireAuth, requireRole, signToken), error-handler
  modules/<tên>/       # mỗi domain 1 thư mục
    <tên>.schema.ts    #   Zod schema cho body/query
    <tên>.service.ts   #   logic nghiệp vụ + Prisma (không đụng req/res)
    <tên>.routes.ts    #   Router: parse input → gọi service → trả JSON
prisma/
  schema.prisma        # model DB
  migrations/          # SQL migration — commit vào git, KHÔNG sửa file đã merge
  seed.ts              # dữ liệu mẫu
tests/
  unit/                # test hàm thuần, không cần DB
  integration/         # Supertest gọi API thật trên DB test (port 5443)
  helpers.ts           # resetDb(), createUser(role), validProperty
```

## API hiện có

| Method | Path | Quyền |
|---|---|---|
| GET | `/api/health` | public (kiểm tra cả DB) |
| POST | `/api/auth/register`, `/api/auth/login` | public |
| GET | `/api/auth/me` | đăng nhập |
| GET | `/api/properties?q&city&district&type&listingType&minPrice&maxPrice&minArea&maxArea&bedrooms&sort&page&limit` | public (chỉ PUBLISHED) |
| GET | `/api/properties/:idOrSlug` | public |
| POST | `/api/properties` | AGENT, ADMIN |
| PATCH / DELETE | `/api/properties/:id` | chủ tin hoặc ADMIN |
| POST | `/api/properties/:id/inquiries` | public |
| GET | `/api/inquiries` | AGENT (tin của mình), ADMIN (tất cả) |

## Quy ước

- Import nội bộ dùng đuôi `.js` (ESM + NodeNext): `import { prisma } from '../../lib/prisma.js'`.
- Route handler async luôn bọc `asyncHandler(...)`; ném lỗi bằng `HttpError.notFound()` / `.forbidden()`..., **không** tự `res.status(500)`.
- Validate bằng `schema.parse(req.body | req.query)` — ZodError tự thành 400 với `details` theo field.
- Trả `Decimal` ra ngoài phải qua serializer (`serializeProperty`) để thành `number`.
- Không trả `passwordHash` ra ngoài (`toPublicUser`).
- Danh sách luôn phân trang (`limit` tối đa 50). Cột hay lọc phải có `@@index`.
- Thêm biến môi trường: cập nhật `config/env.ts`, `.env.example`, `vitest.config.ts` (nếu test cần), `infra/docker-compose.prod.yml`, `.env.production.example`.

## Thêm module mới (ví dụ `favorites`)

1. Model trong `schema.prisma` → `npm run db:migrate -- --name add_favorites`
2. `src/modules/favorites/{favorite.schema,favorite.service,favorite.routes}.ts`
3. Mount trong `src/app.ts`
4. `tests/integration/favorites.test.ts`: case thành công, 400, 401, 403, 404. Thêm bảng mới vào `TRUNCATE` trong `tests/helpers.ts`.

## Lệnh

```bash
npm run dev              # tsx watch
npm test                 # cần: docker compose up -d db-test (lần đầu: DATABASE_URL=...5443... npx prisma migrate deploy)
npm run test:coverage
npm run db:migrate -- --name <ten>   # tạo migration từ thay đổi schema (DB dev)
npm run db:studio        # xem DB bằng giao diện
```

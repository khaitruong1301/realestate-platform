import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Integration test dùng chung 1 DB test -> chạy tuần tự từng file
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL:
        process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5443/realestate_test',
      JWT_SECRET: 'test-secret-at-least-16-chars',
    },
    coverage: { provider: 'v8', include: ['src/**'], exclude: ['src/server.ts'] },
  },
});

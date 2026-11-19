import 'dotenv/config';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

const server = createApp().listen(env.PORT, () => {
  console.log(`🚀 API chạy tại http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

// Tắt êm khi Docker gửi SIGTERM (deploy / restart)
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    console.log(`${signal} nhận được, đang tắt server...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  });
}

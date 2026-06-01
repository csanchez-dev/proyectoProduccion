import 'dotenv/config';
import app from './app';
import { connectDatabase } from './config/database';
import { startRabbitConsumer } from './consumers/rabbitConsumer';

import { logger } from './utils/logger';

const PORT = process.env.PORT || 4000;

async function bootstrap(): Promise<void> {
  await connectDatabase();
  await startRabbitConsumer();

  app.listen(PORT, () => {
    logger.info(`🚀 Notification service running on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});
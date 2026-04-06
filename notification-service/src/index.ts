import 'dotenv/config';
import app from './app';
import { connectDatabase } from './config/database';
import { startRabbitConsumer } from './consumers/rabbitConsumer';

const PORT = process.env.PORT || 4000;

async function bootstrap(): Promise<void> {
  await connectDatabase();
  await startRabbitConsumer();

  app.listen(PORT, () => {
    console.log(`Notification service running on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
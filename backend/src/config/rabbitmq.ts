import * as amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const EXCHANGE_NAME = 'events';
const EXCHANGE_TYPE = 'topic';

let connection: any = null;
let channel: any = null;

async function getChannel() {
  if (channel) return channel;

  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createConfirmChannel();

  await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
    durable: true,
  });

  return channel;
}

export async function publishEvent(
  routingKey: string,
  payload: Record<string, unknown>
): Promise<void> {
  const ch = await getChannel();

  ch.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(payload)),
    {
      persistent: true,
      contentType: 'application/json',
    }
  );

  await ch.waitForConfirms();
}
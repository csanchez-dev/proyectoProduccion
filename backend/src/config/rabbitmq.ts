import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://user:password@rabbitmq:5672';

export async function publishEvent(queue: string, message: any) {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));

    console.log(`[Julián - RabbitMQ] Mensaje enviado a la cola ${queue}`);

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error('[Julián - RabbitMQ Error]', error);
  }
}

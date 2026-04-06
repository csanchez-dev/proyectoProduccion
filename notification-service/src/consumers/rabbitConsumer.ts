import amqp from 'amqplib';
import { notificationService } from '../services/notificationService';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
const EXCHANGE_NAME = 'events';
const EXCHANGE_TYPE = 'topic';

export async function startRabbitConsumer(): Promise<void> {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
      durable: true,
    });

    const q = await channel.assertQueue('notification_service_queue', {
      durable: true,
    });

    await channel.bindQueue(q.queue, EXCHANGE_NAME, 'user.*');
    await channel.bindQueue(q.queue, EXCHANGE_NAME, 'meeting.*');

    console.log('RabbitMQ connected and queue bound');

    channel.consume(q.queue, async (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        const routingKey = msg.fields.routingKey;

        let title = 'Nuevo evento';
        let message = 'Se recibió un evento';

        if (routingKey === 'user.registered') {
          title = 'Nuevo usuario registrado';
          message = `Se registró un nuevo usuario: ${content.name || 'Sin nombre'}`;
        }

        if (routingKey === 'user.logged_in') {
          title = 'Usuario inició sesión';
          message = `El usuario ${content.email || 'desconocido'} inició sesión`;
        }

        if (routingKey === 'meeting.user_enrolled') {
          title = 'Usuario inscrito a reunión';
          message = `Un usuario se inscribió a la reunión ${content.meetingId || 'sin id'}`;
        }

        await notificationService.create({
          type: routingKey,
          title,
          message,
        });

        channel.ack(msg);
      } catch (error) {
        console.error('Error processing RabbitMQ message:', error);
        channel.nack(msg, false, false);
      }
    });
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
    process.exit(1);
  }
}
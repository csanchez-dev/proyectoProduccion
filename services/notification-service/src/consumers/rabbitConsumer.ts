import amqp from 'amqplib';
import { notificationService } from '../services/notificationService';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const EXCHANGE_NAME = 'events';
const EXCHANGE_TYPE = 'topic';

export async function startRabbitConsumer(): Promise<void> {
  try {
    console.log('RabbitMQ URL usada:', process.env.RABBITMQ_URL);

    const connection = await amqp.connect(RABBITMQ_URL);
    console.log('Conectado a RabbitMQ');

    const channel = await connection.createChannel();
    console.log('Canal creado');

    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
      durable: true,
    });
    console.log('Exchange verificado');

    const q = await channel.assertQueue('notification_service_queue', {
      durable: true,
    });
    console.log('Cola creada:', q.queue);

    await channel.bindQueue(q.queue, EXCHANGE_NAME, '#');
    console.log('Cola bindeada al exchange');

    console.log('RabbitMQ connected and queue bound');
    console.log('Notification service: consumer activo');

    channel.consume(
      q.queue,
      async (msg) => {
        if (!msg) return;

        try {
          console.log('Antes de parsear mensaje');
          console.log('Contenido crudo:', msg.content.toString());
          console.log('Routing key:', msg.fields.routingKey);

          const content = JSON.parse(msg.content.toString());
          const routingKey = msg.fields.routingKey;

          console.log('Notification service: mensaje recibido', {
            routingKey,
            content,
          });

          let title = 'Nuevo evento';
          let message = 'Se recibió un evento';

          if (routingKey === 'user.registered') {
            title = 'Nuevo usuario registrado';
            message = `Se registró un nuevo usuario: ${content.fullName || content.name || 'Sin nombre'}`;
          }

          if (routingKey === 'user.logged_in') {
            title = 'Usuario inició sesión';
            message = `El usuario ${content.email || 'desconocido'} inició sesión`;
          }

          if (routingKey === 'meeting.user_enrolled') {
            title = 'Usuario inscrito a reunión';
            message = `Un usuario se inscribió a la reunión ${content.meetingId || 'sin id'}`;
          }

          console.log('Antes de guardar notificación');

          await notificationService.create({
            type: routingKey,
            title,
            message,
          });

          console.log('Notification service: notificación creada');

          channel.ack(msg);
        } catch (error) {
          console.error('Error processing RabbitMQ message:', error);
          channel.nack(msg, false, false);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
    process.exit(1);
  }
}
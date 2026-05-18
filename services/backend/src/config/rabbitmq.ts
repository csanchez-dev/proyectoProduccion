import * as amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
const EXCHANGE_NAME = 'events';
const EXCHANGE_TYPE = 'topic';

let connection: any = null;
let channel: any = null;

async function getChannel() {
  if (channel) return channel;

  try {
    console.log('[RabbitMQ] Intentando conectar a:', RABBITMQ_URL);
    connection = await amqp.connect(RABBITMQ_URL);
    
    // Si la conexión se cierra, limpiar las variables para reintento
    connection.on('error', (err: any) => {
      console.error('[RabbitMQ Connection Error Event]', err);
      connection = null;
      channel = null;
    });
    
    connection.on('close', () => {
      console.warn('[RabbitMQ Connection Closed]');
      connection = null;
      channel = null;
    });

    channel = await connection.createConfirmChannel();

    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
      durable: true,
    });

    console.log('[RabbitMQ] Conexión establecida con éxito');
    return channel;
  } catch (error) {
    console.warn('[RabbitMQ] No se pudo conectar al broker. Los eventos no se publicarán.', (error as any).message);
    return null;
  }
}

/**
 * Función mejorada para publicar eventos sin tumbar el servidor si falla.
 */
export async function publishEvent(
  routingKey: string,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    const ch = await getChannel();
    if (!ch) {
      console.warn(`[RabbitMQ] Saltando publicación de evento ${routingKey} por falta de conexión.`);
      return;
    }

    ch.publish(
      EXCHANGE_NAME,
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      {
        persistent: true,
        contentType: 'application/json',
      }
    );

    // No bloqueamos el hilo principal esperando la confirmación si queremos máxima resiliencia,
    // pero waitForConfirms es bueno para integridad. Lo envolvemos para que no lance error fatal.
    await ch.waitForConfirms().catch((err: any) => console.error('[RabbitMQ Confirm Error]', err));
    
    console.log(`[RabbitMQ] Evento enviado con éxito a: ${routingKey}`);
  } catch (error) {
    console.error(`[RabbitMQ] Error inesperado al publicar evento ${routingKey}:`, error);
  }
}

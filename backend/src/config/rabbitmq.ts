import * as amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const EXCHANGE_NAME = 'events';
const EXCHANGE_TYPE = 'topic';

let connection: any = null;
let channel: any = null;

async function getChannel() {
  if (channel) return channel;

  console.log('[Backend - RabbitMQ] Intentando conectar a:', RABBITMQ_URL);

  let retries = 5;
  let lastError: any;

  while (retries > 0) {
    try {
      connection = await amqp.connect(RABBITMQ_URL);
      channel = await connection.createConfirmChannel();

      await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
        durable: true,
      });

      console.log('[Backend - RabbitMQ] ✅ Conexión establecida con éxito');
      return channel;
    } catch (error) {
      lastError = error;
      retries--;
      console.error(`[Backend - RabbitMQ] Error de conexión (${retries} reintentos restantes):`, error);
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de reintentar
      }
    }
  }

  console.error('[Backend - RabbitMQ] ❌ No se pudo conectar después de múltiples intentos');
  throw lastError;
}

/**
 * Función mejorada por Julián y el equipo para publicar eventos.
 */
export async function publishEvent(
  routingKey: string,
  payload: Record<string, unknown>
): Promise<void> {
  console.log(`[Backend - RabbitMQ] 📨 Intentando publicar evento a: ${routingKey}`);

  try {
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
    console.log(`[Backend - RabbitMQ] ✅ Evento publicado exitosamente a: ${routingKey}`);
  } catch (error) {
    console.error(`[Backend - RabbitMQ] ❌ Error al publicar evento:`, error);
    throw error;
  }
}

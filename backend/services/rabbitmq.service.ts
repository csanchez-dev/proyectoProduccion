import amqp from 'amqplib';

export const publicarInscripcion = async (datos: any) => {
  try {
    // 1. Conectar al servidor (si usas Docker, 'localhost' cambia por 'rabbitmq')
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    const channel = await connection.createChannel();

    const cola = 'inscripciones_queue';

    // 2. Asegurarse de que la cola existe
    await channel.assertQueue(cola, { durable: true });

    // 3. Enviar el mensaje
    channel.sendToQueue(cola, Buffer.from(JSON.stringify(datos)), {
      persistent: true // Para que el mensaje no se pierda si se apaga el servidor
    });

    console.log(" [x] Enviado a RabbitMQ:", datos);

    // 4. Cerrar la conexión (en servicios pequeños se cierra, en grandes se mantiene abierta)
    setTimeout(() => {
      connection.close();
    }, 500);

  } catch (error) {
    console.error("Error en RabbitMQ Service:", error);
  }
};
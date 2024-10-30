// src/services/kafkaProducer.service.ts
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'auth-service',
  brokers: ['kafka:9092'], // Adjust if your Kafka broker address is different
});

const producer = kafka.producer();

export const produceMessage = async (topic: string, message: any) => {
  await producer.connect();
  await producer.send({
    topic,
    messages: [
      {
        value: JSON.stringify(message),
      },
    ],
  });
  await producer.disconnect();
};

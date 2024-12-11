// src/services/kafkaConsumer.service.ts
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'auth-service',
  brokers: ['kafka:9092'], 
});

const consumer = kafka.consumer({ groupId: 'auth-group' });

export const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'auth-topic', fromBeginning: true }); // Adjust topic name as needed

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const msgValue = message.value?.toString();
      console.log(`Received message: ${msgValue}`);
      //   will do something if required 
    },
  });
};

import { env } from './env.js';

export const mqttOptions = {
  clientId: env.mqtt.clientId,
  clean: true,
  reconnectPeriod: env.mqtt.reconnectPeriodMs,
  connectTimeout: env.mqtt.connectTimeoutMs,
  ...(env.mqtt.username && {
    username: env.mqtt.username,
    password: env.mqtt.password,
  }),
};

export const mqttTopics = env.mqtt.topics;

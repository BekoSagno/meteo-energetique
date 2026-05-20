import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return value;
}

function optionalInt(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Variable ${name} doit être un entier`);
  }
  return parsed;
}

function optionalOrigins(name) {
  const raw = process.env[name];
  if (!raw || raw.trim() === '') return null;
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: optionalInt('PORT', 3000),
  databaseUrl: required('DATABASE_URL'),
  corsOrigins: optionalOrigins('CORS_ORIGIN'),
  mqtt: {
    brokerUrl: process.env.MQTT_BROKER_URL ?? 'mqtt://localhost:1883',
    clientId: process.env.MQTT_CLIENT_ID ?? 'meteo-energetique-api',
    username: process.env.MQTT_USERNAME || undefined,
    password: process.env.MQTT_PASSWORD || undefined,
    reconnectPeriodMs: optionalInt('MQTT_RECONNECT_PERIOD_MS', 5000),
    connectTimeoutMs: optionalInt('MQTT_CONNECT_TIMEOUT_MS', 30000),
    topics: {
      kitStatus: process.env.MQTT_TOPIC_KIT_STATUS ?? 'kits/+/status',
      kitPing: process.env.MQTT_TOPIC_KIT_PING ?? 'kits/+/ping',
    },
  },
  isProduction: process.env.NODE_ENV === 'production',
  jwtSecret:
    process.env.JWT_SECRET ??
    (process.env.NODE_ENV === 'production'
      ? required('JWT_SECRET')
      : 'meteo-energetique-dev-secret-change-in-production'),
};

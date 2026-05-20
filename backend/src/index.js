import { env } from './config/env.js';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './lib/prisma.js';
import { connectMqtt, disconnectMqtt } from './mqtt/client.js';

const app = createApp();
let server = null;

async function start() {
  await connectDatabase();
  console.info('[DB] PostgreSQL connecté');

  // MODIFICATION ICI : On ne connecte MQTT que si on n'est pas sur Render
  if (!process.env.RENDER) {
    try {
      await connectMqtt();
    } catch (error) {
      console.warn(
        '[MQTT] Broker indisponible au démarrage — l’API HTTP reste active :',
        error.message
      );
    }
  } else {
    console.info('[MQTT] Désactivé en production sur Render pour libérer les ressources.');
  }

  server = app.listen(env.port, () => {
    console.info(`[HTTP] API écoute sur http://localhost:${env.port}`);
    console.info(`[HTTP] Santé : http://localhost:${env.port}/api/health`);
  });
}

async function shutdown(signal) {
  console.info(`\n[${signal}] Arrêt en cours…`);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  if (!process.env.RENDER) {
    await disconnectMqtt();
  }
  await disconnectDatabase();

  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start().catch((error) => {
  console.error('Démarrage impossible :', error);
  process.exit(1);
});

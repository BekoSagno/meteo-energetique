import mqtt from 'mqtt';
import { env } from '../config/env.js';
import { mqttOptions, mqttTopics } from '../config/mqtt.js';
import { dispatchMqttMessage } from './handlers/index.js';

let client = null;

export function getMqttClient() {
  return client;
}

export function isMqttConnected() {
  return client?.connected ?? false;
}

export function connectMqtt() {
  return new Promise((resolve, reject) => {
    client = mqtt.connect(env.mqtt.brokerUrl, mqttOptions);

    client.on('connect', () => {
      console.info('[MQTT] Connecté à', env.mqtt.brokerUrl);

      const subscriptions = [mqttTopics.kitStatus, mqttTopics.kitPing];
      client.subscribe(subscriptions, (err) => {
        if (err) {
          reject(err);
          return;
        }
        console.info('[MQTT] Abonnements :', subscriptions.join(', '));
        resolve(client);
      });
    });

    client.on('message', async (topic, payload) => {
      try {
        await dispatchMqttMessage(topic, payload);
      } catch (error) {
        console.error(`[MQTT] Erreur handler ${topic}:`, error);
      }
    });

    client.on('error', (error) => {
      console.error('[MQTT] Erreur :', error.message);
    });

    client.on('reconnect', () => {
      console.warn('[MQTT] Reconnexion en cours…');
    });

    client.on('offline', () => {
      console.warn('[MQTT] Client hors ligne');
    });

    client.on('close', () => {
      console.warn('[MQTT] Connexion fermée');
    });
  });
}

export function disconnectMqtt() {
  return new Promise((resolve) => {
    if (!client) {
      resolve();
      return;
    }
    client.end(false, {}, () => {
      client = null;
      resolve();
    });
  });
}

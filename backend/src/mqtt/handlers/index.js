import { handleKitMessage } from './kitStatus.js';

export async function dispatchMqttMessage(topic, payload) {
  if (topic.startsWith('kits/')) {
    await handleKitMessage(topic, payload);
    return;
  }

  console.debug(`[MQTT] Topic non géré : ${topic}`);
}

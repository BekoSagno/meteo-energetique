/**
 * Convention de nommage MQTT Mosquitto — kits IoT.
 *
 * Publication côté kit :
 *   kits/{kitId}/status  → { "state": "ONLINE"|"OFFLINE", "ts": "ISO8601" }
 *   kits/{kitId}/ping    → { "ts": "ISO8601" }
 */

export function kitIdFromTopic(topic) {
  const parts = topic.split('/');
  if (parts.length >= 2 && parts[0] === 'kits') {
    return parts[1];
  }
  return null;
}

export function kitStatusTopic(kitId) {
  return `kits/${kitId}/status`;
}

export function kitPingTopic(kitId) {
  return `kits/${kitId}/ping`;
}

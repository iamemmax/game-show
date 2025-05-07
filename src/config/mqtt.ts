// MQTT configuration from environment variables
export const mqttConfig = {
  broker: process.env.NEXT_PUBLIC_MQTT_BROKER || '206.189.196.71',
  port: process.env.NEXT_PUBLIC_MQTT_PORT || '1883',
  username: process.env.NEXT_PUBLIC_MQTT_USERNAME || 'game_show',
  password: process.env.NEXT_PUBLIC_MQTT_PASSWORD || '#1il0O_wmn',
  // Construct the broker URL with port and protocol
  getBrokerUrl: () => {
    const broker = process.env.NEXT_PUBLIC_MQTT_BROKER || '206.189.196.71';
    const port = process.env.NEXT_PUBLIC_MQTT_PORT || '1883';
    // For browser environments, WebSocket is typically required
    return `ws://${broker}:${port}`;
  }
};




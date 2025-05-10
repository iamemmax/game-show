// MQTT configuration from environment variables
export const mqttConfig = {
  broker: process.env.NEXT_PUBLIC_MQTT_BROKER || '206.189.196.71',
  port: process.env.NEXT_PUBLIC_MQTT_PORT || '8083', // WebSocket port
  username: process.env.NEXT_PUBLIC_MQTT_USERNAME || 'game_show',
  password: process.env.NEXT_PUBLIC_MQTT_PASSWORD || '#1il0O_wmn',
};



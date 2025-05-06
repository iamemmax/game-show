import { useEffect, useState, useCallback } from 'react';
import mqtt from 'mqtt';

interface MqttState {
  client: mqtt.MqttClient | null;
  connectionStatus: 'Connected' | 'Reconnecting' | 'Disconnected';
  messages: Record<string, string>;
}

interface MqttOptions {
  clientId?: string;
  username: string;
  password: string;
  clean?: boolean;
}

export const useMqtt = (brokerUrl: string, options: MqttOptions) => {
  const [state, setState] = useState<MqttState>({
    client: null,
    connectionStatus: 'Disconnected',
    messages: {},
  });

  // Connect to MQTT broker
  useEffect(() => {
    const clientId = options.clientId || `salary4life_${Math.random().toString(16).substring(2, 10)}`;
    
    // Fix the broker URL format - ensure it has the correct protocol
    let fullBrokerUrl = brokerUrl;
    if (!brokerUrl.startsWith('mqtt://') && !brokerUrl.startsWith('ws://') && !brokerUrl.startsWith('wss://')) {
      fullBrokerUrl = `mqtt://${brokerUrl}`;
    }
    
    console.log('Connecting to MQTT broker:', fullBrokerUrl);
    
    const client = mqtt.connect(fullBrokerUrl, {
      ...options,
      clientId,
      reconnectPeriod: 5000, // Reconnect every 5 seconds
      connectTimeout: 30000, // 30 seconds timeout
    });

    client.on('connect', () => {
      console.log('MQTT Connected successfully');
      setState(prev => ({ ...prev, client, connectionStatus: 'Connected' }));
    });

    client.on('reconnect', () => {
      console.log('MQTT Reconnecting');
      setState(prev => ({ ...prev, connectionStatus: 'Reconnecting' }));
    });

    client.on('error', (err) => {
      console.error('MQTT Connection error:', err);
      client.end();
    });

    client.on('message', (topic, message) => {
      const payload = message.toString();
      console.log(`Received message on ${topic}: ${payload}`);
      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [topic]: payload,
        },
      }));
    });

    client.on('close', () => {
      console.log('MQTT Disconnected');
      setState(prev => ({ ...prev, connectionStatus: 'Disconnected' }));
    });

    return () => {
      if (client) {
        client.end();
      }
    };
  }, [brokerUrl, options]);

  // Subscribe to topic
  const subscribe = useCallback((topic: string) => {
    if (state.client && state.connectionStatus === 'Connected') {
      state.client.subscribe(topic, (err) => {
        if (err) {
          console.error('Subscribe error:', err);
        } else {
          console.log(`Subscribed to ${topic}`);
        }
      });
    }
  }, [state.client, state.connectionStatus]);

  // Publish message
  const publish = useCallback((topic: string, message: string) => {
    if (state.client && state.connectionStatus === 'Connected') {
      state.client.publish(topic, message, (err) => {
        if (err) {
          console.error('Publish error:', err);
        }
      });
    }
  }, [state.client, state.connectionStatus]);

  return {
    ...state,
    subscribe,
    publish,
  };
};





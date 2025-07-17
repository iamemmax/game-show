'use client';
import { createContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import mqtt, { MqttClient, MqttProtocol } from 'mqtt';

export interface MQTTMessage {
  topic: string;
  event?: string;
  payload: any;
  timestamp: number;
}

export interface MQTTContextProps {
  isConnected: boolean;
  client: MqttClient | null;
  topicListeners: { [topic: string]: Array<(message: MQTTMessage) => void> };
  globalListeners: Array<(message: MQTTMessage) => void>;
  subscribedTopics: string[];
  subscribeToTopic: (topic: string, callback: (message: MQTTMessage) => void) => void;
  unsubscribeFromTopic: (topic: string, callback: (message: MQTTMessage) => void) => void;
  addGlobalListener: (callback: (message: MQTTMessage) => void) => void;
  removeGlobalListener: (callback: (message: MQTTMessage) => void) => void;
  // Legacy support
  addMessageListener: (callback: (message: MQTTMessage) => void) => void;
  removeMessageListener: (callback: (message: MQTTMessage) => void) => void;
}

export const MQTTContext = createContext<MQTTContextProps | null>(null);

interface MQTTProviderProps {
  children: ReactNode;
  enableGlobalWildcard?: boolean;
}

export function MQTTProvider({ children, enableGlobalWildcard = true }: MQTTProviderProps) {
  const broker = process.env.NEXT_PUBLIC_MQTT_BROKER;
  const port = process.env.NEXT_PUBLIC_MQTT_PORT;
  const username = process.env.NEXT_PUBLIC_MQTT_USERNAME;
  const password = process.env.NEXT_PUBLIC_MQTT_PASSWORD;
  const protocol = process.env.NEXT_PUBLIC_MQTT_PROTOCOL as MqttProtocol;
  const connectUrl = `ws://${broker}:${port}`;

  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<MqttClient | null>(null);
  const connectionAttemptsRef = useRef(0);
  const maxConnectionAttempts = 3;

  // State for topic management
  const topicListenersRef = useRef<{ [topic: string]: Array<(message: MQTTMessage) => void> }>({});
  const globalListenersRef = useRef<Array<(message: MQTTMessage) => void>>([]);
  const subscribedTopicsRef = useRef<string[]>([]);
  const wildcardSubscribedRef = useRef<boolean>(false);

  useEffect(() => {
    let mqttClient: MqttClient | null = null;

    const connect = () => {
      console.log('MQTT connect URL:', connectUrl);

      mqttClient = mqtt.connect(connectUrl, {
        clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
        clean: true,
        connectTimeout: 300000,
        reconnectPeriod: 5000,
        username,
        password,
        keepalive: 30,
        protocol: protocol,
        rejectUnauthorized: false,
      });

      mqttClient.on('connect', () => {
        console.log('Connected to MQTT broker');
        setIsConnected(true);
        connectionAttemptsRef.current = 0;

        // Subscribe to wildcard if enabled and there are global listeners
        if (enableGlobalWildcard && globalListenersRef.current.length > 0 && !wildcardSubscribedRef.current) {
          subscribeToWildcard();
        }
      });

      mqttClient.on('error', (err) => {
        console.error('MQTT Connection error:', err);
        setIsConnected(false);
        connectionAttemptsRef.current++;
        if (connectionAttemptsRef.current >= maxConnectionAttempts) {
          console.error('Max connection attempts reached');
          mqttClient?.end();
        }
      });

      mqttClient.on('disconnect', () => {
        console.log('Disconnected from MQTT broker');
        setIsConnected(false);
        wildcardSubscribedRef.current = false;
      });

      mqttClient.on('offline', () => {
        console.log('MQTT client is offline');
        setIsConnected(false);
      });

      mqttClient.on('reconnect', () => {
        console.log('Reconnecting to MQTT broker...');
      });

      // Handle incoming messages
      mqttClient.on('message', (topic, payload) => {
        try {
          const message: MQTTMessage = {
            topic,
            event: payload.toString().includes('event') ? JSON.parse(payload.toString()).event : undefined,
            payload: payload.toString().includes('payload') ? JSON.parse(payload.toString()).payload : payload.toString(),
            // payload: JSON.parse(payload.toString()),
            timestamp: Date.now()
          };

          // Call topic-specific listeners
          const topicCallbacks = topicListenersRef.current[topic] || [];
          topicCallbacks.forEach(callback => callback(message));

          // Call global listeners (now receives from all topics if wildcard is enabled)
          globalListenersRef.current.forEach(callback => callback(message));
        } catch (err) {
          console.error('Error parsing message:', err);
          const fallbackMessage: MQTTMessage = {
            topic,
            payload: { error: 'Failed to parse message', raw: payload.toString() },
            timestamp: Date.now()
          };
          globalListenersRef.current.forEach(callback => callback(fallbackMessage));
        }
      });

      clientRef.current = mqttClient;
    };

    // Function to subscribe to wildcard
    const subscribeToWildcard = () => {
      if (clientRef.current && !wildcardSubscribedRef.current) {
        clientRef.current.subscribe('#', { qos: 1 }, (err) => {
          if (err) {
            console.error('Wildcard subscription error:', err);
          } else {
            console.log('Subscribed to wildcard (#) - global listeners will receive all messages');
            wildcardSubscribedRef.current = true;
          }
        });
      }
    };

    // Function to unsubscribe from wildcard
    const unsubscribeFromWildcard = () => {
      if (clientRef.current && wildcardSubscribedRef.current) {
        clientRef.current.unsubscribe('#', (err) => {
          if (err) {
            console.error('Wildcard unsubscription error:', err);
          } else {
            console.log('Unsubscribed from wildcard (#)');
            wildcardSubscribedRef.current = false;
          }
        });
      }
    };

    connect();

    return () => {
      if (clientRef.current) {
        console.log('Cleaning up MQTT connection');
        clientRef.current.end(true);
        clientRef.current = null;
      }
    };
  }, [connectUrl, username, password, enableGlobalWildcard]);

  const subscribeToTopic = useCallback((topic: string, callback: (message: MQTTMessage) => void) => {
    if (!topicListenersRef.current[topic]) {
      topicListenersRef.current[topic] = [];
    }
    topicListenersRef.current[topic].push(callback);



    if (!subscribedTopicsRef.current.includes(topic)) {
      clientRef.current?.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          console.error(`Subscription error for topic ${topic}:`, err);
        } else {
          console.log(`Subscribed to ${topic}`);
          subscribedTopicsRef.current.push(topic);
        }
      });
    }
  }, []);

  const unsubscribeFromTopic = useCallback((topic: string, callback: (message: MQTTMessage) => void) => {
    if (topicListenersRef.current[topic]) {
      const index = topicListenersRef.current[topic].indexOf(callback);
      if (index > -1) {
        topicListenersRef.current[topic].splice(index, 1);
      }

      // If no more listeners for this topic, unsubscribe
      if (topicListenersRef.current[topic].length === 0) {
        clientRef.current?.unsubscribe(topic);
        subscribedTopicsRef.current = subscribedTopicsRef.current.filter(t => t !== topic);
        delete topicListenersRef.current[topic];
      }
    }
  }, []);

  const addGlobalListener = useCallback((callback: (message: MQTTMessage) => void) => {
    globalListenersRef.current.push(callback);

    // Subscribe to wildcard if enabled and connected
    if (enableGlobalWildcard && isConnected && !wildcardSubscribedRef.current) {
      clientRef.current?.subscribe('#', { qos: 1 }, (err) => {
        if (err) {
          console.error('Wildcard subscription error:', err);
        } else {
          console.log('Subscribed to wildcard (#) - global listeners will receive all messages');
          wildcardSubscribedRef.current = true;
        }
      });
    }
  }, [enableGlobalWildcard, isConnected]);

  const removeGlobalListener = useCallback((callback: (message: MQTTMessage) => void) => {
    const index = globalListenersRef.current.indexOf(callback);
    if (index > -1) {
      globalListenersRef.current.splice(index, 1);
    }

    // Unsubscribe from wildcard if no more global listeners
    if (enableGlobalWildcard && globalListenersRef.current.length === 0 && wildcardSubscribedRef.current) {
      clientRef.current?.unsubscribe('#', (err) => {
        if (err) {
          console.error('Wildcard unsubscription error:', err);
        } else {
          console.log('Unsubscribed from wildcard (#)');
          wildcardSubscribedRef.current = false;
        }
      });
    }
  }, [enableGlobalWildcard]);

  // Legacy support methods
  const addMessageListener = useCallback((callback: (message: MQTTMessage) => void) => {
    addGlobalListener(callback);
  }, [addGlobalListener]);

  const removeMessageListener = useCallback((callback: (message: MQTTMessage) => void) => {
    removeGlobalListener(callback);
  }, [removeGlobalListener]);

  const contextValue: MQTTContextProps = {
    isConnected,
    client: clientRef.current,
    topicListeners: topicListenersRef.current,
    globalListeners: globalListenersRef.current,
    subscribedTopics: subscribedTopicsRef.current,
    subscribeToTopic,
    unsubscribeFromTopic,
    addGlobalListener,
    removeGlobalListener,
    // Legacy support
    addMessageListener,
    removeMessageListener,
  };

  return (
    <MQTTContext.Provider value={contextValue}>
      {children}
    </MQTTContext.Provider>
  );
}
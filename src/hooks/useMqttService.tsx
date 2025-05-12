'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import mqtt, { MqttClient } from 'mqtt';

// Define types for our context
interface MQTTContextProps {
  isConnected: boolean;
  sendMessage: (message: string, event?: string) => Promise<boolean>;
  onMessage: (callback: ((message: any) => void) | null) => void;
  userId: string;
}

// Create the context with a default value
const MQTTContext = createContext<MQTTContextProps | null>(null);

// Helper function to generate UUID with fallback
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Create a provider component
interface MQTTProviderProps {
  children: ReactNode;
}

export function MQTTProvider({ children }: MQTTProviderProps) {
  const broker = process.env.NEXT_PUBLIC_MQTT_BROKER;
  const port = process.env.NEXT_PUBLIC_MQTT_PORT;
  const username = process.env.NEXT_PUBLIC_MQTT_USERNAME;
  const password = process.env.NEXT_PUBLIC_MQTT_PASSWORD;
  const connectUrl = `wss://${broker}:${port}/mqtt`;
  
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<MqttClient | null>(null);
  const userIdRef = useRef<string>('');
  const topicsRef = useRef({
    publisher: '',
    subscriber: ''
  });
  
  // Keep track of connection attempts
  const connectionAttemptsRef = useRef(0);
  const maxConnectionAttempts = 3;

  useEffect(() => {
    let mqttClient: MqttClient | null = null;
    
    const connect = () => {
      console.log('MQTT connect URL:', connectUrl);
      
      const storedUserId = typeof window !== 'undefined'
        ? sessionStorage.getItem('SALARY_4_LIFE_CHAT_UUID')
        : null;
      const storedComputerId = typeof window !== 'undefined'
        ? localStorage.getItem('SALARY_4_LIFE_COMPUTER_UUID')
        : null;
      
      const newUserId = storedUserId || generateUUID();
      const newComputerId = storedComputerId || generateUUID();
      
      topicsRef.current = {
        publisher: `test/topic`,
        subscriber: `test/topic`
      };
      
      userIdRef.current = newUserId;
      
      if (typeof window !== 'undefined' && !storedUserId) {
        sessionStorage.setItem('SALARY_4_LIFE_CHAT_UUID', newUserId);
      }
      if (typeof window !== 'undefined' && !storedComputerId) {
        localStorage.setItem('SALARY_4_LIFE_COMPUTER_UUID', newComputerId);
      }

      mqttClient = mqtt.connect(connectUrl, {
        clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
        clean: true,
        connectTimeout: 300000,
        reconnectPeriod: 5000,
        username,
        password,
        keepalive: 60,
        protocol: 'wss',
        rejectUnauthorized: false
      });

      mqttClient.on('connect', () => {
        console.log('Connected to MQTT broker');
        setIsConnected(true);
        connectionAttemptsRef.current = 0;
        
        // Subscribe after a short delay to ensure connection is stable
        setTimeout(() => {
          mqttClient?.subscribe(topicsRef.current.subscriber, { qos: 1 }, (err) => {
            if (err) {
              console.error('Subscription error:', err);
            } else {
              console.log(`Subscribed to ${topicsRef.current.subscriber}`);
            }
          });
        }, 1000);
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
      });

      mqttClient.on('offline', () => {
        console.log('MQTT client is offline');
        setIsConnected(false);
      });

      mqttClient.on('reconnect', () => {
        console.log('Reconnecting to MQTT broker...');
      });

      clientRef.current = mqttClient;
    };

    connect();

    return () => {
      if (clientRef.current) {
        console.log('Cleaning up MQTT connection');
        clientRef.current.end(true);
        clientRef.current = null;
      }
    };
  }, [connectUrl, username, password]);

  const sendMessage = useCallback((message: string, event?: string) => {
    if (!clientRef.current || !isConnected) {
      console.error('MQTT client is not connected');
      return Promise.reject(new Error('MQTT client not connected'));
    }

    return new Promise<boolean>((resolve, reject) => {
      const payload = {
        user_id: userIdRef.current,
        message,
        event: event || undefined,
        timestamp: new Date().toISOString()
      };

      clientRef.current!.publish(
        topicsRef.current.publisher,
        JSON.stringify(payload),
        { qos: 1 },
        (err) => {
          if (err) {
            console.error('Publish error:', err);
            reject(err);
          } else {
            console.log('Message sent successfully');
            resolve(true);
          }
        }
      );
    });
  }, [isConnected]);

  const onMessage = useCallback((callback: ((message: any) => void) | null) => {
    if (!clientRef.current) {
      console.error('MQTT client not initialized');
      return;
    }
    
    // Remove any existing message handlers to prevent duplicates
    clientRef.current.removeAllListeners('message');
    
    // Only add a new listener if callback is not null
    if (callback !== null) {
      clientRef.current.on('message', (topic, payload) => {
        console.log(`Received message on topic: ${topic}`);
        try {
          console.log(`message: ${payload.toString()}`);
          const message = JSON.parse(payload.toString());
          callback(message);
        } catch (err) {
          console.error('Error parsing message:', err);
          callback({ error: 'Failed to parse message', raw: payload.toString() });
        }
      });
    }
  }, []);

  // Create the value object that will be provided to consumers
  const contextValue: MQTTContextProps = {
    isConnected,
    sendMessage,
    onMessage,
    userId: userIdRef.current
  };

  return (
    <MQTTContext.Provider value={contextValue}>
      {children}
    </MQTTContext.Provider>
  );
}

// Custom hook for consuming the context
export function useMQTT() {
  const context = useContext(MQTTContext);
  
  if (!context) {
    throw new Error('useMQTT must be used within a MQTTProvider');
  }
  
  return context;
}

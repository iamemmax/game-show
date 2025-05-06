'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useMqtt } from '@/hooks/useMqtt';
import { mqttConfig } from '@/config/mqtt';

interface MqttContextType {
  connectionStatus: 'Connected' | 'Reconnecting' | 'Disconnected';
  messages: Record<string, string>;
  subscribe: (topic: string) => void;
  publish: (topic: string, message: string) => void;
}

const MqttContext = createContext<MqttContextType | null>(null);

export const MqttProvider = ({ children }: { children: ReactNode }) => {
  // Ensure the broker URL is properly formatted with protocol
  const brokerUrl = mqttConfig.getBrokerUrl();
  console.log('MqttProvider initializing with broker URL:', brokerUrl);
  
  const mqttState = useMqtt(brokerUrl, {
    username: mqttConfig.username,
    password: mqttConfig.password,
    clean: true,
 // Keep connection alive with regular pings
  });

  return (
    <MqttContext.Provider value={mqttState}>
      {children}
    </MqttContext.Provider>
  );
};

export const useMqttContext = () => {
  const context = useContext(MqttContext);
  if (!context) {
    throw new Error('useMqttContext must be used within a MqttProvider');
  }
  return context;
};

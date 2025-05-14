'use client';

import React, { useState, useEffect } from 'react';
import { useMqtt } from '@/contexts/MqttContext';

export const MqttTest: React.FC = () => {
  const [message, setMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
  const { isConnected, sendMessage, onMessage, userId } = useMqtt();

  useEffect(() => {
    // Set up message handler
    onMessage((msg) => {
      setReceivedMessages((prev) => [msg, ...prev].slice(0, 10));
    });
  }, [onMessage]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        await sendMessage(message);
        setMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          ></div>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="text-sm text-gray-600">User ID: {userId}</div>
      </div>

      <div className="mb-4">
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-l"
            disabled={!isConnected}
          />
          <button
            onClick={handleSendMessage}
            disabled={!isConnected || !message.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-r disabled:bg-gray-300"
          >
            Send
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-2">Received Messages</h3>
        <div className="border rounded p-2 max-h-60 overflow-y-auto">
          {receivedMessages.length === 0 ? (
            <p className="text-gray-500 text-sm">No messages yet</p>
          ) : (
            receivedMessages.map((msg, index) => (
              <div key={index} className="mb-2 p-2 bg-gray-100 rounded">
                <div className="text-xs text-gray-500">
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'Unknown time'}
                </div>
                <div className="text-sm">
                  {msg.user_id === userId ? (
                    <span className="font-bold">You: </span>
                  ) : (
                    <span className="font-bold">{msg.user_id}: </span>
                  )}
                  {msg.message}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
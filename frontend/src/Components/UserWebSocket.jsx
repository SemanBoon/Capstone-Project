import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserWebSocket = ({ userId }) => {
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const connectWebSocket = () => {
      const socket = new WebSocket(`ws://localhost:5174/ws/${userId}`);
      socket.onopen = () => {
        console.log(`WebSocket connection established for user ${userId}`);
      };
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const message = data.message;
          if (message) {
            toast(message);
          } else {
            console.error("Message property not found in the received data", data);
          }
        } catch (error) {
          console.error("Error parsing message data", error);
        }
      };

      socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event);
        console.log('Reconnecting in 3 seconds...');
        setTimeout(connectWebSocket, 3000);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        socket.close();
      };

      setWs(socket);
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
    };
  }, [userId]);

  return <ToastContainer />;
};

export default UserWebSocket;

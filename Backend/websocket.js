const { PrismaClient } = require('@prisma/client');
const WebSocket = require('ws');
const prisma = new PrismaClient();
const PROXIMITY_RADIUS = 16093.4; // 10 miles in meters
const clients = new Map();
const { getGeocode } = require('./address-lookup.js')

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', async (ws, request) => {
  const userId = request.url.split('/').pop();
  clients.set(userId, ws);

  // Deliver undelivered notifications
  const undeliveredNotifications = await prisma.notification.findMany({
    where: { userId: userId, delivered: false },
  });

  undeliveredNotifications.forEach(async (notification) => {
    ws.send(JSON.stringify({ message: notification.message }));
    await prisma.notification.update({
      where: { id: notification.id },
      data: { delivered: true },
    });
  });

  ws.on('close', () => {
    clients.delete(userId);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for user ${userId}: ${error.message}`, error);
    clients.delete(userId);
  });
});

const handleUpgrade = (server) => {
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });
};

const sendNotification = async (userId, message) => {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({ message }));
  } else {
    await prisma.notification.create({
      data: {
        userId,
        message,
        delivered: client && client.readyState === WebSocket.OPEN,
      },
    });
  }
};

const notifyUsersInArea = async (newProvider) => {
  try {
    const newProviderLocation = await getGeocode(newProvider.businessAddress);
    const users = await prisma.user.findMany();
    for (const user of users) {
      try {
        const userLocation = await getGeocode(user.userAddress);
        const distance = Math.sqrt(
          Math.pow(newProviderLocation.x - userLocation.x, 2) +
          Math.pow(newProviderLocation.y - userLocation.y, 2)
        );
        if (distance <= PROXIMITY_RADIUS) {
          const notificationMessage = `A new gem, ${newProvider.businessName}, was just discovered in your area!`;
          await sendNotification(user.id, notificationMessage);
        }
      } catch (userError) {
        console.error(`Error processing user ${user.id}: ${userError.message}`);
      }
    }
  } catch (error) {
    console.error(`Error in notifyUsersInArea: ${error.message}`);
  }
};

module.exports = { handleUpgrade, sendNotification, notifyUsersInArea };

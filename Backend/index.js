const { PrismaClient } = require('@prisma/client');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });
const PORT = process.env.PORT || 5174;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const PROXIMITY_RADIUS = 16093.4;
const clients = new Map();

app.get("/", (req, res) => {
  res.send("Initial Selection Page");
});

app.get("/favorite", (req, res) => {
  res.send(`User Favorite Page`);
});

app.get("/user-profile", (req, res) => {
  res.send(`User Profile`);
});

app.get("/homepage", (req, res) => {
  res.send(`Welcome to the app`);
});


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

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

const sendNotification = async (userId, message) => {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({ message }));
  } else {
    await prisma.notification.create({
      data:{
        userId,
        message,
        delivered: client && client.readyState === WebSocket.OPEN
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


app.post("/user-signup", async (req, res) => {
  const { name, email, phoneNumber, password, userAddress } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 14);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
        hashedPassword,
        userAddress,
        userType: "user",
      },
    });
    res.status(200).json(newUser);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/service-provider-signup", upload.single("profilePhoto"), async (req, res) => {
  const { businessName, email, phoneNumber, password, businessAddress, priceRange, bio, services } = req.body;
  try {
    const existingUser = await prisma.serviceProvider.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 14);
    const newServiceProvider = await prisma.serviceProvider.create({
      data: {
        businessName,
        email,
        phoneNumber,
        hashedPassword,
        businessAddress,
        priceRange,
        bio,
        services,
        profilePhoto: req.file ? req.file.buffer : null,
        userType: "service-provider",
      },
    });
    await notifyUsersInArea(newServiceProvider);
    res.status(201).json(newServiceProvider);
  } catch (e) {
    console.error('Error in service-provider-signup:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let userRecord;
    userRecord = await prisma.user.findUnique({ where: { email } });
    if (userRecord) {
      const isMatch = await bcrypt.compare(password, userRecord.hashedPassword);
      if (isMatch) {
        userRecord.userType = "user";
        // Check for undelivered notifications
        const undeliveredNotifications = await prisma.notification.findMany({
          where: { userId: userRecord.id, delivered: false },
        });
        // Send undelivered notifications
        undeliveredNotifications.forEach(async (notification) => {
          await sendNotification(userRecord.id, notification.message);
          await prisma.notification.update({
            where: { id: notification.id },
            data: { delivered: true },
          });
        });
        return res.status(200).json(userRecord);
      } else {
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }

    userRecord = await prisma.serviceProvider.findUnique({ where: { email } });
    if (userRecord) {
      const isMatch = await bcrypt.compare(password, userRecord.hashedPassword);
      if (isMatch) {
        userRecord.userType = "service-provider";
        return res.status(200).json({ ...userRecord, redirectTo: `/provider-homepage/${userRecord.id}` });
      } else {
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }
    return res.status(404).json({ error: "User not found" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const getGeocode = async (address) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
    const data = await response.json();
    if (data.length === 0) {
      console.error(`No geocode candidates found for address: ${address}`);
      throw new Error('Invalid address');
    }
    const location = {
      x: parseFloat(data[0].lon),
      y: parseFloat(data[0].lat)
    };
    return location;
  } catch (error) {
    console.error(`Error fetching geocode for address ${address}: ${error.message}`);
    throw new Error('Error fetching geocode');
  }
}


app.post('/api/search', async (req, res) => {
  const { address, category } = req.body;
  try {
    const userLocation = await getGeocode(address);
    const serviceProviders = await prisma.serviceProvider.findMany({
      where: {
        services: {
          contains: category.toLowerCase(),
        },
      },
    });

    const results = await Promise.all(serviceProviders.map(async (provider) => {
      try {
        const providerLocation = await getGeocode(provider.businessAddress);
        const distance = Math.sqrt(
          Math.pow(userLocation.x - providerLocation.x, 2) +
          Math.pow(userLocation.y - providerLocation.y, 2)
        );
        return { ...provider, distance, latitude: providerLocation.y, longitude: providerLocation.x };
      } catch (err) {
        console.error(`Error fetching geocode for provider address: ${provider.businessAddress}`, err);
        return null;
      }
    }));

    const validResults = results.filter(result => result !== null);
    validResults.sort((a, b) => a.distance - b.distance);

    res.json(validResults);
  } catch (error) {
    console.error(`Error during search: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// service provider home page
app.get('/provider-homepage/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const profile = await prisma.serviceProvider.findUnique({
      where: { id },
    });
    res.send(`Welcome to the SheBraids, ${profile.businessName}`);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//to create an appointment
app.post('/create-appointment', async (req, res) => {
  const { userId, providerId, date, time, description } = req.body;
  try {
    const newAppointment = await prisma.appointment.create({
      data: {
        customerId: userId,
        serviceProviderId: providerId,
        date: new Date(date),
        time: time,
        description,
      },
    });
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// api to get all appointments for the user
app.get('/appointments/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const appointments = await prisma.appointment.findMany({
      where: { customerId: userId },
      include: {
        serviceProvider: true,
      },
    });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// api to get all appointments for the service provider
app.get('/service-provider-appointments/:providerId', async (req, res) => {
  const { providerId } = req.params;
  try {
    const appointments = await prisma.appointment.findMany({
      where: { serviceProviderId: providerId },
      include: {
        user: true,
      },
    });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Fetch a specific service provider profile
app.get('/service-provider-profile/:id', async (req, res) => {
  const { id } = req.params;
  const profile = await prisma.serviceProvider.findUnique({
    where: { id },
  });
  res.json(profile);
});


// Fetch all reviews of a single service provider
app.get('/service-provider-reviews', async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { serviceProviderId: req.query.id },
  });
  res.json(reviews);
});

// Upload photos and videos of service provider
app.post('/upload-media', upload.single('file'), async (req, res) => {
  const file = req.file;
  const url = `http://localhost:5174/uploads/${file.filename}`;
  res.json({ url, type: file.mimetype.startsWith('image/') ? 'image' : 'video' });
});

// Update service provider profile
app.put('/update-profile', async (req, res) => {
  const { id, businessName, bio, businessAddress, phoneNumber, priceRange } = req.body;

  const data = {};
  if (businessName !== undefined) data.businessName = businessName;
  if (bio !== undefined) data.bio = bio;
  if (businessAddress !== undefined) data.businessAddress = businessAddress;
  if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
  if (priceRange !== undefined) data.priceRange = priceRange;

  try {
    const updatedProfile = await prisma.serviceProvider.update({
      where: { id },
      data,
    });
    res.json(updatedProfile);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//adding a new service
app.post('/add-service', async (req, res) => {
  const { serviceProviderId, name, description, price } = req.body;
  try {
    const newService = await prisma.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        serviceProviderId
      }
    });
    res.status(200).json(newService);
  } catch (e) {
    console.error('Error adding service:', e);
    res.status(500).json({ error: e.message });
  }
});

//fetching all services for a specific service provider
app.get('/service-provider-services/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const services = await prisma.service.findMany({
      where: { serviceProviderId: id }
    });
    res.status(200).json(services);
  } catch (e) {
    console.error('Error fetching services:', e);
    res.status(500).json({ error: e.message });
  }
});

// Allow service providers to update their list of services.
app.put('/update-services', async (req, res) => {
  const { id, name, description, price } = req.body;
  const updatedServices = await prisma.serviceProvider.update({
    where: { id },
    data: {
      name,
      description,
      price,
    }
  });
  res.status(200).json(updatedServices);
});

//delete a service
app.delete('/delete-service', async (req, res) => {
  const { id } = req.body;
  try {
    const deletedService = await prisma.service.delete({
      where: { id },
    });
    res.status(200).json(deletedService);
  } catch (e) {
    console.error('Error deleting service:', e);
    res.status(500).json({ error: e.message });
  }
});

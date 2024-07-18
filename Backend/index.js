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


app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const PROXIMITY_RADIUS = 16093.4;
const clients = new Map();

console.log("Starting server setup...");

wss.on('connection', (ws, request) => {
  const userId = request.url.split('/').pop();
  console.log(`WebSocket connection established for user ${userId}`);
  clients.set(userId, ws);

  ws.on('close', () => {
    console.log(`WebSocket connection closed for user ${userId}`);
    clients.delete(userId);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for user ${userId}: ${error.message}`, error);
    clients.delete(userId);
  });
});

server.on('upgrade', (request, socket, head) => {
  console.log('Upgrading to WebSocket');
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

const sendNotification = async (userId, businessName) => {
  const client = clients.get(userId);
  const notificationMessage = `A new gem, ${businessName}, was just discovered in your area!`;
  if (client && client.readyState === WebSocket.OPEN) {
    console.log(`Sending notification to user ${userId}`);
    client.send(JSON.stringify({ message: notificationMessage }));
  } else {
    console.log(`Storing notification for later delivery to user ${userId}`);
    await prisma.notification.create({
      data:
      {
        userId,
        message: notificationMessage,
      },
    });
  }
};

const notifyUsersInArea = async (newProvider) => {
  try {
    const newProviderLocation = await getGeocode(newProvider.businessAddress);
    console.log(`New provider location: ${JSON.stringify(newProviderLocation)}`);

    const users = await prisma.user.findMany();
    for (const user of users) {
      try {
        const userLocation = await getGeocode(user.userAddress);
        const distance = Math.sqrt(
          Math.pow(newProviderLocation.x - userLocation.x, 2) +
          Math.pow(newProviderLocation.y - userLocation.y, 2)
        );

        console.log(`User location: ${JSON.stringify(userLocation)}, Distance: ${distance}`);

        if (distance <= PROXIMITY_RADIUS) {
          console.log(`Notifying user ${user.id} about new provider ${newProvider.businessName}`);
          await sendNotification(user.id, newProvider.businessName);
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
  console.log(`Received user signup request: ${email}`);
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
  console.log(`Received service provider signup request: ${email}`);
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
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
        profilePhoto: req.file.buffer,
        userType: "service-provider",
      },
    });
    notifyUsersInArea(newServiceProvider);
    res.status(201).json(newServiceProvider);
  } catch (e) {
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
    console.log(`Fetching geocode for address: ${address}`);
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
    console.log(`Geocode result for ${address}: ${JSON.stringify(location)}`);
    return location;
  } catch (error) {
    console.error(`Error fetching geocode for address ${address}: ${error.message}`);
    throw new Error('Error fetching geocode');
  }
}


app.post('/api/search', async (req, res) => {
  const { address, category } = req.body;
  console.log(`Received search request: address=${address}, category=${category.toLowerCase()}`);

  try {
    const userLocation = await getGeocode(address);
    console.log(`User location: ${JSON.stringify(userLocation)}`);

    const serviceProviders = await prisma.serviceProvider.findMany({
      where: {
        services: {
          contains: category.toLowerCase(),
        },
      },
    });

    console.log(`Found ${serviceProviders.length} service providers`);

    const results = await Promise.all(serviceProviders.map(async (provider) => {
      try {
        const providerLocation = await getGeocode(provider.businessAddress);
        const distance = Math.sqrt(
          Math.pow(userLocation.x - providerLocation.x, 2) +
          Math.pow(userLocation.y - providerLocation.y, 2)
        );
        return { ...provider, distance };
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

// api to get all appointments
app.get('/appointments', async (req, res) => {
  const appointments = await prisma.appointment.findMany();
  res.json(appointments);
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
  // Save the file to a storage service and return the URL
  const file = req.file;
  const url = `http://localhost:5174/uploads/${file.filename}`; // Replace with actual storage logic
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

// Allow service providers to update their list of services.
app.put('/update-services', async (req, res) => {
  const { id, services } = req.body;
  const updatedServices = await prisma.serviceProvider.update({
    where: { id },
    data: { services },
  });
  res.json(updatedServices);
});

//  Retrieve the list of services offered by a specific service provider.
app.get('/service-provider-services/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const provider = await prisma.serviceProvider.findUnique({
      where: { id },
    });
    res.json(provider.services);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//delete a service
app.delete('/delete-service', async (req, res) => {
  const { id, service } = req.body;
  try {
    // Fetch the current services
    const provider = await prisma.serviceProvider.findUnique({
      where: { id },
    });

    // Filter out the service to be deleted
    const updatedServices = provider.services.filter(s => s !== service);

    // Update the services in the database
    const updatedProvider = await prisma.serviceProvider.update({
      where: { id },
      data: { services: updatedServices },
    });

    res.json(updatedProvider);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

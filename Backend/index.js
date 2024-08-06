const { getAvailableSlots, calculateSlotPopularity, getRecommendedSlots, calculateUserPreferences, calculatePreferredTimeFromAppointments, getUpdatedWeights } = require('./utils.js');
const { handleUpgrade, notifyUsersInArea, sendNotification } = require('./websocket.js')
const { getGeocode } = require('./address-lookup.js')

const { PrismaClient } = require('@prisma/client');
const express = require('express');
const http = require('http');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const app = express();
app.use(express.json());
const prisma = new PrismaClient();
const server = http.createServer(app);
const PORT = process.env.PORT || 5174;

const UPLOAD_DIR = './media';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append extension
  },
});

const upload = multer({ storage });

let mediaFiles = [];

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`); //this concole.log is essential because it shows me that the backend is running and that it's running on the right port.
});

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Upload photos and videos of service provider
app.post('/upload-media/:providerId', upload.single('file'), (req, res) => {
  const providerId = req.params.providerId;
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileData = {
    id: Date.now(),
    providerId: providerId,
    filename: req.file.filename,
    path: req.file.path,
    mimeType: req.file.mimetype,
    originalName: req.file.originalname,
  };

  mediaFiles.push(fileData);
  res.status(200).json(fileData);
});

app.get('/media-files/:providerId', (req, res) => {
  const providerId = req.params.providerId;
  const providerMedia = mediaFiles.filter(file => file.providerId === providerId);
  res.status(200).json(providerMedia);
});

app.get('/media-files/file/:filename', (req, res) => {
  const filename = req.params.filename;
  const file = mediaFiles.find(f => f.filename === filename);

  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.set('Content-Type', file.mimeType);
  res.sendFile(path.resolve(file.path));
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

handleUpgrade(server);

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
  const { userId, providerId, date, time, description, serviceId } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        customerId: userId,
        serviceProviderId: providerId,
        date: new Date(date),
        time: time,
        description,
      },
    });

    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      select: { schedule: true },
    });

    if (provider && provider.schedule) {
      const schedule = provider.schedule[date];
      if (schedule) {
        const slots = schedule.slots;
        const status = schedule.status;
        const slotIndex = slots.findIndex(slot => new Date(slot).toTimeString().slice(0, 5) === time);

        const requiredSlots = Math.ceil(service.duration * 60 / 30);

        if (slotIndex !== -1) {
          for (let i = 0; i < requiredSlots; i++) {
            if (slotIndex + i < status.length) {
              status[slotIndex + i] = 1; // Mark as booked
            }
          }
          const updatedSchedule = {
            ...provider.schedule,
            [date]: {
              slots,
              status,
            },
          };

          await prisma.serviceProvider.update({
            where: { id: providerId },
            data: { schedule: updatedSchedule },
          });
        }
      }
    }
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
      include: { user: true },
    });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.post('/setup-schedule', async (req, res) => {
  const { providerId, date, startTime, endTime } = req.body;
  try {
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const slots = [];
    const status = [];

    while (start < end) {
      slots.push(new Date(start));
      status.push(0); // 0 To indicates the slot is not booked
      start.setMinutes(start.getMinutes() + 30);
    }

    const newSchedule = {
      [date]: {
        slots,
        status,
      },
    };

    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      select: { schedule: true },
    });

    // Merge existing schedule with new schedule
    const updatedSchedule = {
      ...provider.schedule,
      ...newSchedule,
    };
    // Update the service provider's schedule
    const updatedProvider = await prisma.serviceProvider.update({
      where: { id: providerId },
      data: {
        schedule: updatedSchedule,
      },
    });
    res.status(200).json({ message: 'Schedule set up successfully', schedule: updatedProvider.schedule });
  } catch (error) {
    console.error('Error setting up schedule:', error);
    res.status(500).json({ error: 'Failed to set up schedule' });
  }
});

// Fetch schedules for a specific service provider
app.get('/service-provider-schedule/:providerId', async (req, res) => {
  const { providerId } = req.params;
  try {
    // Retrieve the service provider's schedule from the database
    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      select: { schedule: true },
    });

    if (!provider) {
      return res.status(404).json({ error: 'Service provider not found' });
    }

    res.status(200).json(provider.schedule);
  } catch (error) {
    console.error('Error retrieving schedule:', error);
    res.status(500).json({ error: 'Failed to retrieve schedule' });
  }
});

// Fetch a specific service provider profile
app.get('/service-provider-profile/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const profile = await prisma.serviceProvider.findUnique({
      where: { id },
    });
    res.json(profile);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update service provider profile
app.put('/update-profile', async (req, res) => {
  const { email, id, businessName, bio, businessAddress, phoneNumber, priceRange } = req.body;

  const data = {};
  if (businessName !== undefined) data.businessName = businessName;
  if (bio !== undefined) data.bio = bio;
  if (businessAddress !== undefined) data.businessAddress = businessAddress;
  if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
  if (priceRange !== undefined) data.priceRange = priceRange;
  if (email !== undefined) data.email = email;

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
  const { serviceProviderId, name, description, price, duration } = req.body;
  try {
    const newService = await prisma.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseFloat(duration),
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
  const { id, name, description, price, duration } = req.body;
  const updatedServices = await prisma.serviceProvider.update({
    where: { id },
    data: {
      name,
      description,
      price: parseFloat(price),
      duration: parseFloat(duration),
      serviceProviderId
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

app.post('/add-favorite', async (req, res) => {
  const { userId, providerId } = req.body;
  try {
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        serviceProviderId: providerId,
      },
    });
    res.status(200).json(favorite);
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Endpoint to fetch a user's favorites
app.get('/user-favorites/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { serviceProvider: true },
    });
    res.status(200).json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

app.post('/check-favorite', async (req, res) => {
  const { userId, providerId } = req.body;
  try {
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId,
        serviceProviderId: providerId,
      },
    });
    if (favorite) {
      res.json({ isFavorite: true });
    } else {
      res.json({ isFavorite: false });
    }
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ error: 'Failed to check favorite' });
  }
});

app.post('/get-available-slots', async (req, res) => {
  const { providerId, serviceDuration, userDate } = req.body;
  try {
    const today = new Date();

    if (userDate < today) {
      return res.status(400).json({ error: 'Please enter a valid date' });
    }
    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      select: { schedule: true },
    });
    if (!provider) {
      return res.status(404).json({ error: 'Service provider not found' });
    }
    const availableSlots = getAvailableSlots(provider.schedule, serviceDuration, {}); // Slot popularity passed as {}
    res.status(200).json(availableSlots);
    } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
});

app.post('/get-recommended-slots', async (req, res) => {
  const { providerId, userId, serviceDuration, userPriority, userTime } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: {appointments: true} });
    const provider = await prisma.serviceProvider.findUnique({ where: { id: providerId } });

    if (!user || !provider) {
      return res.status(404).json({ error: 'User or Service Provider not found' });
    }

    let userPreferences = [];
    if (user.appointments.length > 0) {
      userPreferences = calculateUserPreferences(user.appointments);
    } else {
      userPreferences = ['09:00', '12:00', '15:00']; // Hard coded default preferred times for new suers
    }

    const preferredPeriod = calculatePreferredTimeFromAppointments(user.appointments);
    const slotPopularity = await calculateSlotPopularity(providerId);
    const availableSlots = getAvailableSlots(provider.schedule, serviceDuration, slotPopularity);
    const weights = getUpdatedWeights(userPriority);
    const recommendedSlots = getRecommendedSlots(availableSlots, userPreferences, provider, userTime || new Date(), serviceDuration, preferredPeriod, weights);
    res.status(200).json(recommendedSlots);
    } catch (error) {
    console.error('Error fetching recommended slots:', error);
    res.status(500).json({ error: 'Failed to fetch recommended slots' });
  }
});

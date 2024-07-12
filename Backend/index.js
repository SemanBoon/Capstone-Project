const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cors = require("cors");
const multer = require("multer");
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 14;
const geolib = require('geolib');
require("dotenv").config();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
require('dotenv').config();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5174;

app.listen(PORT, () => {
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

app.post("/user-signup", async (req, res) => {
  const { name, email, phoneNumber, password, userAddress } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
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

app.post("/service-provider-signup",upload.single("profilePhoto"),async (req, res) => {
    const { businessName, email, phoneNumber, password, businessAddress, priceRange, bio, services } = req.body;
    try {
      const existingUser = await prisma.user.findUnique({where: { email },});
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }
      const hashedPassword = await bcrypt.hash(password, saltRounds);
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
      res.status(201).json(newServiceProvider);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

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
        return res.status(200).json(userRecord);
      } else {
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }
    return res.status(404).json({ error: "User not found" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/service-providers', async (req, res) => {
  const { category, location } = req.query;

  try {

    if (!process.env.ARCGIS_API_KEY) {
      return res.status(500).json({error: "Invalid API"})
    }

    const geocodeResponse = await fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${encodeURIComponent(location)}&f=json&token=${process.env.ARCGIS_API_KEY}`)
    const geocodeData = await geocodeResponse.json();

    if (!geocodeData.candidates || geocodeData.candidates.length === 0) {
      return res.status(400).json({ error: 'Invalid location' });
    }

    const userCoords = {
      latitude: geocodeData.candidates[0].location.y,
      longitude: geocodeData.candidates[0].location.x,
    };

    const serviceProviders = await prisma.serviceProvider.findMany({
      where: {
        services: {
          contains: category
        }
      }
    });

    const providersWithDistances = await Promise.all(
      serviceProviders.map(async (provider) => {
        const providerGeocodeResponse = await fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${encodeURIComponent(provider.businessAddress)}&f=json&token=${process.env.ARCGIS_API_KEY}`)
        const providerGeocodeData = await providerGeocodeResponse.json();

        if (!providerGeocodeData.candidates || providerGeocodeData.candidates.length === 0) {
          return provider;
        }

        const providerCoords = {
          latitude: providerGeocodeData.candidates[0].location.y,
          longitude: providerGeocodeData.candidates[0].location.x,
        };

        const distance = geolib.getDistance(userCoords, providerCoords);
        return { ...provider, distance };
      })
    );

    providersWithDistances.sort((a, b) => a.distance - b.distance);

    res.json(providersWithDistances);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching service providers' });
  }
});

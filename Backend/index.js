const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cors = require("cors");
const multer = require("multer");
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 14;
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

async function getGeocode(address) {
  try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      if (data.length === 0) {
        throw new Error('Invalid address');
      }
      const location = {
          x: parseFloat(data[0].lon),
          y: parseFloat(data[0].lat)
      };
      return location;
  } catch (error) {
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
              return { ...provider, distance };
          } catch (err) {
            return null;
          }
      }));

      const validResults = results.filter(result => result !== null);
      validResults.sort((a, b) => a.distance - b.distance);

      res.json(validResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

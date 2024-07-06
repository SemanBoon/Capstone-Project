const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cors = require("cors");
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 14;
require("dotenv").config();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5174;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Initial Selection Page");
});


app.get("/homepage", (req, res) => {
  res.send(`Welcome to the app`);
});

app.post("/user-signup", async (req, res) => {
  const { name, email, phoneNumber, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber: parseInt(phoneNumber),
        hashedPassword,
      },
    });
    res.status(200).json(newUser);
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/service-provider-signup", async (req, res) => {
  const { businessName, email, phoneNumber, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newServiceProvider = await prisma.serviceProvider.create({
      data: {
        businessName,
        email,
        phoneNumber: parseInt(phoneNumber),
        hashedPassword,
      },
    });
    res.status(200).json(newServiceProvider);
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await prisma.user.findUnique({ where: { email } });
    if (!userRecord) {
      return res.status(404).json({ error: "User not found" });
    }
    if (userRecord) {
      const isMatch = await bcrypt.compare(password, userRecord.hashedPassword);
      if (isMatch) {
        return res.status(200).json(userRecord);
      } else {
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }

    const serviceProviderRecord = await prisma.user.findUnique({ where: { email } });
    if (!serviceProviderRecord) {
      return res.status(404).json({ error: "Service Provider not found" });
    }
    if (serviceProviderRecord) {
      const isMatch = await bcrypt.compare(password,serviceProviderRecord.hashedPassword);
      if (isMatch) {
        res.status(200).json(serviceProviderRecord);
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    }
  } catch (e) {
    console.log(e.message)
    res.status(500).json({ error: e.message });
  }
});

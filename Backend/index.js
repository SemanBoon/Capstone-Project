const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cors = require("cors");
const multer = require('multer');
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 14;
require("dotenv").config();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5174;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Initial Selection Page")
});

app.get("/favorite", (req,res) => {
  res.send(`User Favorite Page`)
});

app.get("/user-profile", (req, res) => {
  res.send(`User Profile`)
});

app.get("/homepage", (req, res) => {
  res.send(`Welcome to the app`)
});


app.post("/user-signup", async (req, res) => {
  const { name, email, phoneNumber, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({
      where: {email},
    })
    if (existingUser) {
      return res.status(400).json({error: "Email already in use"})
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
        hashedPassword,
        userType: "user",
      },
    });
    res.status(200).json(newUser);
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/service-provider-signup", upload.single('profilePhoto'), async (req, res) => {
  const { businessName, email, phoneNumber, password, businessAddress, priceRange, bio, services } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({
      where: {email},
    })
    if (existingUser) {
      return res.status(400).json({error: "Email already in use"})
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
        userType: "service-provider"
      },
    });
    res.status(201).json(newServiceProvider);
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ error: e.message });
  }
});


app.post("/login", async (req, res) => {
  const { email, password} = req.body;
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
    console.log(e.message)
    res.status(500).json({ error: e.message });
  }
});


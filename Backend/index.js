const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cors = require("cors");
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 14;
require("dotenv").config();

app.use(cors());
app.use(express.json())

const PORT = process.env.PORT || 5174;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

app.get("/homepage", (req, res) => {
  res.send(`Welcome to the app`);
});

app.post("/signup", async (req, res) => {
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
    console.log(e.message)
    res.status(500).json({ error: e.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await prisma.user.findUnique({ where: { email } });
    if (!userRecord) {
      console.log("user record not found")
      return res.status(404).json({ error: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, userRecord.hashedPassword);
    if (isMatch) {
      res.status(200).json(userRecord);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

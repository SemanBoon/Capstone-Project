const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cors = require("cors");
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 14;
const jwt = require("jsonwebtoken")
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
  console.log("hurray");
  const { name, email, phoneNumber, password } = req.body;
  console.log(name, email, phoneNumber);
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
      return res.status(404).json({ error: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, userRecord.hashedPassword);
    if (isMatch) {
      const user = { id: userRecord.id, email: userRecord.email };
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20m' });
      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id
        }
      });
      res.status(200).json({ accessToken, refreshToken});
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/token', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: {token: refreshToken}
    });
    if (!tokenRecord) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }
    const isValidRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!isValidRefreshToken) {
      return res.status(403).json({ error: 'Token is not valid' });
    }
    const user = { id: tokenRecord.userId};
    const newAccessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20m' });
    res.status(200).json({ accessToken: newAccessToken });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

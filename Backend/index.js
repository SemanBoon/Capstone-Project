const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cors = require("cors");
const express = require("express");
const bcrypt = require('bcrypt');
const saltRounds = 14;

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5173;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

app.post("/signup", async (req, res) => {
    console.log("hurray");
    const {name, email, phoneNumber, password} = req.body;
    console.log(name);
    bcrypt.hash(password, saltRounds, async function(err, hashed){
        try {
            await prisma.User.create({
                data:{
                    name,
                    email,
                    phoneNumber: parseInt(phoneNumber),
                    hashedPassword: hashed,
                }
            })
            res.status(200).json({});
        } catch (e) {
            res.status(500).json({"error": e.message});
        }
    })
})

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const userRecord = await prisma.user.findUnique({ where: { email } });
      if (!userRecord) {
        return res.status(404).json({ error: "User not found" });
      }
      const isMatch = await bcrypt.compare(password, userRecord.hashedPassword);
      if (isMatch) {
        res.status(200).json({});
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
});

app.get('/homepage', (req, res) => {
    res.send("welcome to app")
 })

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
    // fill this in
    const {name, email, phoneNumber, password} = req.body;
    bcrypt.hash(password, saltRounds, async function(err, hashed){
        try {
            await prisma.user.create({
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



app.get("/signup", async (req, res) =>
    res.send ('It worked')
  );

// app.post("/login", async (req, res) => {

// })

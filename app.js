const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const bcrypt = require('bcrypt');
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

mongoose.connect("mongodb://localhost:27017/admin");

const newSchema = new mongoose.Schema({
  email: String,
  password: String
})

const collection = mongoose.model("collection", newSchema)

app.get("/", cors(), (req, res) => {

})

app.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await collection.findOne({ email: email });

    if (user) {
      // Compare the hashed password with the one in the request
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (isPasswordMatch) {
        res.json("exist");
      } else {
        res.json("wrongpassword");
      }
    } else {
      res.json("notexist");
    }
  } catch (e) {
    res.json("fail");
  }
});


app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const check = await collection.findOne({ email: email });

    if (check) {
      res.json("exist");
    } else {
      // Hash the password before saving it to the database
      const hashedPassword = await bcrypt.hash(password, 10);

      const data = {
        email: email,
        password: hashedPassword, // Save the hashed password
      };
      console.log(data)

      await collection.insertMany(data);

      res.json("notexist");
    }
  } catch (e) {
    res.json("fail");
  }
});

//optional API to change the existing password

app.put("/update", async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    const user = await collection.findOne({ email });

    if (user) {
      const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

      if (isPasswordMatch) {
        // Update the password
        user.password = await bcrypt.hash(newPassword, 10);
        
        await user.save();

        res.json("updated");
      } else {
        res.json("wrongpassword");
      }
    } else {
      res.json("usernotfound");
    }
  } catch (e) {
    res.json("fail");
  }
});


app.listen(8000, () => {
  console.log("port connected");
})


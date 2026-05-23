const express = require("express");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();
const mongoose = require("mongoose");

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch((error) => console.log(error));

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.send("Backend is running successfully");
});

app.post("/upload-audio", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No audio uploaded",
    });
  }

  res.json({
    message: "Audio uploaded successfully",
    file: req.file,
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
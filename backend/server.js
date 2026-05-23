const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.log("MongoDB connection error:", error.message));

const transcriptionSchema = new mongoose.Schema({
  fileName: String,
  transcription: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Transcription = mongoose.model("Transcription", transcriptionSchema);

app.get("/", (req, res) => {
  res.send("Backend is running successfully");
});

app.post("/upload-audio", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No audio uploaded",
      });
    }

    const transcriptionText =
      "This is demo transcription text generated successfully.";

    const savedRecord = await Transcription.create({
      fileName: req.file.originalname,
      transcription: transcriptionText,
    });

    res.json({
      message: "Audio transcribed and saved successfully",
      transcription: transcriptionText,
      record: savedRecord,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Transcription failed",
      error: error.message,
    });
  }
});

app.get("/transcriptions", async (req, res) => {
  try {
    const records = await Transcription.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch transcriptions",
      error: error.message,
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const fs = require("fs");
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
  .catch((error) =>
    console.log("MongoDB connection error:", error.message)
  );

const transcriptionSchema = new mongoose.Schema({
  fileName: String,
  transcription: String,
  userEmail: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Transcription = mongoose.model(
  "Transcription",
  transcriptionSchema
);

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

    if (!req.body.userEmail) {
      return res.status(400).json({
        message: "User email is required",
      });
    }

    const audioBuffer = fs.readFileSync(req.file.path);

    const deepgramResponse = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": req.file.mimetype || "audio/webm",
        },
        body: audioBuffer,
      }
    );

    const deepgramData = await deepgramResponse.json();

    if (!deepgramResponse.ok) {
      throw new Error(
        deepgramData.err_msg || "Deepgram transcription failed"
      );
    }

    const transcriptionText =
      deepgramData.results.channels[0].alternatives[0].transcript;

    const savedRecord = await Transcription.create({
      fileName: req.file.originalname,
      transcription: transcriptionText,
      userEmail: req.body.userEmail,
    });
    fs.unlinkSync(req.file.path);

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
    const records = await Transcription.find({
      userEmail: req.query.email,
    }).sort({ createdAt: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch transcriptions",
      error: error.message,
    });
  }
});

app.delete("/transcriptions", async (req, res) => {
  try {
    await Transcription.deleteMany({
      userEmail: req.query.email,
    });

    res.json({
      message: "Transcription history cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to clear history",
      error: error.message,
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
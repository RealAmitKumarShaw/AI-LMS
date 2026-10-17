
const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const Prediction = require("./models/Prediction");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
    res.json({
        message: "AI-LMS Backend is running!",
        status: "success"
    });
});

// Get Prediction History
app.get("/api/predictions", async (req, res) => {
    try {
        const predictions = await Prediction.find()
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            count: predictions.length,
            predictions
        });
    } catch (error) {
        console.error("Fetch Prediction History Error:", error.message);

        res.status(500).json({
            message: "Failed to fetch prediction history"
        });
    }
});

// Get Prediction by ID
app.get("/api/predictions/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid prediction ID"
            });
        }

        const prediction = await Prediction.findById(req.params.id);

        if (!prediction) {
            return res.status(404).json({
                message: "Prediction not found"
            });
        }

        res.json(prediction);
    } catch (error) {
        console.error("Fetch Prediction Error:", error.message);

        res.status(500).json({
            message: "Failed to fetch prediction"
        });
    }
});

// Student Prediction Route
app.post("/api/predict", async (req, res) => {
    try {
        // Call ML API
        const response = await axios.post(
            "http://127.0.0.1:8000/predict",
            req.body
        );

        // Save prediction in MongoDB
        const predictionRecord = new Prediction({
            studentData: req.body,
            predictedGrade: response.data.predicted_grade,
            probabilities: response.data.probabilities
        });

        await predictionRecord.save();

        // Return prediction result
        res.json({
            ...response.data,
            saved: true,
            predictionId: predictionRecord._id
        });
    } catch (error) {
        console.error(
            "Prediction Error:",
            error.response?.data || error.message
        );

        res.status(error.response?.status || 500).json({
            message: "Student prediction failed",
            error: error.response?.data || error.message
        });
    }
});

// Start Server
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Backend server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start backend:", error.message);
        process.exit(1);
    }
};

startServer();

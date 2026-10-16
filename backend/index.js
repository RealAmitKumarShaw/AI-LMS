const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const Prediction = require("./models/Prediction");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "AI-LMS Backend is running!",
        status: "success"
    });
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

// Start server after database connection
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Backend server running on http://localhost:${PORT}`);
    });
};

startServer();

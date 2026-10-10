
const express = require("express");
const cors = require("cors");
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

/* Student Prediction Route */
app.post("/api/predict", async (req, res) => {
    try {
        const response = await require("axios").post(
            "http://127.0.0.1:8000/predict",
            req.body
        );

        res.json(response.data);
    } catch (error) {
        console.error(
            "ML Prediction Error:",
            error.response?.data || error.message
        );

        res.status(error.response?.status || 500).json({
            message: "Student prediction failed",
            error: error.response?.data || error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});

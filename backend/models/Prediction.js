
const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
    {
        studentData: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },
        predictedGrade: {
            type: Number,
            required: true
        },
        probabilities: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Prediction", predictionSchema);

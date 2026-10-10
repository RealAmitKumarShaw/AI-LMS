from fastapi import FastAPI
import joblib
import pandas as pd
from pathlib import Path
from fastapi import HTTPException
from pydantic import BaseModel, Field


class StudentData(BaseModel):
    StudyHours: float = Field(ge=5, le=44)
    Attendance: float = Field(ge=60, le=100)
    Resources: int = Field(ge=0, le=2)
    Extracurricular: int = Field(ge=0, le=1)
    Internet: int = Field(ge=0, le=1)
    Gender: int = Field(ge=0, le=1)
    Discussions: int = Field(ge=0, le=1)
    Motivation: int = Field(ge=0, le=2)
    Age: int = Field(ge=18, le=29)
    LearningStyle: int
    OnlineCourses: int = Field(ge=0, le=20)
    AssignmentCompletion: float = Field(ge=50, le=100)
    EduTech: int
    StressLevel: int


app = FastAPI(
    title="AI-LMS ML API",
    description="Machine Learning API for Student Performance Prediction",
    version="1.0.0"
)


# Define the model directory
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"

# Load the trained model and preprocessor
preprocessor = joblib.load(
    MODEL_DIR / "preprocessor.joblib"
)

model = joblib.load(
    MODEL_DIR / "random_forest_model.joblib"
)

print("Preprocessor loaded successfully.")
print("ML model loaded successfully.")



@app.get("/")
def home():
    return {
        "message": "AI-LMS ML API is running!",
        "status": "success"
    }

@app.post("/predict")
def predict_student(student: StudentData):
    try:
        # Convert student input into a DataFrame
        student_df = pd.DataFrame([student.model_dump()])

        # Apply the saved preprocessing pipeline
        student_processed = preprocessor.transform(student_df)

        # Restore feature names expected by the trained model
        processed_feature_names = preprocessor.get_feature_names_out()

        student_processed_df = pd.DataFrame(
            student_processed,
            columns=processed_feature_names
        )

        # Predict the student's final grade
        prediction = model.predict(student_processed_df)[0]

        # Get probability for each grade
        probabilities = model.predict_proba(student_processed_df)[0]

        grade_probabilities = {
            str(grade): round(float(probability) * 100, 2)
            for grade, probability in zip(model.classes_, probabilities)
        }

        return {
            "predicted_grade": int(prediction),
            "probabilities": grade_probabilities
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(error)}"
        ) from error

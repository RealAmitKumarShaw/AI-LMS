import joblib
import pandas as pd
from pathlib import Path


# Load model and preprocessor
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"

preprocessor = joblib.load(MODEL_DIR / "preprocessor.joblib")
model = joblib.load(MODEL_DIR / "random_forest_model.joblib")

print("Preprocessor loaded successfully.")
print("Model loaded successfully.")


# Prediction function
def predict_student(student_data):
    student_df = pd.DataFrame([student_data])

    student_processed = preprocessor.transform(student_df)

    processed_feature_names = preprocessor.get_feature_names_out()

    student_processed_df = pd.DataFrame(
        student_processed,
        columns=processed_feature_names
    )

    prediction = model.predict(student_processed_df)
    prediction_probabilities = model.predict_proba(student_processed_df)

    return prediction[0], prediction_probabilities[0]


# Sample student data
student_data = {
    "StudyHours": 25,
    "Attendance": 85,
    "Resources": 1,
    "Extracurricular": 1,
    "Motivation": 2,
    "Internet": 1,
    "Gender": 0,
    "Age": 22,
    "LearningStyle": 1,
    "OnlineCourses": 10,
    "Discussions": 1,
    "AssignmentCompletion": 90,
    "EduTech": 1,
    "StressLevel": 1
}


# Make prediction
prediction, prediction_probabilities = predict_student(student_data)

print("Predicted FinalGrade:", prediction)


# Display grade probabilities
print("\nGrade Probabilities:")

for class_label, probability in zip(
    model.classes_,
    prediction_probabilities
):
    print(f"Grade {class_label}: {probability * 100:.2f}%")
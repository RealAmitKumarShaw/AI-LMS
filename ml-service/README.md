# AI-Powered Learning Management System

An AI-powered Learning Management System (AI-LMS) that combines a
full-stack web application with Machine Learning to analyze student
learning behavior, predict academic performance, detect at-risk
students, and provide personalized learning recommendations.

## Project Vision

The system will provide:

-   Student Performance Prediction
-   At-Risk Student Detection
-   Course Recommendation
-   Personalized Learning
-   Quiz Difficulty Prediction

## Technology Stack

### Frontend

-   React.js
-   Vite
-   Tailwind CSS
-   Axios
-   Recharts

### Backend

-   Node.js
-   Express.js
-   MongoDB
-   Mongoose
-   JWT Authentication

### Machine Learning

-   Python
-   Pandas
-   NumPy
-   Scikit-learn
-   Matplotlib
-   Seaborn
-   FastAPI

## Project Architecture

``` text
React Frontend
       |
       v
Node.js + Express
       |
   +---+---+
   |       |
   v       v
MongoDB  Python ML API
             |
             v
        Scikit-learn
             |
      +------+------+
      |      |      |
      v      v      v
 Performance  Risk  Recommendation
 Prediction   Detection   System
```

## Current ML Project

### Student Final Grade Prediction

The first ML task is to predict `FinalGrade` from student learning
behavior and academic activity.

### Target

``` text
FinalGrade
```

The target contains four classes:

``` text
0
1
2
3
```

### Candidate Features

``` text
StudyHours
Attendance
Resources
Extracurricular
Motivation
Internet
Gender
Age
LearningStyle
OnlineCourses
Discussions
AssignmentCompletion
EduTech
StressLevel
```

### ExamScore

`ExamScore` is currently excluded from the primary model because
exploratory analysis showed an extremely strong relationship with
`FinalGrade`.

Spearman correlation:

``` text
ExamScore → -0.967698
```

This may indicate target leakage or a direct relationship between exam
performance and final grade. The primary AI-LMS model will therefore
focus on features available before the final examination.

## Dataset

Student Performance and Learning Behavior dataset.

Original dataset:

``` text
14,003 rows
16 columns
```

Cleaning performed:

``` text
Exact duplicate rows removed: 1,534
Cleaned dataset: 12,469 rows
Missing values: 0
```

### Data Organization

``` text
data/
├── raw/
│   └── merged_dataset.csv
│
└── clean/
    └── cleaned_dataset.csv
```

The raw dataset is kept unchanged.

## Current Progress

-   [x] Dataset loaded
-   [x] Dataset shape checked
-   [x] Column names inspected
-   [x] Data types inspected
-   [x] Unique values inspected
-   [x] Missing values checked
-   [x] Duplicate rows investigated
-   [x] Exact duplicate rows removed
-   [x] Cleaned dataset saved
-   [x] Target variable identified
-   [x] Numerical distributions analyzed
-   [x] Numerical features vs FinalGrade analyzed
-   [x] Categorical features analyzed
-   [x] Cramer's V calculated
-   [x] Spearman correlation calculated

## Upcoming ML Work

-   [ ] Complete EDA
-   [ ] Final feature selection
-   [ ] Outlier analysis
-   [ ] Data preprocessing
-   [ ] Train-test split
-   [ ] Classification models
-   [ ] Model comparison
-   [ ] Hyperparameter tuning
-   [ ] Cross-validation
-   [ ] Final model selection
-   [ ] Model evaluation
-   [ ] Save trained model
-   [ ] Build FastAPI ML service
-   [ ] Connect ML API with Node.js backend
-   [ ] Build React frontend
-   [ ] Integrate AI features
-   [ ] Deployment

## Project Structure

``` text
AI-LMS/
├── ml-service/
│   ├── data/
│   │   ├── raw/
│   │   └── clean/
│   ├── models/
│   ├── notebooks/
│   │   └── 01_data_exploration.ipynb
│   ├── src/
│   │   ├── __init__.py
│   │   ├── data_preprocessing.py
│   │   ├── train.py
│   │   └── predict.py
│   └── requirements.txt
├── frontend/
├── backend/
├── README.md
└── .gitignore
```

## Development Roadmap

``` text
Dataset
   ↓
EDA
   ↓
Preprocessing
   ↓
Feature Engineering
   ↓
Model Training
   ↓
Model Evaluation
   ↓
FastAPI ML Service
   ↓
Node.js Backend
   ↓
React Frontend
   ↓
AI-LMS Integration
   ↓
Deployment
```

## Future AI Features

1.  Student Performance Prediction
2.  At-Risk Student Detection
3.  Course Recommendation
4.  Personalized Learning
5.  Quiz Difficulty Prediction

## Status

🚧 Project under active development.

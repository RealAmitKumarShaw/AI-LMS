
# AI-Powered Learning Management System (AI-LMS)

An AI-powered Learning Management System that uses Machine Learning to predict student academic performance and maintain prediction history through a full-stack web application.

## Features

- Student performance prediction using a trained Machine Learning model
- Interactive React dashboard
- REST APIs built with FastAPI and Express.js
- MongoDB integration for storing prediction records
- Prediction history with timestamps
- Class probability visualization
- Modular ML preprocessing and training pipeline

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, CSS |
| Backend | Node.js, Express.js |
| ML API | Python, FastAPI, Scikit-learn |
| Database | MongoDB Atlas |
| Data Processing | Pandas, NumPy |
| Model Persistence | Joblib |

## Project Structure

```text
AI-LMS/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   └── Prediction.js
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
├── ml-service/
│   ├── api/
│   │   └── main.py
│   ├── src/
│   │   ├── data_preprocessing.py
│   │   ├── train.py
│   │   └── predict.py
│   ├── notebooks/
│   └── requirements.txt
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js and npm
- Python 3.10 or a compatible Python version
- MongoDB Atlas account
- Trained ML model and preprocessing artifacts

## Setup and Installation

### 1. Clone the repository

```bash
git clone https://github.com/RealAmitKumarShaw/AI-LMS.git
cd AI-LMS
```

### 2. Configure MongoDB

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Replace the placeholder with your MongoDB Atlas connection string. Never commit `.env` or expose database credentials.

### 3. Start the ML service

Install the Python dependencies:

```bash
pip install -r ml-service/requirements.txt
```

From the project root, run:

```bash
uvicorn ml-service.api.main:app --reload
```

ML API documentation:

http://127.0.0.1:8000/docs

Ensure the trained model and preprocessing files required by the API are available locally.

### 4. Start the backend

Open a new terminal:

```bash
cd backend
npm install
node index.js
```

Backend URL:

http://localhost:5000

### 5. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Backend health check |
| POST | `/api/predict` | Predict student performance and save the result |
| GET | `/api/predictions` | Retrieve prediction history |
| GET | `/api/predictions/:id` | Retrieve a prediction by ID |
| GET | `/` on port 8000 | ML service health check |
| POST | `/predict` on port 8000 | Run the ML prediction |

## Machine Learning Workflow

1. Data exploration and preprocessing
2. Feature transformation and encoding
3. Model training and evaluation
4. Prediction through the FastAPI service
5. Prediction storage in MongoDB
6. Visualization through the React dashboard

## Security Notes

- Keep database credentials in environment variables.
- Do not commit `.env`, raw private datasets, or local model artifacts.
- Restrict MongoDB Atlas network access to trusted IP addresses.
- Use appropriate validation for all prediction inputs.

## Future Improvements

- Student risk detection
- Personalized learning recommendations
- Improved prediction input validation
- Authentication and role-based access
- Deployment of the frontend, backend, and ML service

## Author

**Amit Kumar Shaw**

GitHub: [RealAmitKumarShaw](https://github.com/RealAmitKumarShaw)

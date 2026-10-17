
import { useState, useEffect } from "react";
import "./App.css";

const initialFormData = {
  StudyHours: "",
  Attendance: "",
  Age: "",
  OnlineCourses: "",
  AssignmentCompletion: "",
  Resources: "1",
  Extracurricular: "0",
  Motivation: "1",
  Internet: "1",
  Gender: "0",
  LearningStyle: "",
  Discussions: "0",
  EduTech: "",
  StressLevel: "",
};

function App() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(initialFormData);
  const [result, setResult] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [predictError, setPredictError] = useState("");

  const fetchPredictions = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/predictions"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch prediction history");
      }

      const data = await response.json();
      setPredictions(data.predictions || []);
      setError("");
    } catch (err) {
      console.error("Prediction history error:", err);
      setError("Unable to load prediction history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const latestPrediction = predictions[0];

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handlePrediction = async (event) => {
    event.preventDefault();
    setPredicting(true);
    setPredictError("");
    setResult(null);

    const emptyField = Object.entries(formData).find(
      ([, value]) => value === ""
    );

    if (emptyField) {
      setPredictError("Please fill in all fields.");
      setPredicting(false);
      return;
    }

    const studentData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        Number(value),
      ])
    );

    try {
      const response = await fetch(
        "http://localhost:5000/api/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Prediction failed. Please check your inputs."
        );
      }

      setResult(data);
      await fetchPredictions();
    } catch (err) {
      console.error("Prediction error:", err);
      setPredictError(err.message || "Something went wrong.");
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <h1>AI-LMS</h1>
          <p>Student Performance Dashboard</p>
        </div>

        <nav className="navigation">
          {["Overview", "Predict", "History"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main className="main-content">
        <h2>{activeTab}</h2>
        <p>Welcome to your AI-powered student performance dashboard.</p>

        {activeTab === "Overview" && (
          <>
            {loading && <p>Loading dashboard data...</p>}
            {error && <p role="alert">{error}</p>}

            <div className="stats-grid">
              <div className="stat-card">
                <p>Total Predictions</p>
                <h3>{loading ? "..." : predictions.length}</h3>
                <span>Saved prediction records</span>
              </div>

              <div className="stat-card">
                <p>Latest Prediction</p>
                <h3>
                  {loading
                    ? "..."
                    : latestPrediction
                      ? latestPrediction.predictedGrade
                      : "--"}
                </h3>
                <span>
                  {latestPrediction
                    ? "Latest predicted grade"
                    : "No predictions yet"}
                </span>
              </div>

              <div className="stat-card">
                <p>Model Accuracy</p>
                <h3>88.85%</h3>
                <span>Initial test evaluation</span>
              </div>
            </div>
          </>
        )}

        {activeTab === "Predict" && (
          <div className="prediction-form-card">
            <h3>Student Performance Prediction</h3>
            <p>Enter the student's details to predict performance.</p>

            <form
              className="prediction-form"
              onSubmit={handlePrediction}
            >
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="StudyHours">Study Hours</label>
                  <input
                    id="StudyHours"
                    type="number"
                    name="StudyHours"
                    min="5"
                    max="44"
                    step="any"
                    value={formData.StudyHours}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="Attendance">Attendance (%)</label>
                  <input
                    id="Attendance"
                    type="number"
                    name="Attendance"
                    min="60"
                    max="100"
                    step="any"
                    value={formData.Attendance}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="Age">Age</label>
                  <input
                    id="Age"
                    type="number"
                    name="Age"
                    min="18"
                    max="29"
                    value={formData.Age}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="OnlineCourses">Online Courses</label>
                  <input
                    id="OnlineCourses"
                    type="number"
                    name="OnlineCourses"
                    min="0"
                    max="20"
                    value={formData.OnlineCourses}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="AssignmentCompletion">
                    Assignment Completion (%)
                  </label>
                  <input
                    id="AssignmentCompletion"
                    type="number"
                    name="AssignmentCompletion"
                    min="50"
                    max="100"
                    step="any"
                    value={formData.AssignmentCompletion}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="Resources">Resources</label>
                  <select
                    id="Resources"
                    name="Resources"
                    value={formData.Resources}
                    onChange={handleInputChange}
                  >
                    <option value="0">Low</option>
                    <option value="1">Medium</option>
                    <option value="2">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="Extracurricular">
                    Extracurricular Activities
                  </label>
                  <select
                    id="Extracurricular"
                    name="Extracurricular"
                    value={formData.Extracurricular}
                    onChange={handleInputChange}
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="Motivation">Motivation</label>
                  <select
                    id="Motivation"
                    name="Motivation"
                    value={formData.Motivation}
                    onChange={handleInputChange}
                  >
                    <option value="0">Low</option>
                    <option value="1">Medium</option>
                    <option value="2">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="Internet">Internet Access</label>
                  <select
                    id="Internet"
                    name="Internet"
                    value={formData.Internet}
                    onChange={handleInputChange}
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="Gender">Gender</label>
                  <select
                    id="Gender"
                    name="Gender"
                    value={formData.Gender}
                    onChange={handleInputChange}
                  >
                    <option value="0">Category 0</option>
                    <option value="1">Category 1</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="LearningStyle">Learning Style</label>
                  <input
                    id="LearningStyle"
                    type="number"
                    name="LearningStyle"
                    min="0"
                    value={formData.LearningStyle}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="Discussions">
                    Discussions Participation
                  </label>
                  <select
                    id="Discussions"
                    name="Discussions"
                    value={formData.Discussions}
                    onChange={handleInputChange}
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="EduTech">Educational Technology</label>
                  <input
                    id="EduTech"
                    type="number"
                    name="EduTech"
                    min="0"
                    value={formData.EduTech}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="StressLevel">Stress Level</label>
                  <input
                    id="StressLevel"
                    type="number"
                    name="StressLevel"
                    min="0"
                    value={formData.StressLevel}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="predict-button"
                disabled={predicting}
              >
                {predicting ? "Predicting..." : "Predict Performance"}
              </button>
            </form>

            {predictError && <p role="alert">{predictError}</p>}

            {result && (
              <div className="result-card">
                <div className="result-header">
                  <div>
                    <span className="result-label">
                      PREDICTION COMPLETE
                    </span>
                    <h3>Prediction Result</h3>
                  </div>
                  <span className="result-badge">Success</span>
                </div>

                <div className="grade-display">
                  <span>Predicted Grade</span>
                  <strong>{result.predicted_grade}</strong>
                  <p>Model's predicted class</p>
                </div>

                {result.probabilities && (
                  <div className="probability-section">
                    <h4>Class Probabilities</h4>

                    {Object.entries(result.probabilities).map(
                      ([grade, probability]) => {
                        const numericProbability = Number(probability);
                        const percentage =
                          numericProbability <= 1
                            ? numericProbability * 100
                            : numericProbability;

                        return (
                          <div
                            className="probability-row"
                            key={grade}
                          >
                            <div className="probability-info">
                              <span>Grade {grade}</span>
                              <strong>
                                {percentage.toFixed(2)}%
                              </strong>
                            </div>

                            <div className="probability-track">
                              <div
                                className="probability-fill"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(0, percentage)
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}

                <p className="result-message">
                  {result.saved
                    ? "Prediction saved successfully to history."
                    : "Prediction completed."}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "History" && (
          <div className="stat-card">
            <h3>Prediction History</h3>

            {loading ? (
              <p>Loading history...</p>
            ) : error ? (
              <p>{error}</p>
            ) : predictions.length === 0 ? (
              <p>No prediction records found.</p>
            ) : (
              <div className="history-list">
                {predictions.map((prediction) => (
                  <div className="history-item" key={prediction._id}>
                    <div>
                      <strong>
                        Grade: {prediction.predictedGrade}
                      </strong>
                      <p>
                        {prediction.createdAt
                          ? new Date(
                              prediction.createdAt
                            ).toLocaleString()
                          : "Date unavailable"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

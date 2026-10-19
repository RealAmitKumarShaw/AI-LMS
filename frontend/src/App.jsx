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

const fieldLabels = {
  StudyHours: "Study Hours",
  Attendance: "Attendance (%)",
  Age: "Age",
  OnlineCourses: "Online Courses",
  AssignmentCompletion: "Assignment Completion (%)",
  Resources: "Resources",
  Extracurricular: "Extracurricular Activities",
  Motivation: "Motivation",
  Internet: "Internet Access",
  Gender: "Gender",
  LearningStyle: "Learning Style",
  Discussions: "Discussions Participation",
  EduTech: "Educational Technology",
  StressLevel: "Stress Level",
};

function formatProbability(probability) {
  const value = Number(probability);
  return `${(value <= 1 ? value * 100 : value).toFixed(2)}%`;
}

function getConfidence(probabilities) {
  if (!probabilities || Object.keys(probabilities).length === 0) {
    return null;
  }

  const values = Object.values(probabilities).map((value) => {
    const number = Number(value);
    return number <= 1 ? number * 100 : number;
  });

  const confidence = Math.max(...values);

  if (!Number.isFinite(confidence)) {
    return null;
  }

  const level =
    confidence >= 80 ? "High" : confidence >= 60 ? "Moderate" : "Low";

  return { confidence, level };
}

function App() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [predictions, setPredictions] = useState([]);
  const [historySearch, setHistorySearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [confidenceFilter, setConfidenceFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(initialFormData);
  const [result, setResult] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [predictError, setPredictError] = useState("");
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const fetchPredictions = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/predictions");

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

  const filteredPredictions = predictions.filter((prediction) => {
    // Search by Prediction ID and student input values
    const searchText = historySearch.trim().toLowerCase();

    const studentDataText = Object.entries(prediction.studentData || {})
      .map(([key, value]) => `${key} ${value}`)
      .join(" ")
      .toLowerCase();

    const predictionId = String(prediction._id || "").toLowerCase();

    const matchesSearch =
      !searchText ||
      predictionId.includes(searchText) ||
      studentDataText.includes(searchText) ||
      String(prediction.predictedGrade).includes(searchText);

    // Filter by predicted grade
    const matchesGrade =
      gradeFilter === "all" ||
      String(prediction.predictedGrade) === gradeFilter;

    // Filter by confidence level
    const confidenceValues = Object.values(prediction.probabilities || {}).map(
      (value) => {
        const number = Number(value);
        return number <= 1 ? number * 100 : number;
      },
    );

    const confidence = confidenceValues.length
      ? Math.max(...confidenceValues)
      : null;

    const confidenceLevel =
      confidence === null
        ? "unknown"
        : confidence >= 80
          ? "High"
          : confidence >= 60
            ? "Moderate"
            : "Low";

    const matchesConfidence =
      confidenceFilter === "all" ||
      confidenceLevel.toLowerCase() === confidenceFilter.toLowerCase();

    return matchesSearch && matchesGrade && matchesConfidence;
  });

  const getConfidenceColors = (level) => {
    if (level === "High") {
      return {
        background: "#dcfce7",
        color: "#166534",
        bar: "#16a34a",
      };
    }

    if (level === "Moderate") {
      return {
        background: "#fef3c7",
        color: "#92400e",
        bar: "#d97706",
      };
    }

    return {
      background: "#fee2e2",
      color: "#991b1b",
      bar: "#dc2626",
    };
  };

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
      ([, value]) => value === "",
    );

    if (emptyField) {
      setPredictError("Please fill in all fields.");
      setPredicting(false);
      return;
    }

    const studentData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, Number(value)]),
    );

    try {
      const response = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.detail ||
            "Prediction failed. Please check your inputs.",
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

  const handleViewDetails = async (predictionId) => {
    setSelectedPrediction(null);
    setDetailsError("");
    setDetailsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/predictions/${predictionId}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load prediction details.");
      }

      setSelectedPrediction(data);
    } catch (err) {
      console.error("Prediction details error:", err);
      setDetailsError(err.message || "Unable to load prediction details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedPrediction(null);
    setDetailsError("");
    setDetailsLoading(false);
  };

  const renderConfidence = (probabilities, compact = false) => {
    const data = getConfidence(probabilities);

    if (!data) return null;

    const { confidence, level } = data;
    const colors = getConfidenceColors(level);

    if (compact) {
      return (
        <div
          style={{
            minWidth: "100px",
            padding: "8px 10px",
            borderRadius: "8px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: "12px",
              color: "#64748b",
              marginBottom: "5px",
            }}
          >
            Confidence
          </span>

          <strong style={{ fontSize: "14px" }}>{confidence.toFixed(2)}%</strong>

          <span
            style={{
              display: "block",
              width: "fit-content",
              marginTop: "5px",
              padding: "3px 8px",
              borderRadius: "20px",
              background: colors.background,
              color: colors.color,
              fontSize: "11px",
              fontWeight: "700",
            }}
          >
            {level}
          </span>
        </div>
      );
    }

    const message =
      level === "High"
        ? "The model assigns a relatively high probability to its predicted grade."
        : level === "Moderate"
          ? "The model favors its predicted grade, but some uncertainty remains."
          : "The model's predicted grade is uncertain because the highest class probability is relatively low.";

    return (
      <div
        style={{
          margin: "20px 0",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "10px",
          }}
        >
          <strong>Prediction Confidence</strong>

          <span
            style={{
              padding: "5px 10px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "600",
              background: colors.background,
              color: colors.color,
            }}
          >
            {level}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "8px",
          }}
        >
          <span style={{ color: "#64748b", fontSize: "14px" }}>
            Highest class probability
          </span>

          <strong style={{ fontSize: "20px" }}>{confidence.toFixed(2)}%</strong>
        </div>

        <div
          style={{
            height: "8px",
            borderRadius: "10px",
            background: "#e2e8f0",
            overflow: "hidden",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, Math.max(0, confidence))}%`,
              borderRadius: "10px",
              background: colors.bar,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <p
          style={{
            margin: 0,
            color: "#475569",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          {message}
        </p>

        <p
          style={{
            margin: "10px 0 0",
            color: "#64748b",
            fontSize: "12px",
            lineHeight: "1.5",
          }}
        >
          This probability reflects the model's estimate for its most likely
          grade. It is not a guarantee of the student's actual performance.
        </p>
      </div>
    );
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

        {/* OVERVIEW */}
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

        {/* PREDICT */}
        {activeTab === "Predict" && (
          <div className="prediction-form-card">
            <h3>Student Performance Prediction</h3>
            <p>Enter the student's details to predict performance.</p>

            <form className="prediction-form" onSubmit={handlePrediction}>
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
                    required
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
                    required
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
                    required
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
                    required
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
                    required
                  >
                    <option value="0">Category 0</option>
                    <option value="1">Category 1</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="LearningStyle">Learning Style</label>
                  <select
                    id="LearningStyle"
                    name="LearningStyle"
                    value={formData.LearningStyle}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Learning Style</option>
                    <option value="0">Category 0</option>
                    <option value="1">Category 1</option>
                    <option value="2">Category 2</option>
                    <option value="3">Category 3</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="Discussions">Discussions Participation</label>
                  <select
                    id="Discussions"
                    name="Discussions"
                    value={formData.Discussions}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="EduTech">Educational Technology</label>
                  <select
                    id="EduTech"
                    name="EduTech"
                    value={formData.EduTech}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Educational Technology</option>
                    <option value="0">Category 0</option>
                    <option value="1">Category 1</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="StressLevel">Stress Level</label>
                  <select
                    id="StressLevel"
                    name="StressLevel"
                    value={formData.StressLevel}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Stress Level</option>
                    <option value="0">Category 0</option>
                    <option value="1">Category 1</option>
                    <option value="2">Category 2</option>
                  </select>
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

            {/* PREDICTION RESULT */}
            {result && (
              <div className="result-card">
                <div className="result-header">
                  <div>
                    <span className="result-label">PREDICTION COMPLETE</span>
                    <h3>Prediction Result</h3>
                  </div>
                  <span className="result-badge">Success</span>
                </div>

                <div className="grade-display">
                  <span>Predicted Grade</span>
                  <strong>{result.predicted_grade}</strong>
                  <p>Model's predicted class</p>
                </div>

                {result.confidence !== undefined &&
                  renderConfidence(result.probabilities)}

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
                          <div className="probability-row" key={grade}>
                            <div className="probability-info">
                              <span>Grade {grade}</span>
                              <strong>{percentage.toFixed(2)}%</strong>
                            </div>

                            <div className="probability-track">
                              <div
                                className="probability-fill"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(0, percentage),
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      },
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

        {/* HISTORY */}
        {activeTab === "History" && (
          <div className="history-card">
            <div className="history-header">
              <div>
                <h3>Prediction History</h3>
                <p>Review your previously saved predictions.</p>
              </div>

              <span className="history-count">
                {loading
                  ? "Loading..."
                  : `${filteredPredictions.length} of ${predictions.length} Records`}
              </span>
            </div>

            {/* SEARCH AND FILTERS */}
            <div className="history-filters">
              <div className="history-filter-group history-search-group">
                <label htmlFor="history-search">Search Predictions</label>
                <input
                  id="history-search"
                  className="history-filter-control"
                  type="search"
                  placeholder="Search ID, study hours, attendance..."
                  value={historySearch}
                  onChange={(event) => setHistorySearch(event.target.value)}
                />
              </div>

              <div className="history-filter-group">
                <label htmlFor="history-grade-filter">Predicted Grade</label>
                <select
                  id="history-grade-filter"
                  className="history-filter-control"
                  value={gradeFilter}
                  onChange={(event) => setGradeFilter(event.target.value)}
                >
                  <option value="all">All Grades</option>
                  <option value="0">Grade 0</option>
                  <option value="1">Grade 1</option>
                  <option value="2">Grade 2</option>
                  <option value="3">Grade 3</option>
                </select>
              </div>

              <div className="history-filter-group">
                <label htmlFor="history-confidence-filter">
                  Prediction Confidence
                </label>
                <select
                  id="history-confidence-filter"
                  className="history-filter-control"
                  value={confidenceFilter}
                  onChange={(event) => setConfidenceFilter(event.target.value)}
                >
                  <option value="all">All Confidence Levels</option>
                  <option value="High">High Confidence</option>
                  <option value="Moderate">Moderate Confidence</option>
                  <option value="Low">Low Confidence</option>
                </select>
              </div>
            </div>

            {loading ? (
              <p className="history-message">Loading prediction history...</p>
            ) : error ? (
              <p className="history-message error-message">{error}</p>
            ) : filteredPredictions.length === 0 ? (
              <p className="history-message">
                {predictions.length === 0
                  ? "No predictions found yet."
                  : "No matching predictions found. Try another search or filter."}
              </p>
            ) : (
              <div className="history-list">
                {filteredPredictions.map((prediction, index) => (
                  <div className="history-item" key={prediction._id}>
                    <div className="history-number">
                      {predictions.length - index}
                    </div>

                    <div className="history-details">
                      <span className="history-record-title">
                        Student Prediction
                      </span>

                      <span className="history-date">
                        {prediction.createdAt
                          ? new Date(prediction.createdAt).toLocaleString()
                          : "Date unavailable"}
                      </span>
                    </div>

                    <div className="history-grade">
                      <span>Predicted Grade</span>
                      <strong>{prediction.predictedGrade}</strong>
                    </div>

                    {/* HISTORY CONFIDENCE */}
                    {renderConfidence(prediction.probabilities, true)}

                    <button
                      type="button"
                      onClick={() => handleViewDetails(prediction._id)}
                      style={{
                        padding: "9px 14px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#2563eb",
                        color: "#ffffff",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* PREDICTION DETAILS MODAL */}
      {(detailsLoading || detailsError || selectedPrediction) && (
        <div
          onClick={closeDetails}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "16px",
            zIndex: 1000,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="prediction-details-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              background: "#ffffff",
              color: "#1e293b",
              width: "100%",
              maxWidth: "1050px",
              maxHeight: "92vh",
              overflowY: "auto",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              boxSizing: "border-box",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginBottom: "22px",
                paddingBottom: "16px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div>
                <h3
                  id="prediction-details-title"
                  style={{ margin: "0 0 5px", fontSize: "22px" }}
                >
                  Prediction Details
                </h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                  Student performance and model prediction report
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                aria-label="Close prediction details"
                style={{
                  width: "38px",
                  height: "38px",
                  flexShrink: 0,
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  background: "#f1f5f9",
                  color: "#334155",
                  cursor: "pointer",
                  fontSize: "22px",
                }}
              >
                ×
              </button>
            </div>

            {detailsLoading && <p>Loading prediction details...</p>}

            {detailsError && (
              <p role="alert" style={{ color: "#dc2626" }}>
                {detailsError}
              </p>
            )}

            {selectedPrediction && (
              <>
                {/* PREDICTED GRADE SUMMARY */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    flexWrap: "wrap",
                    background: "#eef2ff",
                    border: "1px solid #e0e7ff",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    marginBottom: "22px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: "0 0 5px",
                        color: "#475569",
                        fontSize: "13px",
                      }}
                    >
                      Predicted Grade
                    </p>
                    <strong style={{ fontSize: "34px", color: "#4f46e5" }}>
                      {selectedPrediction.predictedGrade}
                    </strong>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        margin: "0 0 5px",
                        color: "#64748b",
                        fontSize: "12px",
                      }}
                    >
                      Prediction Date
                    </p>
                    <strong style={{ fontSize: "13px" }}>
                      {selectedPrediction.createdAt
                        ? new Date(
                            selectedPrediction.createdAt,
                          ).toLocaleString()
                        : "Date unavailable"}
                    </strong>
                  </div>
                </div>

                {/* SIDE-BY-SIDE CONTENT */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
                    gap: "22px",
                    alignItems: "start",
                  }}
                >
                  {/* LEFT: STUDENT INPUT DETAILS */}
                  <section
                    style={{
                      minWidth: 0,
                      padding: "18px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      background: "#ffffff",
                    }}
                  >
                    <h4 style={{ margin: "0 0 16px", fontSize: "16px" }}>
                      Student Input Details
                    </h4>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(135px, 1fr))",
                        gap: "10px",
                      }}
                    >
                      {Object.entries(selectedPrediction.studentData || {}).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            style={{
                              padding: "12px",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "9px",
                              minWidth: 0,
                              overflowWrap: "anywhere",
                            }}
                          >
                            <div
                              style={{
                                color: "#64748b",
                                fontSize: "12px",
                                marginBottom: "7px",
                              }}
                            >
                              {fieldLabels[key] || key}
                            </div>

                            <strong style={{ fontSize: "14px" }}>
                              {String(value)}
                            </strong>
                          </div>
                        ),
                      )}
                    </div>
                  </section>

                  {/* RIGHT: CONFIDENCE AND PROBABILITIES */}
                  <section
                    style={{
                      minWidth: 0,
                      padding: "18px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      background: "#ffffff",
                    }}
                  >
                    {renderConfidence(selectedPrediction.probabilities)}

                    <div style={{ marginTop: "20px" }}>
                      <h4 style={{ margin: "0 0 18px", fontSize: "16px" }}>
                        Class Probabilities
                      </h4>

                      {selectedPrediction.probabilities &&
                      Object.keys(selectedPrediction.probabilities).length >
                        0 ? (
                        Object.entries(selectedPrediction.probabilities).map(
                          ([grade, probability]) => {
                            const numericProbability = Number(probability);
                            const percentage = Math.min(
                              100,
                              Math.max(
                                0,
                                numericProbability <= 1
                                  ? numericProbability * 100
                                  : numericProbability,
                              ),
                            );

                            return (
                              <div key={grade} style={{ marginBottom: "18px" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: "10px",
                                    marginBottom: "8px",
                                    fontSize: "13px",
                                  }}
                                >
                                  <span>Grade {grade}</span>
                                  <strong>
                                    {formatProbability(probability)}
                                  </strong>
                                </div>

                                <div
                                  style={{
                                    height: "8px",
                                    background: "#e2e8f0",
                                    borderRadius: "20px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${percentage}%`,
                                      height: "100%",
                                      background: "#4f46e5",
                                      borderRadius: "20px",
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          },
                        )
                      ) : (
                        <p style={{ color: "#64748b", fontSize: "13px" }}>
                          Probability details are not available.
                        </p>
                      )}
                    </div>
                  </section>
                </div>

                {/* FOOTER */}
                <div
                  style={{
                    marginTop: "22px",
                    paddingTop: "14px",
                    borderTop: "1px solid #e2e8f0",
                    color: "#64748b",
                    fontSize: "12px",
                    overflowWrap: "anywhere",
                  }}
                >
                  Prediction ID: {selectedPrediction._id}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

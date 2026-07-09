import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <--- Imported for page navigation
import { getSavings } from "../api/api";
import ChartComponent from "../components/ChartComponent";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [savings, setSavings] = useState([]);
  const [reflection, setReflection] = useState("");
  const [pastGratitudes, setPastGratitudes] = useState([]);
  const [numLetters, setNumLetters] = useState("");

  const navigate = useNavigate(); // <--- Initialized navigation controller

  const handleAddLetters = async () => {
    if (!numLetters) return; // Do not submit empty values

    const valueToSubmit = numLetters; // Store value
    setNumLetters(""); // Clear input immediately for better feel

    try {
      await fetch("http://localhost:5000/api/dashboard/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newLetters: valueToSubmit }),
      });
      loadData();
    } catch (err) {
      console.error("Recording error:", err);
      setNumLetters(valueToSubmit); // Restore value if it fails
    }
  };

  const handleResetShift = async () => {
    if (
      window.confirm(
        "Export your data before resetting! Proceed with shift reset?",
      )
    ) {
      try {
        const response = await fetch(
          "http://localhost:5000/api/dashboard/reset-shift",
          {
            method: "POST",
          },
        );

        if (response.ok) {
          alert("Shift Reset Successful!");
          loadData(); // This refreshes the numbers on your screen
        } else {
          alert("Server failed to reset shift.");
        }
      } catch (err) {
        console.error("Reset Error:", err);
      }
    }
  };

  const loadData = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/dashboard/summary",
      );
      if (!response.ok) throw new Error("Failed to fetch dashboard summary");
      const dashData = await response.json();
      const sRes = await getSavings();
      setData(dashData);
      setSavings(sRes.data);
    } catch (error) {
      console.error("Engine Error:", error);
    }
  };

  const fetchGratitudes = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/gratitude");
      if (!res.ok) throw new Error("Failed to fetch gratitude items");
      const gratData = await res.json();

      // Defensively parse array payload whether it arrives directly or nested
      if (Array.isArray(gratData)) {
        setPastGratitudes(gratData);
      } else if (gratData && Array.isArray(gratData.data)) {
        setPastGratitudes(gratData.data);
      } else {
        setPastGratitudes([]);
      }
    } catch (error) {
      console.error("Gratitude Error:", error);
    }
  };

  useEffect(() => {
    loadData();
    fetchGratitudes();
    window.addEventListener("focus", loadData);
    return () => window.removeEventListener("focus", loadData);
  }, []);

  const handleSaveGratitude = async () => {
    if (!reflection.trim()) {
      alert("Reflection cannot be empty.");
      return;
    }

    const valueToSubmit = reflection;
    setReflection(""); // Clear input immediately for an optimal responsive experience

    try {
      const response = await fetch("http://localhost:5000/api/gratitude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reflection: valueToSubmit }),
      });

      if (!response.ok) {
        throw new Error("Server rejected gratitude entry allocation.");
      }

      fetchGratitudes();
    } catch (error) {
      console.error("Save Gratitude Error:", error);
      alert("Failed to save reflection.");
      setReflection(valueToSubmit); // Restores value if the connection fails so data is secure
    }
  };

  if (!data)
    return (
      <div className="p-5 text-center">Initializing Discipline Engine...</div>
    );

  // DATA PREPARATION (Using Backend-Calculated Values)
  const income =
    Number(data.monthlyBudget.salary || 0) +
    Number(data.monthlyBudget.otherIncome || 0);

  const spentByBucket = {
    essentials: data.essentials || 0, // Now dynamic from dashboardController
    discretionary: Number(data.monthlyBudget.schoolSaving || 0),
  };

  // Safe fallback wrapper for mapping operations
  const safeGratitudes = Array.isArray(pastGratitudes) ? pastGratitudes : [];

  return (
    <div className="container mt-4">
      {/* ALERTS SECTION */}
      {data.alerts &&
        data.alerts.map((alert, i) => (
          <div
            key={i}
            className={`alert alert-${alert.type} shadow-sm border-0 mb-3`}
          >
            <strong>
              {alert.type === "danger" ? "🚫" : "⚠️"} Engine Notice:
            </strong>{" "}
            {alert.message}
          </div>
        ))}

      {/* ROW 1: WEALTH SCORE & ALLOCATION SUMMARY */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center p-4 shadow-sm bg-dark text-white border-0 h-100">
            <h6 className="text-uppercase small opacity-75">Wealth Score</h6>
            <h1 className="display-4 fw-bold">{data.wealthScore}</h1>
            <span className="badge bg-primary mt-2">{data.financialStage}</span>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card p-4 shadow-sm border-0 h-100 bg-white">
            <h5>Allocation Summary</h5>
            <div className="row">
              <div className="col-6">
                <small className="text-muted d-block">Monthly Income</small>
                <strong className="fs-5">${income.toLocaleString()}</strong>
              </div>
              <div className="col-6 text-end">
                <small className="text-muted d-block">Essentials</small>
                <strong className="fs-5">
                  ${spentByBucket.essentials.toLocaleString()}
                </strong>
              </div>
            </div>
            <hr />
            <div className="d-flex justify-content-between small mb-1">
              <span>Emergency Target:</span>
              <span>${data.emergencyTarget.toLocaleString()}</span>
            </div>
            <div className="progress" style={{ height: "10px" }}>
              <div
                className="progress-bar bg-info"
                style={{ width: `${data.efCompletionPct}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: SEED VS BREAD */}
      <div className="card p-4 shadow-sm border-0 mb-4">
        <h5>The "Seed vs. Bread" Ratio</h5>
        <div className="progress" style={{ height: "35px" }}>
          <div
            className="progress-bar bg-success"
            style={{ width: `${data.seedRatio}%` }}
          >
            Seed: {data.seedRatio}%
          </div>
          <div
            className="progress-bar bg-danger"
            style={{ width: `${100 - data.seedRatio}%` }}
          >
            Bread: {100 - data.seedRatio}%
          </div>
        </div>
      </div>

      {/* ROW 3: UNIFIED TRACKING & STATS */}
      <div className="row">
        {/* LEFT COLUMN: Tracker & Gratitude Merged */}
        <div className="col-md-6">
          {/* SHIFT PERFORMANCE CARD */}
          <div className="card shadow-sm border-0 mb-4 bg-white overflow-hidden">
            <div
              className={`p-3 bg-${data.shiftStatus.variant} text-white d-flex justify-content-between align-items-center`}
            >
              <h5 className="mb-0">Shift Performance</h5>
              <h4 className="mb-0">{data.shiftStatus.medal}</h4>
            </div>
            <div className="card-body">
              <div className="text-center mb-3">
                <p
                  className={`fw-bold ${data.shiftStatus.variant === "danger" ? "text-danger" : "text-dark"}`}
                >
                  {data.shiftStatus.message}
                </p>

                <div className="row mb-3">
                  <div className="col-6 border-end">
                    <small className="text-muted d-block">Shift Progress</small>
                    <h5>
                      Day {data.shiftStatus.shiftDay} /{" "}
                      {data.shiftStatus.totalDaysInShift}
                    </h5>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Letters Done</small>
                    <h5>{data.monthlyBudget.shiftLetters} /817</h5>
                  </div>
                </div>

                {/* PACING INNER WIDGET */}
                <div className="row text-center border-top pt-3 bg-light rounded mx-0 p-2 border">
                  <div className="col-6 border-end">
                    <small className="text-muted d-block">Required Today</small>
                    <strong className="h4 fw-bold text-dark">
                      {data.shiftStatus.chunkPacingTarget > 0
                        ? data.shiftStatus.chunkPacingTarget
                        : 0}
                    </strong>
                    <small className="text-muted d-block small">
                      Letters / Day
                    </small>
                  </div>
                  <div className="col-6 d-flex flex-column justify-content-center align-items-center">
                    <small className="text-muted d-block mb-1">
                      Active Window
                    </small>
                    <span
                      className={`badge ${data.shiftStatus.isShift1 ? "bg-warning text-dark" : "bg-info text-white"} fw-bold`}
                    >
                      {data.shiftStatus.isShift1
                        ? "Shift 1 (1st - 15th)"
                        : "Shift 2 (16th - End)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* PROJECTED EARNINGS SECTION */}
              <div className="mt-3 p-3 bg-light rounded border mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted d-block">Projected Pay</small>
                    <h4 className="mb-0 text-success">
                      {data.shiftStatus.projectedPay.toLocaleString()} FRW
                    </h4>
                  </div>
                  {data.shiftStatus.potentialLoss > 0 && (
                    <div className="text-end">
                      <small className="text-danger d-block">
                        Unreached Earnings
                      </small>
                      <span className="badge bg-danger">
                        -{data.shiftStatus.potentialLoss.toLocaleString()} FRW
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="input-group mb-3">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Letters worked..."
                  value={numLetters}
                  onChange={(e) => setNumLetters(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddLetters()}
                />
                <button className="btn btn-dark" onClick={handleAddLetters}>
                  Record
                </button>
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary btn-sm flex-grow-1"
                  onClick={() => {
                    const row = `Date,ShiftLetters,TotalMonthlyLetters\n${new Date().toLocaleDateString()},${data.monthlyBudget.shiftLetters},${data.monthlyBudget.translatedLetters}`;
                    const blob = new Blob([row], { type: "text/csv" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `Shift_Report_${new Date().toLocaleDateString()}.csv`;
                    a.click();
                  }}
                >
                  Export CSV
                </button>

                {data.shiftStatus.isLastDay && (
                  <button
                    className="btn btn-danger btn-sm flex-grow-1"
                    onClick={handleResetShift}
                  >
                    Reset Shift
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* GRATITUDE SECTION WITH NAVIGATE LINK */}
          <div className="card shadow-sm p-4 border-0 mb-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">Daily Gratitude</h5>
              <button
                className="btn btn-outline-primary btn-sm fw-bold"
                onClick={() => navigate("/gratitude-history")}
              >
                📜 View History
              </button>
            </div>
            <textarea
              className="form-control border-0 shadow-sm mb-2 bg-light"
              placeholder="Today, I am grateful for..."
              rows="2"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
            ></textarea>
            <button
              className="btn btn-primary btn-sm w-100"
              onClick={handleSaveGratitude}
            >
              Save Reflection
            </button>

            <div className="mt-3">
              <small className="text-muted d-block mb-2">
                Recent Reflections:
              </small>
              <ul className="list-group list-group-flush small">
                {safeGratitudes.slice(0, 3).map((g, i) => (
                  <li
                    key={i}
                    className="list-group-item px-0 bg-transparent border-light"
                  >
                    " {g.reflection} "
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Savings & Charts */}
        <div className="col-md-6">
          <div className="card p-4 shadow-sm border-0 mb-4">
            <div className="d-flex justify-content-between">
              <div>
                <small className="text-muted">Balance</small>
                <h4
                  className={
                    data.monthlyBudget.balance < 0
                      ? "text-danger"
                      : "text-success"
                  }
                >
                  ${Number(data.monthlyBudget.balance).toLocaleString()}
                </h4>
              </div>
              <div>
                <small className="text-muted">Investment</small>
                <h4 className="text-primary">
                  ${Number(data.monthlyBudget.investment).toLocaleString()}
                </h4>
              </div>
            </div>
          </div>
          <div className="card p-4 shadow-sm border-0">
            <h5>Savings Progress</h5>
            <ChartComponent
              data={savings}
              xKey="goalName"
              yKey="progress"
              color="#0d6efd"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

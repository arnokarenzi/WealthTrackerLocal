import React, { useState, useEffect } from "react";
import { getSavings } from "../api/api";

const SavingsGoals = () => {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const loadGoals = async () => {
      const { data } = await getSavings();
      setGoals(data);
    };
    loadGoals();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Savings Goals</h2>
      <table className="table table-bordered mt-3 shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Goal Name</th>
            <th>Target (RWF)</th>
            <th>Saved (RWF)</th>
            <th>Progress %</th>
          </tr>
        </thead>
        <tbody>
          {goals.map((g) => (
            <tr key={g.id}>
              <td>{g.goalName}</td>
              <td>{Number(g.targetAmount).toLocaleString()}</td>
              <td>{Number(g.currentSaved).toLocaleString()}</td>
              <td>
                <div className="d-flex align-items-center">
                  <span className="me-2">{Number(g.progress).toFixed(1)}%</span>
                  <div className="progress w-100" style={{ height: "6px" }}>
                    <div
                      className="progress-bar bg-success"
                      style={{ width: `${Math.min(g.progress, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SavingsGoals;

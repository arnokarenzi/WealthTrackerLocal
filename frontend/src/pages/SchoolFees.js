import React, { useState, useEffect } from "react";
import axios from "axios";

const SchoolFees = () => {
  const [fees, setFees] = useState([]);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/school-fees");
      setFees(response.data);
    } catch (error) {
      console.error("Error fetching school fees:", error);
    }
  };

  const handleResetFees = async () => {
    const confirmReset = window.confirm(
      "Are you sure you want to clear your school fees history and reset the buffer goal to 0%? This will not affect your budget or other goals.",
    );

    if (confirmReset) {
      try {
        await axios.post("http://localhost:5000/api/school-fees/reset-fees");
        alert("School fees have been reset successfully.");
        fetchFees(); // Refresh the table
      } catch (error) {
        alert("Failed to reset school fees.");
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>School Fees Tracking</h2>
        <button className="btn btn-warning" onClick={handleResetFees}>
          Reset School Fees Only
        </button>
      </div>

      <table className="table table-bordered shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Month</th>
            <th>Amount Saved</th>
            <th>Cumulative Total</th>
          </tr>
        </thead>
        <tbody>
          {fees.length > 0 ? (
            fees.map((item) => (
              <tr key={item.id}>
                <td>{item.month}</td>
                <td>${item.amountSaved}</td>
                <td>${item.cumulative}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center text-muted">
                No school fees history found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SchoolFees;

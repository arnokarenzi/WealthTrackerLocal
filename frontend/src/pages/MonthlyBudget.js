import React, { useState, useEffect } from "react";
import axios from "axios";

const MonthlyBudget = () => {
  const [budget, setBudget] = useState({
    id: 1,
    salary: 0,
    otherIncome: 0,
    rent: 0,
    schoolSaving: 0,
    phoneInternet: 0,
    electricityWater: 0,
    food: 0,
    miscellaneous: 0,
    medical: 0,
    familySupport: 0,
    emergencyFund: 0,
    investment: 0, // Using investment for Business Capital
    month: 1,
    year: 2026,
    balance: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/budget");
      if (response.data) {
        setBudget(response.data);
      }
    } catch (error) {
      console.error("Error fetching budget:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBudget({ ...budget, [name]: value });
  };

  // Real-time calculation logic
  const calculateTotals = () => {
    const totalIncome = Number(budget.salary) + Number(budget.otherIncome);
    const totalExpenses =
      Number(budget.rent) +
      Number(budget.schoolSaving) +
      Number(budget.phoneInternet) +
      Number(budget.electricityWater) +
      Number(budget.food) +
      Number(budget.miscellaneous) +
      Number(budget.medical) +
      Number(budget.familySupport) +
      Number(budget.emergencyFund) +
      Number(budget.investment);

    return {
      totalIncome,
      totalExpenses,
      liveBalance: totalIncome - totalExpenses,
    };
  };

  const { totalIncome, totalExpenses, liveBalance } = calculateTotals();

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put("http://localhost:5000/api/budget", budget);
      alert("Budget updated successfully!");
      fetchData(); // Refresh to get the balance from server
    } catch (error) {
      alert("Failed to save budget.");
    }
  };

  const handleInitialize = async () => {
    const confirmFirst = window.confirm(
      "Are you absolutely sure? This will delete ALL expenses, ALL school fees history, and reset ALL savings goals.",
    );
    if (confirmFirst) {
      const confirmSecond = window.confirm(
        "This action cannot be undone. Do you wish to proceed with initialization?",
      );
      if (confirmSecond) {
        try {
          await axios.post("http://localhost:5000/api/budget/initialize");
          alert("Project has been reset to starting values.");
          window.location.reload(); // Refresh the page to show zeros
        } catch (error) {
          alert("Initialization failed.");
        }
      }
    }
  };

  // REPLACE your current resetMonth function with this:

  const handleReset = async () => {
    const confirmReset = window.confirm(
      "Would you like to save a CSV copy of this month's allocations and balance before resetting?",
    );

    if (confirmReset) {
      // 1. Safety Math: Convert strings to actual numbers
      const rent = Number(budget.rent || 0);
      const phone = Number(budget.phoneInternet || 0);
      const utils = Number(budget.electricityWater || 0);
      const food = Number(budget.food || 0);
      const medical = Number(budget.medical || 0);
      const family = Number(budget.familySupport || 0);
      const misc = Number(budget.miscellaneous || 0);

      // Sum them up properly
      const totalEssentials =
        rent + phone + utils + food + medical + family + misc;

      // Other categories
      const emergency = Number(budget.emergencyFund || 0);
      const invest = Number(budget.investment || 0);
      const savings = Number(budget.schoolSaving || 0);
      const finalBalance = Number(budget.balance || 0);
      const totalIncome =
        Number(budget.salary || 0) + Number(budget.otherIncome || 0);

      // 2. Prepare CSV Content with Clean Numbers
      const headers = "Category,Amount\n";
      const rows = [
        `Essentials Total,${totalEssentials.toFixed(2)}`,
        `Emergency Fund,${emergency.toFixed(2)}`,
        `Investment,${invest.toFixed(2)}`,
        `School/Discretionary,${savings.toFixed(2)}`,
        `Final Remaining Balance,${finalBalance.toFixed(2)}`,
        `Total Income,${totalIncome.toFixed(2)}`,
      ].join("\n");

      const csvContent = headers + rows;

      // 3. Trigger Download
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Monthly_Report_${budget.month}_${budget.year}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      // 4. Proceed to Backend Reset
      try {
        const res = await axios.post("http://localhost:5000/api/budget/reset");
        alert(res.data.message);
        fetchData();
      } catch (err) {
        alert("Reset failed: " + err.message);
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Monthly Budget Planning</h2>
        <button className="btn btn-outline-danger" onClick={handleReset}>
          Reset Month
        </button>
        <button className="btn btn-danger" onClick={handleInitialize}>
          Initialize Project
        </button>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <form onSubmit={handleSave} className="card p-4 shadow-sm">
            <div className="row g-3">
              <h5 className="border-bottom pb-2">Income</h5>
              <div className="col-md-6">
                <label className="form-label">Salary</label>
                <input
                  type="number"
                  name="salary"
                  className="form-control"
                  value={budget.salary}
                  disabled
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Other Income</label>
                <input
                  type="number"
                  name="otherIncome"
                  className="form-control"
                  value={budget.otherIncome}
                  onChange={handleChange}
                />
              </div>

              <h5 className="border-bottom pb-2 mt-4">
                Fixed & Variable Expenses
              </h5>
              <div className="col-md-4">
                <label className="form-label">Rent</label>
                <input
                  type="number"
                  name="rent"
                  className="form-control"
                  value={budget.rent}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">School Saving</label>
                <input
                  type="number"
                  name="schoolSaving"
                  className="form-control"
                  value={budget.schoolSaving}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Food</label>
                <input
                  type="number"
                  name="food"
                  className="form-control"
                  value={budget.food}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Miscellaneous</label>
                <input
                  title="This field is updated automatically from the Expenses page."
                  type="number"
                  name="miscellaneous"
                  className="form-control"
                  value={budget.miscellaneous} // Using 'miscellaneous' for transport
                  disabled
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Business Capital (Investment)
                </label>
                <input
                  type="number"
                  name="investment"
                  className="form-control"
                  value={budget.investment}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Emergency Fund</label>
                <input
                  type="number"
                  name="emergencyFund"
                  className="form-control"
                  value={budget.emergencyFund}
                  onChange={handleChange}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-4 py-2">
              Save Budget Plan
            </button>
          </form>
        </div>

        <div className="col-lg-4 mt-4 mt-lg-0">
          <div
            className="card p-4 bg-light shadow-sm sticky-top"
            style={{ top: "20px" }}
          >
            <h4>Budget Summary</h4>
            <hr />
            <div className="d-flex justify-content-between mb-2">
              <span>Planned Income:</span>
              <span className="text-success font-weight-bold">
                ${totalIncome}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Planned Expenses:</span>
              <span className="text-danger font-weight-bold">
                ${totalExpenses}
              </span>
            </div>
            <hr />
            <div className="text-center">
              <h6>Remaining Balance</h6>
              <h2 className={liveBalance >= 0 ? "text-primary" : "text-danger"}>
                ${liveBalance}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyBudget;

import React, { useState, useEffect } from "react";
import { getExpenses, addExpense, deleteExpense } from "../api/api";

const DailyExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  // 1. Initialize with empty strings to fix the "Uncontrolled" warning
  const [form, setForm] = useState({
    expenseDate: new Date().toISOString().split("T")[0],
    description: "",
    category: "",
    amount: "",
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    const { data } = await getExpenses();
    setExpenses(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addExpense(form);

      alert("Expense added successfully!");

      // Optional: Reset form here
      setForm({
        expenseDate: new Date().toISOString().split("T")[0],
        description: "",
        category: "",
        amount: "",
      });
    } catch (err) {
      console.error("Submit Error:", err);
      // This will show your specific backend error (like the Investment Lock message)
      alert("Error: " + err.message);
    }
  };

  const exportToCSV = () => {
    const headers = "Date,Description,Category,Amount\n";
    const rows = expenses
      .map((e) => `${e.expenseDate},${e.description},${e.category},${e.amount}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();
  };

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2>Daily Expenses</h2>
        <button className="btn btn-success" onClick={exportToCSV}>
          Export CSV
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="row g-3 my-4 p-3 bg-light border rounded"
      >
        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={form.expenseDate}
            onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
            required
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={form.category} // Use category to track the selection
            onChange={(e) => {
              const selectedText =
                e.target.options[e.target.selectedIndex].text;
              setForm({
                ...form,
                category: e.target.value, // DB Column Name: e.g. "electricityWater"
                description: selectedText, // Human Label: e.g. "Electricity & Water"
              });
            }}
            required
          >
            <option value="">Select Category...</option>
            <option value="phoneInternet">Phone & Internet</option>
            <option value="electricityWater">Electricity & Water</option>
            <option value="medical">Medical</option>
            <option value="familySupport">Family Support</option>
            {/* Use 'miscellaneous' or 'transport' based on your SQL rename */}
            <option value="miscellaneous">Miscellaneous</option>
          </select>
        </div>
        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary w-100">Add</button>
        </div>
      </form>

      <table className="table table-striped shadow-sm">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id}>
              <td>{new Date(e.expenseDate).toLocaleDateString()}</td>
              <td>{e.description}</td>
              <td>${e.amount}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={async () => {
                    await deleteExpense(e.id);
                    loadExpenses();
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="table-info">
            <td colSpan="2">
              <strong>Total</strong>
            </td>
            <td colSpan="2">
              <strong>${total}</strong>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default DailyExpenses;

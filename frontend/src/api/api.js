import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

export const getBudget = () => API.get("/budget");
export const updateBudget = (data) => API.put("/budget", data);
export const getExpenses = () => API.get("/expenses");
// src/api/api.js

export const addExpense = async (formData) => {
  const response = await fetch("http://localhost:5000/api/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "Server Error");
  }
  return data;
};
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);
export const getSavings = () => API.get("/savings");
export const updateSaving = (id, data) => API.put(`/savings/${id}`, data);
export const resetMonth = () => API.post("/budget/reset");

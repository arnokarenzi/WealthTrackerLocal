import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import MonthlyBudget from "./pages/MonthlyBudget";
import DailyExpenses from "./pages/DailyExpenses";
import SchoolFees from "./pages/SchoolFees";
import SavingsGoals from "./pages/SavingsGoals";
import AllocationPlanner from "./pages/AllocationPlanner";

// Main Application Component
function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Header />

        <main className="flex-grow-1 container py-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/budget" element={<MonthlyBudget />} />
            <Route path="/expenses" element={<DailyExpenses />} />
            <Route path="/school-fees" element={<SchoolFees />} />
            <Route path="/savings" element={<SavingsGoals />} />
            <Route path="/allocations" element={<AllocationPlanner />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;

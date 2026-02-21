import React from "react";
import { Link } from "react-router-dom";

const Header = () => (
  <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4 shadow">
    <Link className="navbar-brand font-weight-bold" to="/">
      Personal Finance Tracker
    </Link>
    <div className="navbar-nav ml-auto">
      <Link className="nav-link text-white" to="/">
        Dashboard
      </Link>
      <Link className="nav-link text-white" to="/budget">
        Budget
      </Link>
      <Link className="nav-link text-white" to="/expenses">
        Expenses
      </Link>
      <Link className="nav-link text-white" to="/school-fees">
        School Fees
      </Link>
      <Link className="nav-link text-white" to="/savings">
        Savings
      </Link>
      <Link className="nav-link text-white" to="/allocations">
        Allocations
      </Link>
    </div>
  </nav>
);

export default Header;

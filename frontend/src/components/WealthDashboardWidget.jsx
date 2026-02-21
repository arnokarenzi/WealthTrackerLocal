import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7f50",
  "#0088FE",
  "#00C49F",
];

// A small helper to reduce pie data to chart-friendly form
function buildPie(recommended, spentByBucket) {
  // We'll show two groups: recommended (Essentials, Emergency, Invest, Discretionary) and actual spending (Essentials, Discretionary)
  const data = [
    { name: "Essentials (rec)", value: recommended.essentials },
    { name: "Invest (rec)", value: recommended.invest },
    { name: "Discretionary (rec)", value: recommended.discretionary },
    { name: "Essentials (act)", value: spentByBucket.essentials },
    { name: "Discretionary (act)", value: spentByBucket.discretionary },
  ];
  return data.filter((d) => d.value > 0);
}

export default function WealthDashboardWidget() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/dashboard/summary",
      );
      setSummary(res.data);
    } catch (err) {
      console.error("Failed to load dashboard summary", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // optionally poll every minute: const id = setInterval(load, 60*1000); return () => clearInterval(id);
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!summary) return <div>No dashboard data</div>;

  const {
    income,
    recommended,
    spentByBucket,
    emergencyFund,
    monthlyEssentials,
    pieData,
  } = summary;
  const pctCompleted =
    emergencyFund && emergencyFund.target_amount > 0
      ? Math.round(
          (emergencyFund.current_amount / emergencyFund.target_amount) * 100,
        )
      : 0;

  const pie = buildPie(recommended, spentByBucket);

  return (
    <div className="container mt-3">
      <div className="row g-3">
        {/* Allocation summary card */}
        <div className="col-md-4">
          <div className="card p-3 h-100">
            <h5>Allocation Summary</h5>
            <div>
              <strong>Income:</strong> ${Number(income).toLocaleString()}
            </div>
            <hr />
            <div>
              <strong>Essentials:</strong> $
              {recommended.essentials.toLocaleString()} (
              {recommended.template.essentials_pct}%)
            </div>
            <div>
              <strong>Emergency:</strong> $
              {recommended.emergency.toLocaleString()} (
              {recommended.template.emergency_pct}%)
            </div>
            <div>
              <strong>Invest:</strong> ${recommended.invest.toLocaleString()} (
              {recommended.template.invest_pct}%)
            </div>
            <div>
              <strong>Discretionary:</strong> $
              {recommended.discretionary.toLocaleString()} (
              {recommended.template.discretionary_pct}%)
            </div>
          </div>
        </div>

        {/* Emergency progress */}
        <div className="col-md-4">
          <div className="card p-3 h-100">
            <h5>Stability (Emergency) Fund</h5>
            <div>
              Target: $
              {Number(emergencyFund.target_amount || 0).toLocaleString()}
            </div>
            <div>
              Current: $
              {Number(emergencyFund.current_amount || 0).toLocaleString()}
            </div>
            <div>
              Months target uses annualized essentials:{" "}
              {monthlyEssentials
                ? Math.round(emergencyFund.target_amount / monthlyEssentials)
                : "—"}
            </div>
            <div className="progress my-2" style={{ height: "26px" }}>
              <div
                className={`progress-bar ${pctCompleted >= 100 ? "bg-success" : "bg-info"}`}
                role="progressbar"
                style={{ width: `${Math.min(pctCompleted, 100)}%` }}
              >
                {Math.round(pctCompleted)}%
              </div>
            </div>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => {
                // quick contribute prompt
                const amt = parseFloat(prompt("Enter contribution amount"));
                if (!amt || isNaN(amt)) return;
                axios
                  .post("http://localhost:5000/api/emergency/contribute", {
                    amount: amt,
                  })
                  .then(() => load())
                  .catch((err) => alert("Error: " + err.message));
              }}
            >
              Contribute
            </button>

            <div className="mt-2">
              <button
                className="btn btn-sm btn-secondary me-2"
                onClick={() => {
                  // open the sync endpoint to detect existing stability savings and merge them
                  if (
                    !window.confirm(
                      "This will attempt to merge existing stability savings into the emergency fund. Continue?",
                    )
                  )
                    return;
                  axios
                    .post("http://localhost:5000/api/dashboard/emergency/sync")
                    .then(() => load())
                    .catch((err) => alert("Sync failed: " + err.message));
                }}
              >
                Sync stability savings
              </button>
            </div>
          </div>
        </div>

        {/* Pie chart */}
        <div className="col-md-4">
          <div className="card p-3 h-100">
            <h5>Allocation vs Actual Spending</h5>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                  >
                    {pie.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `$${Number(value).toLocaleString()}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <small className="text-muted">
              Blue/Green = recommended allocation; grey = actual spending
              (Essentials / Discretionary)
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

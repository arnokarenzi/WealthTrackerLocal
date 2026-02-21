// components/Dashboard.jsx
// Ready-to-paste ES module React component (frontend dashboard)
// Uses fetch to call GET /api/dashboard?month=MM&year=YYYY
// Expects the backend controller response shape exactly as produced above.

import React, { useEffect, useState } from "react";

export default function Dashboard({ month, year }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default to current month/year if not provided
  const now = new Date();
  const qMonth = month ?? String(now.getMonth() + 1);
  const qYear = year ?? String(now.getFullYear());

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch(
          `/api/dashboard?month=${encodeURIComponent(qMonth)}&year=${encodeURIComponent(qYear)}`,
        );
        if (!res.ok) {
          const err = await res
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(err.error || "Failed to fetch dashboard");
        }
        const json = await res.json();
        if (mounted) {
          setData(json);
        }
      } catch (e) {
        if (mounted) setError(e.message || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [qMonth, qYear]);

  if (loading) return <div>Loading dashboard…</div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;
  if (!data) return null;

  const { monthlyBudget, wealthScore, alerts, financialStage, analytics } =
    data;

  return (
    <div className="container my-3">
      <div className="row g-3">
        {/* Wealth Score Card */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Wealth Score</h5>
              <h1 className="display-4">{wealthScore}</h1>
              <p className="card-text mb-1">
                <strong>Stage:</strong> {financialStage}
              </p>
              <p className="card-text text-muted small">
                Emergency completion: {analytics.emergencyCompletionPct}% •
                Essentials: {analytics.essentials} • Target:{" "}
                {analytics.emergencyTarget}
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">
                Monthly Summary — {monthlyBudget.month}/{monthlyBudget.year}
              </h5>

              <div className="row">
                <div className="col-sm-6">
                  <dl className="row">
                    <dt className="col-6">Salary</dt>
                    <dd className="col-6">{monthlyBudget.salary}</dd>
                    <dt className="col-6">Other Income</dt>
                    <dd className="col-6">{monthlyBudget.otherIncome}</dd>
                    <dt className="col-6">Investment</dt>
                    <dd className="col-6">{monthlyBudget.investment}</dd>
                    <dt className="col-6">Emergency Fund</dt>
                    <dd className="col-6">{monthlyBudget.emergencyFund}</dd>
                    <dt className="col-6">Balance</dt>
                    <dd className="col-6">{monthlyBudget.balance}</dd>
                  </dl>
                </div>
                <div className="col-sm-6">
                  <dl className="row">
                    <dt className="col-6">Rent</dt>
                    <dd className="col-6">{monthlyBudget.rent}</dd>
                    <dt className="col-6">Food</dt>
                    <dd className="col-6">{monthlyBudget.food}</dd>
                    <dt className="col-6">Miscellaneous</dt>
                    <dd className="col-6">{monthlyBudget.miscellaneous}</dd>
                    <dt className="col-6">Medical</dt>
                    <dd className="col-6">{monthlyBudget.medical}</dd>
                    <dt className="col-6">School Saving</dt>
                    <dd className="col-6">{monthlyBudget.schoolSaving}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="col-12">
          {alerts && alerts.length > 0 ? (
            alerts.map((a, idx) => {
              const cls =
                a.type === "danger"
                  ? "alert-danger"
                  : a.type === "warning"
                    ? "alert-warning"
                    : "alert-info";
              return (
                <div
                  className={`alert ${cls} d-flex align-items-start`}
                  role="alert"
                  key={idx}
                >
                  <div>
                    <strong style={{ textTransform: "capitalize" }}>
                      {a.type}
                    </strong>
                    <div>{a.message}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="alert alert-success">No alerts for this month.</div>
          )}
        </div>

        {/* Analytics Breakdown */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6>Score Breakdown</h6>
              <ul className="list-unstyled mb-0">
                <li>Emergency: {analytics.components.emergencyScore}</li>
                <li>Investment: {analytics.components.investScore}</li>
                <li>Discipline: {analytics.components.disciplineScore}</li>
                <li>
                  Essentials Efficiency: {analytics.components.essentialScore}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions / Hints */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6>Recommended Focus</h6>
              <p className="mb-0">
                {analytics.emergencyCompletionPct < 50 && (
                  <span>
                    Priority: Build your emergency fund to at least 50% of the
                    5× essentials target.
                  </span>
                )}
                {analytics.emergencyCompletionPct >= 50 &&
                  analytics.emergencyCompletionPct < 100 && (
                    <span>
                      Stability Phase — continue building emergency fund and
                      control essentials.
                    </span>
                  )}
                {analytics.emergencyCompletionPct >= 100 &&
                  wealthScore > 80 && (
                    <span>
                      You're in Wealth Builder mode — consider strategic
                      investing.
                    </span>
                  )}
                {analytics.emergencyCompletionPct >= 100 &&
                  wealthScore <= 80 && (
                    <span>
                      Emergency covered — focus on disciplined investing to
                      improve wealth score.
                    </span>
                  )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AllocationPlanner() {
  const [template, setTemplate] = useState({
    essentials_pct: 50,
    emergency_pct: 15,
    invest_pct: 25,
    discretionary_pct: 10,
  });

  const [income, setIncome] = useState(0);

  useEffect(() => {
    const load = async () => {
      const budget = await axios.get("http://localhost:5000/api/budget");
      const total =
        Number(budget.data.salary || 0) + Number(budget.data.otherIncome || 0);

      setIncome(total);

      const t = await axios.get("http://localhost:5000/api/allocations");
      if (t.data) setTemplate(t.data);
    };
    load();
  }, []);

  const save = async () => {
    await axios.put("http://localhost:5000/api/allocations", template);
    alert("Saved!");
  };

  const apply = async () => {
    await axios.post("http://localhost:5000/api/allocations/apply", template);
    alert("Applied to this month!");
  };

  const calc = (pct) => ((income * pct) / 100).toFixed(2);

  const totalPct =
    Number(template.essentials_pct || 0) +
    Number(template.emergency_pct || 0) +
    Number(template.invest_pct || 0) +
    Number(template.discretionary_pct || 0);

  const getBarColor = () => {
    if (totalPct === 100) return "bg-success";
    if (totalPct > 100) return "bg-danger";
    return "bg-info";
  };

  return (
    <div className="container mt-4">
      <h2>Allocation Planner</h2>
      <p>Monthly Income: ${income}</p>

      {["essentials", "emergency", "invest", "discretionary"].map((k) => (
        <div key={k} className="mb-3">
          <label>{k} %</label>
          <div className="card p-4 shadow-sm border-0 mb-4 bg-light">
            <h5>Allocation Strategy Status</h5>
            <div className="d-flex justify-content-between mb-1">
              <span className="small fw-bold">
                Total Allocated: {totalPct}%
              </span>
              <span className="small text-muted">
                {100 - totalPct}% remaining
              </span>
            </div>
            <div className="progress" style={{ height: "20px" }}>
              <div
                className={`progress-bar progress-bar-striped progress-bar-animated ${getBarColor()}`}
                style={{ width: `${Math.min(totalPct, 100)}%` }}
              ></div>
            </div>
            {totalPct !== 100 && (
              <small className="text-danger mt-2 d-block">
                * Total must equal 100% to save or apply.
              </small>
            )}
          </div>
          <input
            type="number"
            className="form-control"
            value={template[`${k}_pct`]}
            onChange={(e) =>
              setTemplate({
                ...template,
                [`${k}_pct`]: Number(e.target.value),
              })
            }
          />
          <small>Recommended: ${calc(template[`${k}_pct`])}</small>
        </div>
      ))}

      <div className="d-flex gap-2 mt-4">
        <button
          className="btn btn-outline-primary flex-grow-1"
          onClick={save}
          disabled={totalPct !== 100}
        >
          Save Strategy Template
        </button>
        <button
          className="btn btn-success flex-grow-1"
          onClick={apply}
          disabled={totalPct !== 100}
        >
          Apply to This Month
        </button>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function EmergencyFund() {
  const [fund, setFund] = useState(null);
  const [amount, setAmount] = useState(0);

  const load = async () => {
    const res = await axios.get("http://localhost:5000/api/emergency");
    setFund(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const contribute = async () => {
    await axios.post("http://localhost:5000/api/emergency/contribute", {
      amount,
    });
    load();
  };

  if (!fund) return null;

  const pct =
    fund.target_amount > 0
      ? Math.round((fund.current_amount / fund.target_amount) * 100)
      : 0;

  return (
    <div className="container mt-4">
      <h2>Emergency Fund</h2>

      <p>Current: ${fund.current_amount}</p>
      <p>Target: ${fund.target_amount}</p>

      <div className="progress mb-3">
        <div className="progress-bar" style={{ width: `${pct}%` }}>
          {pct}%
        </div>
      </div>

      <input
        type="number"
        className="form-control mb-2"
        placeholder="Contribution amount"
        onChange={(e) => setAmount(Number(e.target.value))}
      />

      <button className="btn btn-primary" onClick={contribute}>
        Contribute
      </button>
    </div>
  );
}

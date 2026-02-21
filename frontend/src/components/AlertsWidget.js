import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AlertsWidget() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get("http://localhost:5000/api/alerts");
      setAlerts(res.data.alerts);
    };
    load();
  }, []);

  return (
    <div className="card p-3 mt-3">
      <h5>Alerts</h5>
      {alerts.length === 0 && <p>No alerts 🎉</p>}
      {alerts.map((a, i) => (
        <div
          key={i}
          className={`alert ${
            a.level === "critical" ? "alert-danger" : "alert-warning"
          }`}
        >
          {a.message}
        </div>
      ))}
    </div>
  );
}

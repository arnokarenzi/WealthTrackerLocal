import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GratitudeHistory = () => {
  const [gratitudes, setGratitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAllGratitudes = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/gratitude");
      if (!res.ok)
        throw new Error("Failed to load historical gratitude entries.");
      const data = await res.json();

      if (Array.isArray(data)) {
        setGratitudes(data);
      } else if (data && Array.isArray(data.data)) {
        setGratitudes(data.data);
      } else {
        setGratitudes([]);
      }
    } catch (error) {
      console.error("Fetch History Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this gratitude record?",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/gratitude/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Server rejected request to remove log entry.");
      }

      // Automatically reload the dataset to update the UI
      fetchAllGratitudes();
    } catch (error) {
      console.error("Delete Action Error:", error);
      alert("Failed to delete the record. Please try again.");
    }
  };

  useEffect(() => {
    fetchAllGratitudes();
  }, []);

  const formatTimestamp = (isoString) => {
    if (!isoString) return "Date Unknown";
    const dateObj = new Date(isoString);
    return dateObj.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            📜 Gratitude History Archive
          </h2>
          <p className="text-muted mb-0">
            A comprehensive record of your historic anchors and reflections.
          </p>
        </div>
        <button
          className="btn btn-dark btn-sm px-3"
          onClick={() => navigate("/")}
        >
          ← Back to Dashboard
        </button>
      </div>

      {loading ? (
        <div className="text-center p-5 text-muted">
          Retrieving historical records...
        </div>
      ) : gratitudes.length === 0 ? (
        <div className="card text-center p-5 shadow-sm bg-white border-0">
          <h5 className="text-muted mb-0">
            No reflections have been logged to the archive database yet.
          </h5>
        </div>
      ) : (
        <div className="row">
          {gratitudes.map((g) => (
            <div key={g.id} className="col-12 mb-3">
              <div className="card shadow-sm border-0 bg-white">
                <div className="card-body d-flex justify-content-between align-items-center p-3">
                  <div style={{ flex: 1, paddingRight: "20px" }}>
                    <small className="text-primary fw-bold d-block mb-1">
                      📅 {formatTimestamp(g.created_at || g.createdAt)}
                    </small>
                    <p
                      className="mb-0 text-dark font-italic fs-5"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      "{g.reflection}"
                    </p>
                  </div>
                  <div>
                    <button
                      className="btn btn-outline-danger btn-sm px-3 fw-bold"
                      onClick={() => handleDelete(g.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GratitudeHistory;

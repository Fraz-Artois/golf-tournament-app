// ✅ all imports must be at the very top
import React, { useEffect, useState } from "react";
import "./Round1.css";

export default function Round1() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [standings, setStandings] = useState([]);
  const [strokes, setStrokes] = useState([]);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/round1")
      .then((r) => r.json())
      .then((json) => {
        if (json.status === "success") {
          setStandings(json.standings || []);
          setStrokes(json.strokes || []);
          setPoints(json.points || []);
        } else {
          setError(json.message || "Failed to load data");
        }
      })
      .catch((e) => setError(e.message || "Network error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading Round 1…</div>;
  if (error) return <div className="error">Error: {error}</div>;

  // ✅ helper to render tables (no more duplicate "Hole" row)
  const renderTableFromRows = (rows) => {
    if (!rows || !rows.length) return <div className="empty">No data</div>;

    return (
      <div className="table-block">
        <table>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((cell, j) => (
                  <td key={j} className={i === 0 ? "header-cell" : ""}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="round-container">
      <h1 className="round-title">🏌️ Round 1</h1>

      <section className="section">
        <h2>Tournament Standings</h2>
        {renderTableFromRows(standings)}
      </section>

      <section className="section">
        <h2>Round 1 — Strokes</h2>
        {renderTableFromRows(strokes)}
      </section>

      <section className="section">
        <h2>Round 1 — Stableford Points</h2>
        {renderTableFromRows(points)}
      </section>
    </div>
  );
}

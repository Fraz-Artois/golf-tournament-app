import React, { useEffect, useState } from "react";
import "./Round1.css";

export default function Round3() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [standings, setStandings] = useState([]);
  const [strokes, setStrokes] = useState([]);
  const [points, setPoints] = useState([]);
  const [overall, setOverall] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/round3")
      .then((r) => r.json())
      .then((json) => {
        if (json.status === "success") {
          setStandings(json.standings || []);
          setStrokes(json.strokes || []);
          setPoints(json.points || []);
          setOverall(json.overall || []);
        } else {
          setError(json.message || "Failed to load data");
        }
      })
      .catch((e) => setError(e.message || "Network error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading Round 3…</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const renderTableFromRows = (rows) => {
    if (!rows || !rows.length) return <div className="empty">No data</div>;

    const upArrow = "⬆";
    const downArrow = "⬇";

    return (
      <div className="table-block">
        <table>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((cell, j) => {
                  const value = String(cell).trim();

                  let cellClass = "";

                  if (i === 0) {
                    cellClass = "header-cell";
                  } else if (value.includes(upArrow) && !value.includes(downArrow)) {
                    cellClass = "arrow-up";
                  } else if (value.includes(downArrow) && !value.includes(upArrow)) {
                    cellClass = "arrow-down";
                  } else if (value.includes(upArrow) && value.includes(downArrow)) {
                    cellClass = "arrow-same";
                  } else if (value.includes("-") || value.includes("–")) {
                    cellClass = "arrow-same";
                  }

                  return (
                    <td key={j} className={cellClass}>
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="round-container">
      <h1 className="round-title">🏌️ Round 3</h1>

      <section className="section">
        <h2>Tournament Standings</h2>
        {renderTableFromRows(standings)}
      </section>

      <section className="section">
        <h2>Round 3 — Strokes</h2>
        {renderTableFromRows(strokes)}
      </section>

      <section className="section">
        <h2>Round 3 — Modified Stableford</h2>
        {renderTableFromRows(points)}
      </section>

      <section className="section">
        <h2>After 3 Rounds — Overall Standings</h2>
        <div className="overall-table">
          {renderTableFromRows(overall)}
        </div>
      </section>
    </div>
  );
}

// ✅ all imports must be at the top
import React, { useEffect, useState } from "react";
import "./Round1.css";

export default function Round2() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [standings, setStandings] = useState([]);
  const [strokes, setStrokes] = useState([]);
  const [points, setPoints] = useState([]);
  const [matchplay, setMatchplay] = useState([]);
  const [matchplayColors, setMatchplayColors] = useState([]);
  const [overall, setOverall] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/round2")
      .then((r) => r.json())
      .then((json) => {
        if (json.status === "success") {
          setStandings(json.standings || []);
          setStrokes(json.strokes || []);
          setPoints(json.points || []);
          setMatchplay(json.matchplay || []);
          setMatchplayColors(json.matchplay_colors || []);
          setOverall(json.overall || []);
        } else {
          setError(json.message || "Failed to load data");
        }
      })
      .catch((e) => setError(e.message || "Network error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading Round 2…</div>;
  if (error) return <div className="error">Error: {error}</div>;

  // === TABLE RENDERER WITH FIXED ARROW DETECTION ===
  const renderTableFromRows = (rows) => {
    if (!rows || !rows.length) return <div className="empty">No data</div>;

    // TRUE Excel arrow characters found in leaderboard.xlsx:
    const upArrow = "⬆";   // U+2B06 BLACK UP ARROW
    const downArrow = "⬇"; // U+2B07 BLACK DOWN ARROW

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
                  }
                  else if (value.includes(upArrow) && !value.includes(downArrow)) {
                    // ONLY up arrow present
                    cellClass = "arrow-up";
                  }
                  else if (value.includes(downArrow) && !value.includes(upArrow)) {
                    // ONLY down arrow present
                    cellClass = "arrow-down";
                  }
                  else if (value.includes(upArrow) && value.includes(downArrow)) {
                    // Excel encodes "no change" as ⬆⬇ or ⬇⬆
                    cellClass = "arrow-same";
                  }
                  else if (value.includes("-") || value.includes("–")) {
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

  // === SPECIAL MATCHPLAY RENDERER ===
  const renderMatchplayTable = () => {
    if (!matchplay || !matchplay.length)
      return <div className="empty">No data</div>;

    return (
      <div className="table-block matchplay-table">
        <table>
          <tbody>
            {matchplay.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => {
                  const colorTag = matchplayColors?.[i]?.[j] ?? "";

                  let bg = "";
                  if (colorTag === "gold") bg = "rgba(255, 215, 0, 0.35)";
                  if (colorTag === "silver") bg = "rgba(192, 192, 192, 0.35)";
                  if (colorTag === "bronze") bg = "rgba(205, 127, 50, 0.35)";

                  return (
                    <td
                      key={j}
                      className={i === 0 ? "header-cell" : ""}
                      style={{ backgroundColor: bg }}
                    >
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
      <h1 className="round-title">🏌️ Round 2</h1>

      <section className="section">
        <h2>Tournament Standings</h2>
        {renderTableFromRows(standings)}
      </section>

      <section className="section">
        <h2>Round 2 — Strokes</h2>
        {renderTableFromRows(strokes)}
      </section>

      <section className="section">
        <h2>Round 2 — Net Scores</h2>
        {renderTableFromRows(points)}
      </section>

      <section className="section">
        <h2>Round 2 — Matchplay Order</h2>
        {renderMatchplayTable()}
      </section>

      <section className="section">
        <h2>After 2 Rounds — Overall Standings</h2>
        <div className="overall-table">
          {renderTableFromRows(overall)}
        </div>
      </section>
    </div>
  );
}

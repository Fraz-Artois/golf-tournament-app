// === IMPORTS AT TOP ===
import React, { useEffect, useState } from "react";
import "./Round1.css";

export default function Round6() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [standings, setStandings] = useState([]);
  const [strokes, setStrokes] = useState([]);
  const [points, setPoints] = useState([]);
  const [overall, setOverall] = useState([]); // <- FINAL TABLE comes through here

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/round6")
      .then((r) => r.json())
      .then((json) => {
        if (json.status === "success") {
          setStandings(json.standings || []);
          setStrokes(json.strokes || []);
          setPoints(json.points || []);
          setOverall(json.overall || []); // FINAL overall standings
        } else {
          setError(json.message || "Failed to load data");
        }
      })
      .catch((e) => setError(e.message || "Network error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading Round 6…</div>;
  if (error) return <div className="error">Error: {error}</div>;

  // === TABLE RENDERER WITH ARROWS + MEDALS + CROWN ===
  const renderTableFromRows = (rows) => {
    if (!rows || !rows.length) return <div className="empty">No data</div>;

    const upArrow = "⬆";
    const downArrow = "⬇";

    return (
      <div className="table-block">
        <table>
          <tbody>
            {rows.map((r, i) => {
              const rank = String(r[0]).trim().toUpperCase();
              let rowClass = "";

              // === MEDAL COLOUR LOGIC (TIES INCLUDED) ===
              if (rank === "1ST" || rank === "=1ST") {
                rowClass = "medal-gold";
              } else if (rank === "2ND" || rank === "=2ND") {
                rowClass = "medal-silver";
              } else if (rank === "3RD" || rank === "=3RD") {
                rowClass = "medal-bronze";
              }

              return (
                <tr key={i} className={rowClass}>
                  {r.map((cell, j) => {
                    const value = String(cell).trim();
                    let cellClass = "";
                    let displayValue = cell;

                    // === HEADER ROW ===
                    if (i === 0) {
                      cellClass = "header-cell";
                    }

                    // === ARROW LOGIC ===
                    else if (
                      (value.includes(upArrow) || value.includes("↑")) &&
                      !(value.includes(downArrow) || value.includes("↓"))
                    ) {
                      cellClass = "arrow-up";
                    } else if (
                      (value.includes(downArrow) || value.includes("↓")) &&
                      !(value.includes(upArrow) || value.includes("↑"))
                    ) {
                      cellClass = "arrow-down";
                    } else if (value.includes("-") || value.includes("–")) {
                      cellClass = "arrow-same";
                    }

                    // === CROWN FOR CHAMPION (Supports ties) ===
                    if (j === 2 && (rank === "1ST" || rank === "=1ST")) {
                      displayValue = (
                        <>
                          {cell} <span className="crown">👑</span>
                        </>
                      );
                    }

                    return (
                      <td key={j} className={cellClass}>
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="round-container">
      <h1 className="round-title">🏌️ Round 6</h1>

      {/* Tournament Standings */}
      <section className="section">
        <h2>Tournament Standings</h2>
        {renderTableFromRows(standings)}
      </section>

      {/* Strokes */}
      <section className="section">
        <h2>Round 6 — Strokes</h2>
        {renderTableFromRows(strokes)}
      </section>

      {/* Net Scores */}
      <section className="section">
        <h2>Round 6 — Net Scores</h2>
        {renderTableFromRows(points)}
      </section>

      {/* FINAL Overall Standings (only table displayed) */}
      <section className="section">
        <h2>🏆 FINAL Overall Standings</h2>
        <div className="overall-table">
          {renderTableFromRows(overall)}
        </div>
      </section>
    </div>
  );
}

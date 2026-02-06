// frontend/src/Pages/Overall.jsx
import React, { useEffect, useState } from "react";
import "./Overall.css";
import { fetchSheetAsRowsByName } from "../utils/googleSheets";

// helpers
const colIndex = (l) => l.toUpperCase().charCodeAt(0) - 65;
const rowIndex = (n) => n - 1;

function sliceRange(rows, start, end) {
  const out = [];
  for (let r = rowIndex(start.row); r <= rowIndex(end.row); r++) {
    out.push((rows[r] || []).slice(colIndex(start.col), colIndex(end.col) + 1));
  }
  return out;
}

function trimRight(rows) {
  let last = -1;
  rows.forEach((r) => {
    for (let i = r.length - 1; i >= 0; i--) {
      if (String(r[i] ?? "").trim()) {
        last = Math.max(last, i);
        break;
      }
    }
  });
  return last >= 0 ? rows.map((r) => r.slice(0, last + 1)) : rows;
}

export default function Overall() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSheetAsRowsByName("Overall", "A1:J200").then((r) => {
      setRows(r || []);
      setLoading(false);
    });
  }, []);

  const pageTitle = rows?.[0]?.[0] || "Overall";

  const currentRound = Math.min(
    6,
    parseInt(rows?.[0]?.[1], 10) || 0
  );

  const tables = [
    { round: 6, title: "FINAL STANDINGS", start: { col: "A", row: 63 }, end: { col: "J", row: 71 } },
    { round: 5, title: "5 ROUNDS", start: { col: "A", row: 51 }, end: { col: "I", row: 59 } },
    { round: 4, title: "4 ROUNDS", start: { col: "A", row: 39 }, end: { col: "H", row: 47 } },
    { round: 3, title: "3 ROUNDS", start: { col: "A", row: 27 }, end: { col: "G", row: 35 } },
    { round: 2, title: "2 ROUNDS", start: { col: "A", row: 15 }, end: { col: "F", row: 23 } },
    { round: 1, title: "ROUND 1", start: { col: "A", row: 4 }, end: { col: "E", row: 11 } },
  ];

  if (loading) return <div className="loading">Loading Overall…</div>;

  return (
    <div className="round-container overall-container">
      <h1 className="round-title">{pageTitle}</h1>

      {tables
        .filter((t) => t.round <= currentRound)
        .map((t, idx) => {
          const data = trimRight(sliceRange(rows, t.start, t.end));
          if (!data.length) return null;

          return (
            <section className="section" key={idx}>
              <h2>{t.title}</h2>

              <div className="table-block">
                <table>
                  <tbody>
                    {data.map((r, i) => (
                      <tr key={i}>
                        {r.map((c, j) => (
                          <td key={j}>{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import "./Round1.css";
import { fetchSheetAsRowsByName } from "../utils/googleSheets";

// --- helpers ---
const colIndex = (letter) => letter.toUpperCase().charCodeAt(0) - 65;
const rowIndex = (num) => num - 1;

function sliceRange(rows, startCell, endCell) {
  const r1 = rowIndex(startCell.row);
  const r2 = rowIndex(endCell.row);
  const c1 = colIndex(startCell.col);
  const c2 = colIndex(endCell.col);

  const out = [];
  for (let r = r1; r <= r2; r++) {
    const row = rows[r] || [];
    out.push(row.slice(c1, c2 + 1));
  }
  return out;
}

function trimRight(tableRows) {
  const isBlank = (v) => !String(v ?? "").trim();

  let last = -1;
  tableRows.forEach((r) => {
    for (let c = r.length - 1; c >= 0; c--) {
      if (!isBlank(r[c])) {
        if (c > last) last = c;
        break;
      }
    }
  });

  if (last < 0) return tableRows;
  return tableRows.map((r) => r.slice(0, last + 1));
}

export default function Round1() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tables, setTables] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const rows = await fetchSheetAsRowsByName("Round1", "A1:W48");

        const results = trimRight(
          sliceRange(rows, { col: "A", row: 6 }, { col: "D", row: 13 })
        );

        const strokes = trimRight(
          sliceRange(rows, { col: "A", row: 22 }, { col: "W", row: 32 })
        );

        const stableford = trimRight(
          sliceRange(rows, { col: "A", row: 38 }, { col: "W", row: 48 })
        );

        setTables([
          { key: "results", title: "Round 1 - Results", rows: results },
          { key: "strokes", title: "Round 1 - Strokes", rows: strokes },
          { key: "stableford", title: "Round 1 - Stableford Points", rows: stableford },
        ]);
      } catch (e) {
        setError(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="loading">Loading Round 1…</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const renderTableFromRows = (rows, tableKey) => {
    if (!rows || !rows.length) return <div className="empty">No data</div>;

    const upArrow = "⬆";
    const downArrow = "⬇";

    return (
      <div className="table-block">
        <table className={`dataTable table--${tableKey}`}>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((cell, j) => {
                  const value = String(cell ?? "").trim();
                  let cellClass = "";

                  if (i === 0) cellClass = "header-cell";
                  else if (value.includes(upArrow) && !value.includes(downArrow))
                    cellClass = "arrow-up";
                  else if (value.includes(downArrow) && !value.includes(upArrow))
                    cellClass = "arrow-down";
                  else if (value === "-" || value === "–")
                    cellClass = "arrow-same";

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
      <h1 className="round-title">🏌️ Round 1</h1>

      {tables.map((t) => (
        <section className="section" key={t.key}>
          <h2>{t.title}</h2>
          {renderTableFromRows(t.rows, t.key)}
        </section>
      ))}
    </div>
  );
}

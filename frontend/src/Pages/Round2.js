import React, { useEffect, useState } from "react";
import "./Round1.css";
import { fetchSheetAsRowsByName } from "../utils/googleSheets";

// --- helpers ---
const colIndex = (letter) => letter.toUpperCase().charCodeAt(0) - 65; // A=0
const rowIndex = (num) => num - 1; // Sheet row 1 => index 0

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

const classFromMask = (raw) => {
  const code = String(raw ?? "").trim();
  if (code === "3") return "mp-gold";
  if (code === "2") return "mp-silver";
  if (code === "1") return "mp-bronze";
  return "";
};

// detect first player row in matchplay table (usually where BELLIS starts)
const isLikelyPlayerName = (val) => {
  const s = String(val ?? "").trim();
  if (!s) return false;
  const lower = s.toLowerCase();
  if (lower === "players" || lower === "player" || lower === "par" || lower === "s.i" || lower === "si" || lower === "hole")
    return false;
  return /[a-z]/i.test(s);
};

export default function Round2() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tables, setTables] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const rows = await fetchSheetAsRowsByName("Round2", "A1:W130");

        const results = trimRight(
          sliceRange(rows, { col: "A", row: 6 }, { col: "D", row: 13 })
        );

        const strokes = trimRight(
          sliceRange(rows, { col: "A", row: 22 }, { col: "W", row: 32 })
        );

        const netScores = trimRight(
          sliceRange(rows, { col: "A", row: 38 }, { col: "W", row: 48 })
        );

        const matchplayNames = trimRight(
          sliceRange(rows, { col: "A", row: 54 }, { col: "V", row: 64 })
        );

        // ✅ mask is ONLY the player rows map
        const matchplayMask = trimRight(
          sliceRange(rows, { col: "A", row: 111 }, { col: "V", row: 117 })
        );

        setTables([
          { type: "normal", title: "Round 2 - Results", rows: results },
          { type: "normal", title: "Round 2 - Strokes", rows: strokes },
          { type: "normal", title: "Round 2 - Net Scores", rows: netScores },
          {
            type: "matchplay",
            title: "Round 2 - Matchplay",
            rows: matchplayNames,
            mask: matchplayMask,
          },
        ]);
      } catch (e) {
        setError(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="loading">Loading Round 2…</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const renderNormalTable = (rows) => {
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

  const renderMatchplayTable = (nameRows, maskRows) => {
    if (!nameRows || !nameRows.length) return <div className="empty">No data</div>;

    // ✅ find where the actual players begin (so mask row 0 maps to BELLIS row)
    const playerStart = nameRows.findIndex((r, i) => i > 0 && isLikelyPlayerName(r?.[0]));
    // fallback if not found
    const start = playerStart >= 0 ? playerStart : 1;

    return (
      <div className="table-block">
        <table>
          <tbody>
            {nameRows.map((r, i) => (
              <tr key={i}>
                {r.map((cell, j) => {
                  const text = String(cell ?? "").trim();

                  // header row stays gold band + never overlay medals on it
                  if (i === 0) {
                    return (
                      <td key={j} className="header-cell">
                        {text}
                      </td>
                    );
                  }

                  // ✅ only overlay mask starting from first player row
                  const mi = i - start;
                  const cls =
                    mi >= 0 && mi < (maskRows?.length || 0)
                      ? classFromMask(maskRows?.[mi]?.[j])
                      : "";

                  return (
                    <td key={j} className={cls}>
                      {text}
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

      {tables.map((t, idx) => (
        <section className="section" key={idx}>
          <h2>{t.title}</h2>

          {t.type === "matchplay"
            ? renderMatchplayTable(t.rows, t.mask)
            : renderNormalTable(t.rows)}
        </section>
      ))}
    </div>
  );
}

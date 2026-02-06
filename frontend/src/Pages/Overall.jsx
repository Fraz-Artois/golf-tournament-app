// frontend/src/Pages/Overall.jsx
import React, { useEffect, useState } from "react";
import "./Overall.css";
import { fetchSheetAsRowsByName } from "../utils/googleSheets";

// --- helpers (same pattern as rounds) ---
const colIndex = (letter) => letter.toUpperCase().charCodeAt(0) - 65; // A=0
const rowIndex = (num) => num - 1; // row 1 => index 0

function sliceRange(rows, startCell, endCell) {
  const r1 = rowIndex(startCell.row);
  const r2 = rowIndex(endCell.row);
  const c1 = colIndex(startCell.col);
  const c2 = colIndex(endCell.col);

  return (rows || [])
    .slice(r1, r2 + 1)
    .map((r) => (r || []).slice(c1, c2 + 1));
}

function trimRight(tableRows) {
  if (!tableRows?.length) return [];
  let maxCol = -1;

  for (let i = 0; i < tableRows.length; i++) {
    const row = tableRows[i] || [];
    for (let j = row.length - 1; j >= 0; j--) {
      const v = row[j];
      if (String(v ?? "").trim() !== "") {
        if (j > maxCol) maxCol = j;
        break;
      }
    }
  }

  if (maxCol < 0) return tableRows.map(() => []);
  return tableRows.map((r) => (r || []).slice(0, maxCol + 1));
}

function isRowEmpty(row) {
  return !(row || []).some((c) => String(c ?? "").trim() !== "");
}

function trimEmptyBottom(rows) {
  if (!rows?.length) return [];
  let end = rows.length - 1;
  while (end >= 0 && isRowEmpty(rows[end])) end--;
  return rows.slice(0, end + 1);
}

// Guard: don’t render a table unless it has at least one “real” data row.
function tableHasData(rows) {
  const cleaned = trimEmptyBottom(trimRight(rows || []));
  if (!cleaned.length) return false;

  const body = cleaned.slice(1);
  return body.some((r) => (r || []).some((c) => String(c ?? "").trim() !== ""));
}

// We'll scan the first 3 rows and pick the first row that contains "Round" or "Total".
function findHeaderRowIndex(cleanedRows) {
  const scan = Math.min(3, cleanedRows?.length || 0);

  for (let i = 0; i < scan; i++) {
    const row = cleanedRows[i] || [];
    const hit = row.some((c) => {
      const s = String(c ?? "").trim().toLowerCase();
      return s.startsWith("round") || s === "total";
    });
    if (hit) return i;
  }

  return 0; // fallback
}

function findTotalColIndexFromRow(row) {
  const idx = (row || []).findIndex(
    (c) => String(c ?? "").trim().toLowerCase() === "total"
  );
  return idx >= 0 ? idx : null;
}

function Table({ title, rows }) {
  const cleaned = trimEmptyBottom(trimRight(rows || []));
  if (!tableHasData(cleaned)) return null;

  const headerRowIndex = findHeaderRowIndex(cleaned);
  const totalColIndex = findTotalColIndexFromRow(cleaned[headerRowIndex]);

  return (
    <div className="overallCard">
      {title ? <div className="overallCardTitle">{title}</div> : null}

      {/* OUTER: clips rounded corners / prevents bleed */}
      <div className="overallTableWrap">
        {/* INNER: handles horizontal scroll */}
        <div className="overallTableScroll">
          <table className="overallTable">
            <tbody>
              {cleaned.map((r, i) => (
                <tr
                  key={i}
                  className={i === headerRowIndex ? "overallHeaderRow" : ""}
                >
                  {(r || []).map((c, j) => {
                    const isTotal = totalColIndex != null && j === totalColIndex;

                    const isDataRow = i > headerRowIndex;
                    const zebra =
                      isDataRow && (i - headerRowIndex) % 2 === 0
                        ? "overallAltRowCell"
                        : "";

                    return (
                      <td
                        key={j}
                        className={[isTotal ? "overallTotalCell" : "", zebra]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {c}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ================== CONFIG ==================
const SHEET_NAME = "Overall";
const RANGE = "A1:J200";

const PAGE_TITLE_CELL = { col: "A", row: 1 };
const CURRENT_ROUND_CELL = { col: "B", row: 1 };

const TABLES = [
  { round: 1, title: "ROUND 1", start: { col: "A", row: 4 }, end: { col: "E", row: 11 } },
  { round: 2, title: "2 ROUNDS", start: { col: "A", row: 15 }, end: { col: "F", row: 23 } },
  { round: 3, title: "3 ROUNDS", start: { col: "A", row: 27 }, end: { col: "G", row: 35 } },
  { round: 4, title: "4 ROUNDS", start: { col: "A", row: 39 }, end: { col: "H", row: 47 } },
  { round: 5, title: "5 ROUNDS", start: { col: "A", row: 51 }, end: { col: "I", row: 59 } },
  { round: 6, title: "FINAL STANDINGS", start: { col: "A", row: 63 }, end: { col: "J", row: 71 } },
];

export default function Overall() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setErr("");
        const data = await fetchSheetAsRowsByName(SHEET_NAME, RANGE);
        if (!cancelled) setRows(data || []);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load Overall sheet");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const pageTitle =
    sliceRange(rows, PAGE_TITLE_CELL, PAGE_TITLE_CELL)?.[0]?.[0] || "Overall";

  const currentRoundRaw =
    sliceRange(rows, CURRENT_ROUND_CELL, CURRENT_ROUND_CELL)?.[0]?.[0] ?? "";
  const currentRound = Math.max(
    0,
    Math.min(6, parseInt(String(currentRoundRaw).trim(), 10) || 0)
  );

  return (
    <div className="overallPage">
      <div className="overallHero">
        <h1 className="overallTitle">{pageTitle}</h1>
        <div className="overallSubtitle">
          Showing tables up to round: <b>{currentRound || "—"}</b>
        </div>
      </div>

      {loading ? <div className="overallStatus">Loading…</div> : null}
      {err ? <div className="overallError">{err}</div> : null}

      <div className="overallGrid">
        {TABLES
          .filter((t) => t.round <= currentRound)
          .slice()
          .sort((a, b) => b.round - a.round) // latest at top
          .map((t) => (
            <Table
              key={t.round}
              title={t.title}
              rows={sliceRange(rows, t.start, t.end)}
            />
          ))}
      </div>
    </div>
  );
}

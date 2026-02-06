// frontend/src/utils/googleSheets.js

const SHEET_ID = "1__0Tws3_ecn3vG3DUW6m4Y6wJPmQY1CqsiCrv22CM6Q";

/**
 * ✅ Tab name -> gid map (your provided gids)
 * This fixes the issue where Google "export?format=csv&sheet=NAME" can return the first tab.
 */
const SHEET_GIDS = {
  Round1: "1478264222",
  Round2: "74729766",
  Round3: "33039960",
  Round4: "1097163737",
  Round5: "1554022515",
  Round6: "1801814981",
  Overall: "1132513394",
};

/**
 * Fetch sheet CSV rows by TAB NAME (internally uses gid for reliability).
 * Pass a range (e.g. "A1:W48") to keep a stable rectangle for fixed slicing.
 */
export async function fetchSheetAsRowsByName(sheetName, range) {
  const gid = SHEET_GIDS[sheetName];

  if (!gid) {
    throw new Error(
      `No gid configured for sheet "${sheetName}". Add it to SHEET_GIDS in googleSheets.js`
    );
  }

  const rangeParam = range ? `&range=${encodeURIComponent(range)}` : "";

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}${rangeParam}&_=${Date.now()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch sheet "${sheetName}" (gid=${gid}) (HTTP ${res.status})`
    );
  }

  const csvText = await res.text();
  return parseCSV(csvText);
}

/**
 * Optional legacy fetch by gid (direct)
 */
export async function fetchSheetAsRows(gid, range) {
  const rangeParam = range ? `&range=${encodeURIComponent(range)}` : "";
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}${rangeParam}&_=${Date.now()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch sheet (HTTP ${res.status})`);

  const csvText = await res.text();
  return parseCSV(csvText);
}

/**
 * Minimal CSV parser that handles quoted fields and escaped quotes.
 * Returns: rows[rowIndex][colIndex] as trimmed strings.
 */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    // escaped quote inside quoted string
    if (c === '"' && inQuotes && next === '"') {
      cell += '"';
      i++;
      continue;
    }

    // toggle quotes
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    // column break
    if (c === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    // row break
    if ((c === "\n" || c === "\r") && !inQuotes) {
      if (c === "\r" && next === "\n") i++; // handle CRLF
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += c;
  }

  // last cell/row
  row.push(cell);
  rows.push(row);

  return rows.map((r) => r.map((v) => (v ?? "").toString().trim()));
}

/**
 * Legacy helper (NOT USED in fixed-range approach),
 * kept so older imports don't break.
 */
export function splitIntoTitledTables(rows, options = {}) {
  const { skipTitles = [] } = options;
  const skipSet = new Set(skipTitles.map((t) => String(t).trim().toUpperCase()));

  const isBlank = (v) => !String(v ?? "").trim();
  const isBlankRow = (r) => !r || r.every(isBlank);

  const nonEmptyCount = (r) =>
    (r || []).reduce((acc, v) => acc + (isBlank(v) ? 0 : 1), 0);

  const firstNonEmptyCellIndex = (r) => {
    for (let i = 0; i < (r?.length || 0); i++) {
      if (!isBlank(r[i])) return i;
    }
    return -1;
  };

  const isTitleText = (s) => {
    const t = String(s ?? "").trim();
    if (!t) return false;
    return (
      /^round\s*\d+/i.test(t) ||
      /^after\s+round\s*\d+/i.test(t) ||
      /^overall/i.test(t)
    );
  };

  const trimTable = (tableRows) => {
    if (!tableRows || tableRows.length === 0) return tableRows;

    const cleaned = tableRows.filter((r) => !isBlankRow(r));
    if (cleaned.length === 0) return cleaned;

    let left = Infinity;
    let right = -1;

    for (const r of cleaned) {
      for (let c = 0; c < r.length; c++) {
        if (!isBlank(r[c])) {
          if (c < left) left = c;
          break;
        }
      }
      for (let c = r.length - 1; c >= 0; c--) {
        if (!isBlank(r[c])) {
          if (c > right) right = c;
          break;
        }
      }
    }

    if (left === Infinity || right === -1) return cleaned;
    return cleaned.map((r) => r.slice(left, right + 1));
  };

  let end = rows.length;
  while (end > 0 && isBlankRow(rows[end - 1])) end--;
  const clean = rows.slice(0, end);

  const tables = [];
  let i = 0;

  while (i < clean.length) {
    while (i < clean.length) {
      const idx = firstNonEmptyCellIndex(clean[i]);
      const cell = idx === -1 ? "" : clean[i][idx];
      if (isTitleText(cell)) break;
      i++;
    }
    if (i >= clean.length) break;

    const titleRow = clean[i];
    const titleCol = firstNonEmptyCellIndex(titleRow);
    const title = titleCol === -1 ? "" : String(titleRow[titleCol] ?? "").trim();
    const titleKey = title.toUpperCase();

    const titleRowHasOtherHeaders = nonEmptyCount(titleRow) >= 2;

    let headerRow;
    let headerIndex;

    if (titleRowHasOtherHeaders) {
      headerRow = [...titleRow];
      headerRow[titleCol] = "";
      headerIndex = i;
    } else {
      headerIndex = i + 1;
      while (headerIndex < clean.length && isBlankRow(clean[headerIndex])) headerIndex++;
      while (headerIndex < clean.length && nonEmptyCount(clean[headerIndex]) < 2) headerIndex++;
      if (headerIndex >= clean.length) break;
      headerRow = clean[headerIndex];
    }

    let r = headerIndex + 1;
    const data = [];

    while (r < clean.length) {
      if (isBlankRow(clean[r])) break;

      const idx = firstNonEmptyCellIndex(clean[r]);
      const cell = idx === -1 ? "" : clean[r][idx];
      if (isTitleText(cell)) break;

      data.push(clean[r]);
      r++;
    }

    if (title && !skipSet.has(titleKey)) {
      tables.push({ title, rows: trimTable([headerRow, ...data]) });
    }

    i = r;
  }

  return tables;
}

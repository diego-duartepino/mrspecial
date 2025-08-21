// src/pages/NewTable.js
import { useEffect, useMemo, useState } from "react";
import Page from "../components/Page";
import { Field } from "../components/Field";
import Button from "../components/Button";
import FileUpload from "../components/FileUpload";

/** Common PostgreSQL types for the dropdown */
const PG_TYPES = [
  "smallint",
  "integer",
  "bigint",
  "serial",
  "bigserial",
  "numeric",
  "decimal",
  "real",
  "double precision",
  "money",
  "boolean",
  "text",
  "varchar",
  "char",
  "bytea",
  "date",
  "timestamp",
  "timestamptz",
  "time",
  "timetz",
  "uuid",
  "json",
  "jsonb",
];

export default function NewTable() {
  const [table, setTable] = useState("");
  const [cols, setCols] = useState([
    { name: "id", type: "uuid", nullable: false },
    { name: "created_at", type: "timestamptz", nullable: false },
  ]);
  const [out, setOut] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // backend status (same pill used elsewhere)
  const [apiOk, setApiOk] = useState(null);
  const [checking, setChecking] = useState(false);
  async function checkApi() {
    try {
      setChecking(true);
      const res = await fetch("/api/ping");
      const ct = res.headers.get("content-type") || "";
      const json = ct.includes("application/json") ? await res.json() : {};
      setApiOk(res.ok && json.ok === true);
    } catch {
      setApiOk(false);
    } finally {
      setChecking(false);
    }
  }
  useEffect(() => { checkApi(); }, []);

  // --- helpers ---
  function isValidIdentifier(s) {
    return /^[A-Za-z_][A-Za-z0-9_]*$/.test(s || "");
  }
  function buildSchema() {
    return {
      table,
      columns: cols.map(({ name, type, nullable }) => ({ name, type, nullable })),
    };
  }
  const issues = useMemo(() => {
    const list = [];
    if (!table) list.push("Table name is required.");
    else if (!isValidIdentifier(table)) list.push("Table name must match [A-Za-z_][A-Za-z0-9_]*.");
    if (!cols.length) list.push("Add at least one column.");
    const names = cols.map(c => c.name).filter(Boolean);
    if (names.some(n => !isValidIdentifier(n))) list.push("All column names must match [A-Za-z_][A-Za-z0-9_]*.");
    const dup = names.find((n, i) => names.indexOf(n) !== i);
    if (dup) list.push(`Duplicate column name: ${dup}`);
    if (cols.some(c => !c.type)) list.push("Each column needs a type.");
    return list;
  }, [table, cols]);

  async function safeFetchJSON(input, init) {
    const res = await fetch(input, init);
    const ct = res.headers.get("content-type") || "";
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${txt.slice(0, 200)}`);
    }
    if (!ct.includes("application/json")) {
      const txt = await res.text();
      throw new Error(`Expected JSON but got '${ct}'. First 200 chars:\n${txt.slice(0, 200)}`);
    }
    return res.json();
  }

  const onCreateTable = async () => {
    setErr(""); setOut(null);
    if (issues.length) { setErr(issues.join("\n")); return; }
    try {
      setBusy(true);
      const schema = buildSchema();
      const json = await safeFetchJSON("/api/tables/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schema),
      });
      setOut(json);
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  };

  function addCol() {
    setCols(v => [...v, { name: "", type: "text", nullable: true }]);
  }
  function updateCol(i, patch) {
    setCols(v => v.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }
  function removeCol(i) {
    setCols(v => v.filter((_, idx) => idx !== i));
  }

  return (
    <Page
      title="New Table"
      subtitle="Define a table schema and (optionally) upload rows to populate it"
      maxWidth={980}
      actions={<Status ok={apiOk} checking={checking} onRetry={checkApi} label="Backend" />}
    >
      <style>{`
        .nt-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: minmax(0, 3fr) minmax(0, 1fr); /* 75 / 25 */
          align-items: stretch;
          width: 100%;
          padding: 2px;
        }
        @media (max-width: 820px) { .nt-grid { grid-template-columns: 1fr; } }
        .card {
          background: #fff; border: 1px solid #eef2ff; border-radius: 16px; padding: 16px;
          box-shadow: 0 8px 24px rgba(17,24,39,.06); overflow: hidden;
        }
        .card--stretch { height: 100%; }
        @media (max-width: 820px) { .card--stretch { height: auto; } }
        .label { font-size: 12px; color: #64748b; margin: 0 0 8px 2px; }
        .row { display: grid; gap: 10px; }
        .panel {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 12px; border-radius: 12px; padding: 12px; white-space: pre-wrap; overflow: auto;
        }
        .panel--err { color: #991b1b; background: #fff1f2; border: 1px solid #fecdd3; }
        .panel--ok  { color: #e2e8f0; background: #0b1220; }
        .table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
        .th, .td { padding: 6px 8px; }
        .hdr { font-size: 12px; color: #64748b; }
        .cell {
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 8px;
          display: flex; align-items: center; gap: 8px;
        }
        .select, .checkbox {
          font: inherit; border: none; outline: none; background: transparent;
        }
        .actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
        .check { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #0f172a; }
        .dot { width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 0 6px rgba(2,6,23,.06); }
        .dot.ok { background: #16a34a; } .dot.no { background: #ef4444; }
      `}</style>

      <div className="nt-grid">
        {/* left: schema & upload */}
        <div className="card">
          <h3 style={{ margin: "4px 0 10px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            Define Schema
          </h3>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: "#475569" }}>
            Choose a table name and add columns with PostgreSQL types. You can optionally upload a CSV/Excel to populate rows.
          </p>

          <div className="row">
            <div>
              <div className="label">Table name</div>
              <Field label="Table" value={table} onChange={setTable} placeholder="e.g., sales_items" />
            </div>

            <div>
              <div className="label">Columns</div>

              <table className="table" aria-label="Columns">
                <thead>
                  <tr>
                    <th className="th hdr" style={{ textAlign: "left" }}>Name</th>
                    <th className="th hdr" style={{ textAlign: "left" }}>Type</th>
                    <th className="th hdr" style={{ textAlign: "left" }}>Nullable</th>
                    <th className="th hdr" />
                  </tr>
                </thead>
                <tbody>
                  {cols.map((c, i) => (
                    <tr key={i}>
                      <td className="td">
                        <div className="cell">
                          <input
                            value={c.name}
                            onChange={(e) => updateCol(i, { name: e.target.value })}
                            placeholder="column_name"
                            className="select"
                            style={{ width: "100%" }}
                          />
                        </div>
                      </td>
                      <td className="td">
                        <div className="cell">
                          <select
                            value={c.type}
                            onChange={(e) => updateCol(i, { type: e.target.value })}
                            className="select"
                            style={{ width: "100%" }}
                          >
                            {PG_TYPES.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="td">
                        <div className="cell">
                          <input
                            type="checkbox"
                            checked={!!c.nullable}
                            onChange={(e) => updateCol(i, { nullable: e.target.checked })}
                            className="checkbox"
                            aria-label="Nullable"
                          />
                          <span style={{ fontSize: 13, color: "#475569" }}>Nullable</span>
                        </div>
                      </td>
                      <td className="td" style={{ width: 1, whiteSpace: "nowrap" }}>
                        <button
                          type="button"
                          onClick={() => removeCol(i)}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                            background: "#fff",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                          disabled={cols.length <= 1}
                          title="Remove column"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="actions" style={{ justifyContent: "flex-start" }}>
                <button
                  type="button"
                  onClick={addCol}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 999,
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Add column
                </button>
              </div>
            </div>

            <div>
              <div className="label">Upload file (optional)</div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <FileUpload
                  label="Upload rows (.csv / .xlsx)"
                  accept=".csv,.xlsx"
                  multiple={false}
                  uploadUrl="/api/upload/new-table"
                  fieldName="file"
                  extraData={{
                    table,
                    schema: JSON.stringify(buildSchema()),
                  }}
                  onUploaded={(res) => { setErr(""); setOut(res); }}
                  onError={(msg) => setErr(msg)}
                  maxSizeMB={100}
                />
              </div>
            </div>

            <div className="actions">
              <Button onClick={onCreateTable}>{busy ? "Creating…" : "Create Table"}</Button>
              <button
                type="button"
                onClick={() => { setTable(""); setCols([{ name: "", type: "text", nullable: true }]); setErr(""); setOut(null); }}
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Clear
              </button>
            </div>

            {issues.length > 0 && (
              <div className="panel panel--err">
                {issues.map((i, idx) => `• ${i}`).join("\n")}
              </div>
            )}
          </div>
        </div>

        {/* right: readiness & results */}
        <div className="card card--stretch" style={{ display: "grid", gap: 10, alignContent: "start" }}>
          <h3 style={{ margin: "4px 0 4px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            Readiness
          </h3>
          <div style={{ display: "grid", gap: 8 }}>
            <Check ok={!!table && isValidIdentifier(table)} label="Valid table name" />
            <Check ok={cols.length > 0} label="At least one column" />
            <Check ok={cols.every(c => c.name && isValidIdentifier(c.name))} label="Valid column names" />
            <Check ok={new Set(cols.map(c => c.name)).size === cols.length} label="No duplicate column names" />
            <Check ok={cols.every(c => !!c.type)} label="Types selected" />
          </div>

          <h4 style={{ margin: "14px 0 6px", fontSize: 14, color: "#0f172a" }}>Tips</h4>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#475569", fontSize: 13 }}>
            <li><code>varchar</code> length can be constrained server-side (e.g., <code>varchar(255)</code>).</li>
            <li><code>double precision</code> and <code>numeric</code> differ; use <code>numeric</code> for exact decimals.</li>
            <li>You can create the table first and upload data later.</li>
          </ul>

          {err && (
            <>
              <h4 style={{ margin: "14px 0 6px", fontSize: 14, color: "#991b1b" }}>Error</h4>
              <div className="panel panel--err">{err}</div>
            </>
          )}
          {out && (
            <>
              <h4 style={{ margin: "14px 0 6px", fontSize: 14, color: "#0f172a" }}>Response</h4>
              <div className="panel panel--ok">{JSON.stringify(out, null, 2)}</div>
            </>
          )}
        </div>
      </div>
    </Page>
  );
}

/* --- small helpers/components --- */
function Check({ ok, label }) {
  return (
    <div className="check">
      <span className={`dot ${ok ? "ok" : "no"}`} />
      <span>{label}</span>
    </div>
  );
}

function Status({ ok, checking, onRetry, label = "Status" }) {
  const color = ok === null ? "#94a3b8" : ok ? "#16a34a" : "#ef4444";
  const text  = ok === null ? "Checking…" : ok ? "Online" : "Offline";
  return (
    <div style={statusStyles.wrap} title="Backend status">
      <span style={{ ...statusStyles.dot, background: color }} />
      <span style={statusStyles.text}>{label}: {text}</span>
      <button
        onClick={onRetry}
        disabled={checking}
        style={statusStyles.btn}
        type="button"
        title="Re-check backend"
      >
        {checking ? "…" : "↻"}
      </button>
    </div>
  );
}
const statusStyles = {
  wrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #e2e8f0",
    background: "#fff",
  },
  dot: { width: 10, height: 10, borderRadius: "50%", boxShadow: "0 0 0 6px rgba(2,6,23,.06)" },
  text: { fontSize: 13, color: "#0f172a" },
  btn: {
    border: "none",
    background: "#f8fafc",
    padding: "4px 8px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
    color: "#0f172a",
  },
};

// src/pages/PmrUpload.js
import { useMemo, useState, useEffect } from "react";
import Page from "../components/Page";
import { Field } from "../components/Field";
import Button from "../components/Button";

export default function PmrUpload() {
  const [fromDate, setFromDate] = useState(""); // YYYY-MM-DD
  const [toDate, setToDate] = useState("");     // YYYY-MM-DD
  const [out, setOut] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // backend status (same as Main Hub / POS)
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

  // ----- helpers -----
  function isValidISODate(d) {
    return /^\d{4}-\d{2}-\d{2}$/.test(d || "");
  }
  function isRangeValid(a, b) {
    if (!isValidISODate(a) || !isValidISODate(b)) return false;
    return new Date(a) <= new Date(b);
  }

  const issues = useMemo(() => {
    const list = [];
    if (!fromDate) list.push("From date is required.");
    else if (!isValidISODate(fromDate)) list.push("From date must be YYYY-MM-DD.");
    if (!toDate) list.push("To date is required.");
    else if (!isValidISODate(toDate)) list.push("To date must be YYYY-MM-DD.");
    if (fromDate && toDate && !isRangeValid(fromDate, toDate)) {
      list.push("Date range is invalid (From must be on or before To).");
    }
    return list;
  }, [fromDate, toDate]);

   // Choose backend base URL once
const API_BASE =
  import.meta?.env?.VITE_API_URL ||      // Vite
  process.env.REACT_APP_API_URL ||       // CRA
  process.env.NEXT_PUBLIC_API_URL ||     // Next
  "http://127.0.0.1:5001";               // fallback

async function safeFetchJSON(input, init) {
  // if input is relative, prefix with API_BASE
  const url = input.startsWith("http") ? input : `${API_BASE}${input}`;

  console.log("Fetching:", url);

  const res = await fetch(url, init);
  const ct = res.headers.get("content-type") || "";

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${txt.slice(0, 200)}`);
  }

  if (!ct.includes("application/json")) {
    const txt = await res.text();
    throw new Error(
      `Expected JSON but got '${ct}'. First 200 chars:\n${txt.slice(0, 200)}`
    );
  }

  return res.json();
}

  const onTrigger = async () => {
    setErr(""); setOut(null);
    if (issues.length) { setErr(issues.join("\n")); return; }
    try {
      setBusy(true);
      const body = { from: fromDate, to: toDate }; // inclusive range
      const json = await safeFetchJSON("/api/upload/pmr/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setOut(json);
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page
      title="PMR · Upload"
      subtitle="Trigger PMR ingestion for a date range"
      maxWidth={980}
      actions={<Status ok={apiOk} checking={checking} onRetry={checkApi} label="Backend" />}
    >
      <style>{`
        .pmr-grid { 
          display: grid; 
          gap: 12px; 
          grid-template-columns: minmax(0, 3fr) minmax(0, 1fr); /* 75% / 25% */
          align-items: stretch;
          width: 100%; 
          padding: 2px; 
        }
        @media (max-width: 820px) { .pmr-grid { grid-template-columns: 1fr; } }
        .card {
          background: #fff; border: 1px solid #eef2ff; border-radius: 16px; padding: 16px;
          box-shadow: 0 8px 24px rgba(17,24,39,.06);
          overflow: hidden;
        }
        .card--stretch { height: 100%; }
        @media (max-width: 820px) { .card--stretch { height: auto; } }

        .label { font-size: 12px; color: #64748b; margin: 0 0 8px 2px; }
        .row { display: grid; gap: 12px; justify-items: center; }
        .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; }
        @media (max-width: 640px) { .pair { grid-template-columns: 1fr; } }

        .panel {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 12px; border-radius: 12px; padding: 12px; white-space: pre-wrap; overflow: auto;
        }
        .panel--err { color: #991b1b; background: #fff1f2; border: 1px solid #fecdd3; }
        .panel--ok  { color: #e2e8f0; background: #0b1220; }

        .check { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #0f172a; }
        .dot { width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 0 6px rgba(2,6,23,.06); }
        .dot.ok { background: #16a34a; }
        .dot.no { background: #ef4444; }
      `}</style>

      <div className="pmr-grid">
        {/* left: form */}
        <div className="card">
          <h3 style={{ margin: "4px 0 10px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            Trigger Ingestion
          </h3>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: "#475569" }}>
            Choose a <em>From</em> and <em>To</em> date (inclusive), then trigger the backend script.
          </p>

          <div className="row" style={{ width: "100%" }}>
            <div style={{ width: "100%", display: "grid", gap: 8 }}>
              <div className="label">Parameters</div>
              <div className="row">
                <div className="">
                  <div className="label">From</div>
                <Field
                  label="From"
                  type="date"
                  value={fromDate}
                  onChange={setFromDate}
                  placeholder="YYYY-MM-DD"
                />
                </div>
                <div className="">
                  <div className="label">To</div>

                <Field
                  label="To"
                  type="date"
                  value={toDate}
                  onChange={setToDate}
                  placeholder="YYYY-MM-DD"
                />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <Button onClick={onTrigger}>{busy ? "Triggering…" : "Trigger script"}</Button>
              <button
                type="button"
                onClick={() => { setFromDate(""); setToDate(""); setErr(""); setOut(null); }}
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
        <div className="card" style={{ display: "grid", gap: 10, alignContent: "start" }}>
          <h3 style={{ margin: "4px 0 4px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            Readiness
          </h3>
          <div style={{ display: "grid", gap: 8 }}>
            <div className="check">
              <span className={`dot ${fromDate && isValidISODate(fromDate) ? "ok" : "no"}`} />
              <span>From (YYYY-MM-DD)</span>
            </div>
            <div className="check">
              <span className={`dot ${toDate && isValidISODate(toDate) ? "ok" : "no"}`} />
              <span>To (YYYY-MM-DD)</span>
            </div>
            <div className="check">
              <span className={`dot ${fromDate && toDate && isRangeValid(fromDate, toDate) ? "ok" : "no"}`} />
              <span>Range valid (From ≤ To)</span>
            </div>
          </div>

          <h4 style={{ margin: "14px 0 6px", fontSize: 14, color: "#0f172a" }}>Tips</h4>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#475569", fontSize: 13 }}>
            <li>Dates are <em>inclusive</em>.</li>
            <li>Use the browser date picker to avoid format mistakes (<code>YYYY-MM-DD</code>).</li>
            <li>Confirm the backend is online (see status at the top right).</li>
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

/* ---------- Status pill (same as Main Hub / POS) ---------- */
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
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    boxShadow: "0 0 0 6px rgba(2,6,23,.06)",
  },
  text: {
    fontSize: 13,
    color: "#0f172a",
  },
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

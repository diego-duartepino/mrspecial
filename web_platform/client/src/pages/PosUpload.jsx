import { useMemo, useState, useEffect } from "react";
import Page from "../components/Page";
import { Field } from "../components/Field";
import Button from "../components/Button";

export default function PosUpload() {
  const [since, setSince] = useState("");     // YYYY-MM-DD
  const [out, setOut] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // backend status (same as Main Hub)
  const [apiOk, setApiOk] = useState(null);   // null = unknown, true/false after check
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

  const issues = useMemo(() => {
    const list = [];
    if (!since) list.push("Start date is required.");
    else if (!isValidISODate(since)) list.push("Start date must be YYYY-MM-DD.");
    return list;
  }, [since]);

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
    if (issues.length) {
      setErr(issues.join("\n"));
      return;
    }
    try {
      setBusy(true);
      const body = { since }; // inclusive, YYYY-MM-DD
      const json = await safeFetchJSON("/api/upload/pos/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setOut(json);
    } catch (e) {
      console.log("Error",e)
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page
      title="POS · Upload"
      subtitle="Trigger POS ingestion from a start date onward"
      maxWidth={980}
      actions={<Status ok={apiOk} checking={checking} onRetry={checkApi} label="Backend" />}
    >
      {/* layout & panels */}
      <style>{`
        .pos-grid { 
          display: grid; 
          gap: 12px; 
          grid-template-columns: minmax(0, 3fr) minmax(0, 1fr); /* 75% / 25% */
          align-items: stretch;
          width: 100%; 
          padding: 2px; 
        }
        @media (max-width: 820px) { .pos-grid { grid-template-columns: 1fr; } }
        .card {
          background: #fff; border: 1px solid #eef2ff; border-radius: 16px; padding: 16px;
          box-shadow: 0 8px 24px rgba(17,24,39,.06);
          overflow: hidden;
        }
        .card--stretch { height: 100%; }
        @media (max-width: 820px) { .card--stretch { height: auto; } }

        .label { font-size: 12px; color: #64748b; margin: 0 0 8px 2px; }
        .row { display: grid; gap: 12px; justify-items: center; }
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

      <div className="pos-grid">
        {/* left: form */}
        <div className="card">
          <h3 style={{ margin: "4px 0 10px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            Trigger Ingestion
          </h3>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: "#475569" }}>
            Pick the earliest date to pull POS data <em>from</em> (inclusive), then trigger the backend script.
          </p>

          <div className="row" style={{ width: "100%" }}>
            <div style={{ width: "100%", display: "grid", gap: 8, justifyItems: "center" }}>
              <div className="label">Parameters</div>
              {/* Using Field with a date input */}
              <div className="">
                <div className="label">From</div>

              <Field
                label="Start date"
                type="date"
                value={since}
                onChange={setSince}
                placeholder="YYYY-MM-DD"
              />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <Button onClick={onTrigger}>{busy ? "Triggering…" : "Trigger script"}</Button>
              <button
                type="button"
                onClick={() => { setSince(""); setErr(""); setOut(null); }}
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

            {/* validation feedback */}
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
            <div className="check">
              <span className={`dot ${since && isValidISODate(since) ? "ok" : "no"}`} />
              <span>Start date (YYYY-MM-DD)</span>
            </div>
          </div>

          <h4 style={{ margin: "14px 0 6px", fontSize: 14, color: "#0f172a" }}>Tips</h4>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#475569", fontSize: 13 }}>
            <li>The start date is <em>inclusive</em>.</li>
            <li>Format must be <code>YYYY-MM-DD</code> (browser date picker helps).</li>
            <li>Make sure the backend is online (see status at the top right).</li>
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

/* ---------- Status pill (same behavior as Main Hub) ---------- */
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

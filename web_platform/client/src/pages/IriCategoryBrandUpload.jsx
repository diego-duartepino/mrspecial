import { useMemo, useState, useEffect } from "react";
import Page from "../components/Page";
// Page already shows BackLink (except on "/")
import { Field } from "../components/Field";
import Button from "../components/Button";
import FileUpload from "../components/FileUpload";

export default function IriCategoryBrandUpload() {
  const [source, setSource] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [out, setOut] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // --- backend status (same pill as Hub/POS/PMR) ---
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

  // --- helpers ---
function normalizeMonth(v) {
  const s = String(v || "").trim();
  if (!s) return "";
  const n = Number(s);
  if (Number.isInteger(n) && n >= 1 && n <= 12) {
    const M = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return M[n - 1];
  }
  return s;
}

  const issues = useMemo(() => {
    const list = [];
    if (!source) list.push("Source is required.");
    if (!/^\d{4}$/.test(year)) list.push("Year must be YYYY (e.g., 2025).");
    if (!month) list.push("Month is required.");
    return list;
  }, [source, year, month]);

  const checklist = [
    { ok: !!source, label: "Source" },
    { ok: /^\d{4}$/.test(year), label: "Year (YYYY)" },
    { ok: !!month, label: "Month (e.g., January)" },
  ];

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

  const onUpload = async () => {
    setErr("");
    setOut(null);

    if (issues.length) {
      setErr(issues.join("\n"));
      return;
    }

    try {
      setBusy(true);
      const body = { kind: "iri_category_brand", source, year, month: normalizeMonth(month) };
      const json = await safeFetchJSON("/api/upload/iri/category-brand", {
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
      title="IRI · Category-Brand"
      subtitle="Upload your Category–Brand mapping file and/or trigger processing"
      maxWidth={980}
      actions={<Status ok={apiOk} checking={checking} onRetry={checkApi} label="Backend" />}
    >
      {/* layout & panels */}
      <style>{`
        .iri-grid { 
          display: grid; 
          gap: 12px; 
          grid-template-columns: minmax(0, 3fr) minmax(0, 1fr); /* 75% / 25% */
          align-items: stretch;            /* same row height */
          width: 100%; 
          padding: 2px;                    /* small inset for inner shadows */
        }
        @media (max-width: 820px) { 
          .iri-grid { grid-template-columns: 1fr; } 
        }
        .card {
          background: #fff; 
          border: 1px solid #eef2ff; 
          border-radius: 16px; 
          padding: 16px;
          box-shadow: 0 8px 24px rgba(17,24,39,.06);
          overflow: hidden;                /* clip internal shadows */
        }
        .card--stretch { height: 100%; }   /* make right column fill full height */
        @media (max-width: 820px) { .card--stretch { height: auto; } }

        .label { font-size: 12px; color: #64748b; margin: 0 0 8px 2px; }
        .row { display: grid; gap: 10px; justify-items: center; }
        .check {
          display: flex; align-items: center; gap: 8px; font-size: 13px; color: #0f172a;
        }
        .dot { width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 0 6px rgba(2,6,23,.06); }
        .dot.ok { background: #16a34a; }
        .dot.no { background: #ef4444; }
        .panel {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 12px; border-radius: 12px; padding: 12px; white-space: pre-wrap; overflow: auto;
        }
        .panel--err { color: #991b1b; background: #fff1f2; border: 1px solid #fecdd3; }
        .panel--ok  { color: #e2e8f0; background: #0b1220; } /* dark viewer */
      `}</style>

      <div className="iri-grid">
        {/* left: form (75%) */}
        <div className="card">
          <h3 style={{ margin: "4px 0 10px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            Upload & Process
          </h3>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: "#475569" }}>
            Fill the context fields, then either upload a file below or trigger the processing endpoint.
          </p>

          <div className="row">
          <div style={{ width: "100%", display: "grid", gap: 8, justifyItems: "center" }}>
              <div className="label">Context</div>

              <Field
                label="Source"
                
                value={source}
                onChange={setSource}
                placeholder="Select source…"
                options={["Big Chain", "Total Market", "Mr Special"]}
              />

              <Field label="Year" type="number" value={year} onChange={setYear} placeholder="Year (e.g., 2025)" />
              <Field label="Month" value={month} onChange={setMonth} placeholder="Month (e.g., January)" />

            </div>


            {/* center the FileUpload block */}
            <div style={{ width: "100%",display:'grid',justifyItems: "center" }}>
              <div className="label">Upload file</div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <FileUpload
                  label="Upload IRI Category-Brand (.xlsx)"
                  accept=".xlsx"
                  multiple={false}
                  uploadUrl="/api/upload/iri/category-brand"
                  fieldName="file"
                  extraData={{ source, year, month: normalizeMonth(month) }}
                  onUploaded={(res) => { setErr(""); setOut(res); }}
                  onError={(msg) => setErr(msg)}
                  maxSizeMB={50}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <Button onClick={onUpload}>{busy ? "Processing…" : "Trigger processing"}</Button>
              <button
                type="button"
                onClick={() => { setSource(""); setYear(""); setMonth(""); setErr(""); setOut(null); }}
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

        {/* right: help & status (25%) — full height */}
        <div className="card card--stretch" style={{ display: "grid", gap: 10, alignContent: "start" }}>
          <h3 style={{ margin: "4px 0 4px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            Readiness
          </h3>
          <div style={{ display: "grid", gap: 8 }}>
            {checklist.map((c, i) => (
              <div key={i} className="check">
                <span className={`dot ${c.ok ? "ok" : "no"}`} />
                <span>{c.label}</span>
              </div>
            ))}
          </div>

          <h4 style={{ margin: "14px 0 6px", fontSize: 14, color: "#0f172a" }}>Tips</h4>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#475569", fontSize: 13 }}>
            <li>Accepted file: <code>.xlsx</code>. Keep headers simple (no merged cells).</li>
            <li>Columns usually include <code>Category</code>, <code>Brand</code>, and a unique product key.</li>
            <li>Month can be <code>January</code>–<code>December</code>.</li>
            <li><em>Trigger processing</em> calls the JSON endpoint without uploading a file.</li>
          </ul>

          {/* output & errors */}
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

/* ---------- Status pill ---------- */
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

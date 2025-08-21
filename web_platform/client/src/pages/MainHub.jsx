import { useEffect, useState } from "react";
import Page from "../components/Page";
// import BackLink from "../components/BackLink";
// import Button from "../components/Button";

export default function MainHub() {
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

  useEffect(() => {
    checkApi();
  }, []);

  return (
    <Page
      title="Main Hub"
      subtitle="Choose a module to get started"
      actions={
        <Status
          ok={apiOk}
          checking={checking}
          onRetry={checkApi}
          label="Backend"
        />
      }
      maxWidth={980}
    >
      {/* quick actions
      <div style={styles.quickRow}>
        <Button to="/upload">Upload Data</Button>
        <Button to="/metabase">Metabase</Button>
      </div> */}

      {/* fancy cards */}
      <div style={styles.grid}>
        <HubCard
          title="Data & Automations"
          desc="Upload latest IRI data. Trigger POS & PMR automated scripts."
          to="/upload"
        />
        <HubCard
          title="Metabase"
          desc="Open dashboards and explore your data visually."
          to="/metabase"
          external={false}
        />
        <HubCard
          title="IRI Tools"
          desc="Category-Brand & Items helpers to enrich datasets."
          to="/upload/iri"
        />
        <HubCard
          title="Reports"
          desc="(Coming soon) POS & PMR summaries and exports."
          to="/upload/pmr"
          disabled
        />
      </div>
    </Page>
  );
}

/* ---------- small components ---------- */

function Status({ ok, checking, onRetry, label = "Status" }) {
  const color =
    ok === null ? "#94a3b8" : ok ? "#16a34a" : "#ef4444";
  const text =
    ok === null ? "Checking…" : ok ? "Online" : "Offline";
  return (
    <div style={styles.statusWrap}>
      <span style={{ ...styles.dot, background: color }} />
      <span style={styles.statusText}>{label}: {text}</span>
      <button
        onClick={onRetry}
        disabled={checking}
        style={styles.retryBtn}
        type="button"
        title="Re-check backend"
      >
        {checking ? "…" : "↻"}
      </button>
    </div>
  );
}

function HubCard({ title, desc, to, external, disabled }) {
  const content = (
    <div style={{ ...styles.card, ...(disabled ? styles.cardDisabled : {}) }}>
      <div style={styles.cardHead}>
        <h3 style={styles.cardTitle}>{title}</h3>
        <Arrow />
      </div>
      <p style={styles.cardDesc}>{desc}</p>
    </div>
  );

  if (disabled) {
    return <div aria-disabled style={{ cursor: "not-allowed" }}>{content}</div>;
  }

  // Internal route (Router handles it) — your Button uses <a>, so we’ll also use <a>
  return (
    <a
      href={to}
      style={{ textDecoration: "none", color: "inherit" }}
      target={external ? "_blank" : "_self"}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {content}
    </a>
  );
}

function Arrow() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      style={styles.arrow}
      aria-hidden
    >
      <path
        d="M5 12h12M13 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- styles ---------- */

const styles = {
  quickRow: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  grid: {
    display: "grid",
    gap: 12,
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    width: "100%",
  },
  card: {
    background: "#fff",
    border: "1px solid #eef2ff",
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    boxShadow: "0 8px 24px rgba(17,24,39,.06)",
    transition: "transform .12s ease, box-shadow .12s ease",
  },
  cardDisabled: {
    opacity: 0.6,
  },
  cardHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 6,
  },
  cardTitle: {
    margin: 0,
    fontSize: 18,
    lineHeight: 1.2,
    fontWeight: 800,
    letterSpacing: "-0.01em",
    color: "#0f172a",
  },
  cardDesc: {
    margin: 0,
    fontSize: 14,
    color: "#475569",
  },
  arrow: {
    color: "#155EEF",
    transition: "transform .12s ease",
  },
  statusWrap: {
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
  statusText: {
    fontSize: 13,
    color: "#0f172a",
  },
  retryBtn: {
    border: "none",
    background: "#f8fafc",
    padding: "4px 8px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
    color: "#0f172a",
  },
};

/* --- tiny hover effect via inline style injection (optional) --- */
/* Add this at the bottom of the file if you want arrow/card hover animations globally: */
// const styleEl = document.createElement("style");
// styleEl.innerHTML = `
//   a > div[style*="box-shadow"]{ will-change: transform }
//   a > div[style*="box-shadow"]:hover{ transform: translateY(-2px); box-shadow: 0 12px 28px rgba(17,24,39,.1) }
//   a > div[style*="box-shadow"]:hover svg{ transform: translateX(2px) }
// `;
// document.head.appendChild(styleEl);

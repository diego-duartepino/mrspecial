import Page from "../components/Page";
// import BackLink from "../components/BackLink";
// import Button from "../components/Button";

export default function UploadData() {
  return (
    <Page
      title="Upload Data"
      subtitle="Choose a source to import and process locally"
      maxWidth={980}
      actions={null}
    >
      {/* <BackLink variant="link" /> */}


      {/* quick links (your original buttons) */}
      {/* <div style={styles.quickRow}>
        <Button to="/upload/iri">IRI</Button>
        <Button to="/upload/pos">POS</Button>
        <Button to="/upload/pmr">PMR</Button>
        <Button to="/upload/new-table">New Table</Button>
      </div> */}

      {/* pretty cards (same destinations) */}
      <div style={styles.grid}>
        <DatasetCard
          to="/upload/iri"
          title="IRI"
          desc="Upload IRI datasets. Includes Items and Category-Brand helpers."
          icon={<IconDatabase />}
        />
        <DatasetCard
          to="/upload/pos"
          title="POS"
          desc="Point-of-sale files for store and product level analysis."
          icon={<IconReceipt />}
        />
        <DatasetCard
          to="/upload/pmr"
          title="PMR"
          desc="Price/Market/Report feeds to complement sales insights."
          icon={<IconChart />}
        />
        <DatasetCard
          to="/upload/new-table"
          title="New Table"
          desc="Create and populate a new table from Excel."
          icon={<IconTable />}
        />
      </div>

      <div style={styles.note}>
        <small style={{ color: "#64748b" }}>
          Tip: Only Excel files (.xslx) are supported.
        </small>
      </div>
    </Page>
  );
}

/* ---------- small components ---------- */

function DatasetCard({ to, title, desc, icon }) {
  return (
    <a
      href={to}
      style={{ textDecoration: "none", color: "inherit" }}
      aria-label={`${title}: ${desc}`}
    >
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.iconWrap}>{icon}</div>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={styles.arrow} aria-hidden>
            <path d="M5 12h12M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={styles.cardBody}>
          <h3 style={styles.cardTitle}>{title}</h3>
          <p style={styles.cardDesc}>{desc}</p>
        </div>
      </div>
    </a>
  );
}

/* ---------- icons (inline SVG) ---------- */

function IconDatabase() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse cx="12" cy="5" rx="7" ry="3" stroke="#155EEF" strokeWidth="2"/>
      <path d="M5 5v6c0 1.66 3.13 3 7 3s7-1.34 7-3V5" stroke="#155EEF" strokeWidth="2"/>
      <path d="M5 11v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" stroke="#155EEF" strokeWidth="2" opacity=".6"/>
    </svg>
  );
}

function IconReceipt() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 3h10v18l-3-2-2 2-2-2-3 2V3Z" stroke="#155EEF" strokeWidth="2"/>
      <path d="M9 7h6M9 11h6M9 15h4" stroke="#155EEF" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 19h16" stroke="#155EEF" strokeWidth="2" strokeLinecap="round"/>
      <rect x="6" y="12" width="3" height="6" rx="1" stroke="#155EEF" strokeWidth="2"/>
      <rect x="11" y="9" width="3" height="9" rx="1" stroke="#155EEF" strokeWidth="2" opacity=".85"/>
      <rect x="16" y="6" width="3" height="12" rx="1" stroke="#155EEF" strokeWidth="2" opacity=".7"/>
    </svg>
  );
}

function IconTable() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="#155EEF" strokeWidth="2"/>
      <path d="M3 9h18M9 5v14M15 5v14" stroke="#155EEF" strokeWidth="2"/>
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
    width: "100%",
    marginBottom: 10,
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
    minHeight: 132,
    boxShadow: "0 8px 24px rgba(17,24,39,.06)",
    transition: "transform .12s ease, box-shadow .12s ease",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "rgba(21,94,239,.06)",
    display: "grid",
    placeItems: "center",
    boxShadow: "inset 0 0 0 1px rgba(21,94,239,.12)",
  },
  arrow: {
    color: "#155EEF",
  },
  cardBody: {
    display: "grid",
    gap: 6,
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
  note: {
    width: "100%",
    textAlign: "center",
    marginTop: 6,
  },
};

/* optional global hover effect */
(function injectHoverOnce() {
  if (document.getElementById("upload-data-hover")) return;
  const style = document.createElement("style");
  style.id = "upload-data-hover";
  style.innerHTML = `
    a > div[style*="box-shadow"] { will-change: transform; }
    a > div[style*="box-shadow"]:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(17,24,39,.1); }
    a > div[style*="box-shadow"]:hover svg[aria-hidden] { transform: translateX(2px); transition: transform .12s ease; }
  `;
  document.head.appendChild(style);
})();

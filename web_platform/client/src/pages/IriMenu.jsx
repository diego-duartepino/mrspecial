import Page from "../components/Page";
// Page already shows BackLink (except on "/")
// import Button from "../components/Button";

export default function IriMenu() {
  return (
    <Page
      title="IRI Tools"
      subtitle="Choose a helper to upload or enrich IRI data"
      maxWidth={980}
    >
      {/* quick links (keeps original functionality) */}
      {/* <div style={styles.quickRow}>
        <Button to="/upload/iri/category-brand">Category-Brand</Button>
        <Button to="/upload/iri/items">Items</Button>
      </div> */}

      {/* pretty cards (same destinations) */}
      <div style={styles.grid}>
        <IriCard
          to="/upload/iri/category-brand"
          title="Category-Brand"
          desc="Upload category-brand mappings or enrich existing datasets."
          icon={<IconTag />}
        />
        <IriCard
          to="/upload/iri/items"
          title="Items"
          desc="Upload and process IRI items for monthly updates."
          icon={<IconList />}
        />
      </div>

      <div style={styles.note}>
        <small style={{ color: "#64748b" }}>
          Tip: Keep your headers consistent (e.g., <code>Brand</code>, <code>Category</code>, <code>Product IRI</code>) for smoother processing.
        </small>
      </div>
    </Page>
  );
}

/* ---------- small components ---------- */

function IriCard({ to, title, desc, icon }) {
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

function IconTag() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M20 13L11 4H4v7l9 9 7-7Z" stroke="#155EEF" strokeWidth="2" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="#155EEF" />
    </svg>
  );
}

function IconList() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 6h11M9 12h11M9 18h11" stroke="#155EEF" strokeWidth="2" strokeLinecap="round" />
      <circle cx="4.5" cy="6" r="1.5" fill="#155EEF" />
      <circle cx="4.5" cy="12" r="1.5" fill="#155EEF" />
      <circle cx="4.5" cy="18" r="1.5" fill="#155EEF" />
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

/* optional hover effect */
(function injectHoverOnce() {
  if (typeof document === "undefined") return;
  if (document.getElementById("iri-menu-hover")) return;
  const style = document.createElement("style");
  style.id = "iri-menu-hover";
  style.innerHTML = `
    a > div[style*="box-shadow"] { will-change: transform; }
    a > div[style*="box-shadow"]:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(17,24,39,.1); }
    a > div[style*="box-shadow"]:hover svg[aria-hidden] { transform: translateX(2px); transition: transform .12s ease; }
  `;
  document.head.appendChild(style);
})();

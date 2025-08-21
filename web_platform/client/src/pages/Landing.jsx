import Page from "../components/Page";
import Button from "../components/Button";

export default function Landing() {
  return (
    <Page title={null} maxWidth={980}>
      {/* local keyframes */}
      <style>{`
        @keyframes float { 0%{transform:translateY(0)} 50%{transform:translateY(-4px)} 100%{transform:translateY(0)} }
      `}</style>

      <div style={styles.hero}>
        {/* decorative blobs */}
        <div aria-hidden style={{ ...styles.blob, ...styles.blobA }} />
        <div aria-hidden style={{ ...styles.blob, ...styles.blobB }} />

        <span style={styles.badge}>Mr Special</span>
        <h1 style={styles.title}>Data Analyst Tool</h1>
        <p style={styles.subtitle}>
          Upload. Process. Visualize. <span style={{ whiteSpace: "nowrap" }}>All local.</span>
        </p>

        <div style={styles.actions}>
          <Button to="/hub">Get Started</Button>
          <a href="/metabase" style={styles.ghostBtn}>Open Metabase</a>
        </div>

        {/* preview tiles */}
        <div style={styles.tiles}>
          <Tile label="Upload Data" hint="Excel" />
          <Tile label="IRI Tools" hint="Items • Category-Brand" />
          <Tile label="Reports" hint="POS • PMR" />
        </div>
      </div>

      {/* mini features */}
      <div style={styles.features}>
        <Feature title="Fast local dev" desc="React + Flask proxy for instant feedback." />
        <Feature title="File uploads" desc="Drag & drop with validation and previews." />
        <Feature title="Clean JSON API" desc="Simple endpoints you can extend safely." />
      </div>

      <div style={styles.footerNote}>
        Tip: bookmark <code>/hub</code> for quick access.
      </div>
    </Page>
  );
}

function Tile({ label, hint }) {
  return (
    <div style={styles.tile}>
      <div style={styles.dot} />
      <div>
        <div style={styles.tileLabel}>{label}</div>
        <div style={styles.tileHint}>{hint}</div>
      </div>
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div style={styles.feature}>
      <div style={styles.featureIcon} />
      <div>
        <div style={styles.featureTitle}>{title}</div>
        <div style={styles.featureDesc}>{desc}</div>
      </div>
    </div>
  );
}

const styles = {
  hero: {
    position: "relative",
    textAlign: "center",
    padding: "28px 16px 12px",
  },
  badge: {
    display: "inline-block",
    fontSize: 12,
    fontWeight: 700,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(21,94,239,.08)",
    color: "#155EEF",
    border: "1px solid rgba(21,94,239,.18)",
    marginBottom: 10,
  },
  title: {
    margin: "6px 0 8px",
    fontSize: 34,
    lineHeight: 1.1,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: "#0f172a",
  },
  subtitle: {
    margin: 0,
    fontSize: 16,
    color: "#475569",
  },
  actions: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  ghostBtn: {
    padding: "10px 18px",
    borderRadius: 999,
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#0f172a",
    textDecoration: "none",
    fontWeight: 600,
  },
  tiles: {
    marginTop: 12,
    display: "grid",
    gap: 10,
    gridTemplateColumns: "repeat(3, minmax(0,1fr))",
  },
  tile: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    background: "#fff",
    border: "1px solid #eef2ff",
    boxShadow: "0 6px 18px rgba(17,24,39,.06)",
    animation: "float 6s ease-in-out infinite",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#155EEF",
    boxShadow: "0 0 0 6px rgba(21,94,239,.12)",
  },
  tileLabel: {
    fontWeight: 700,
    fontSize: 14,
    color: "#111827",
  },
  tileHint: {
    fontSize: 12,
    color: "#64748b",
  },
  features: {
    display: "grid",
    gap: 12,
    gridTemplateColumns: "repeat(3, minmax(0,1fr))",
    marginTop: 8,
  },
  feature: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 14,
    background: "#f8fafc",
    border: "1px solid #eef2ff",
  },
  featureIcon: {
    width: 10,
    height: 10,
    marginTop: 6,
    borderRadius: 2,
    background: "#155EEF",
  },
  featureTitle: {
    fontWeight: 700,
    fontSize: 14,
    color: "#0f172a",
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: "#475569",
  },
  footerNote: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 12,
    color: "#64748b",
  },
  blob: {
    position: "absolute",
    filter: "blur(30px)",
    opacity: 0.55,
    zIndex: -1,
  },
  blobA: {
    top: -40,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: "50%",
    background: "radial-gradient(circle at 30% 30%, #bfdbfe, rgba(191,219,254,0))",
  },
  blobB: {
    bottom: -50,
    left: -30,
    width: 220,
    height: 220,
    borderRadius: "50%",
    background: "radial-gradient(circle at 60% 40%, #c7d2fe, rgba(199,210,254,0))",
  },
};

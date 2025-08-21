import { useLocation } from "react-router-dom";
import BackLink from "./BackLink";

// src/components/Page.js
export default function Page({ title, subtitle, actions, children, maxWidth = 840, showBack = true }) {
  const { pathname } = useLocation();
  const shouldShowBack = showBack && pathname !== "/";

  return (
    <div style={styles.wrap}>
      {/* tiny animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }
      `}</style>

      <div style={{ ...styles.card, width: `min(${maxWidth}px, 92vw)` }}>
        {shouldShowBack && <BackLink variant="link" />}

        {(title || actions) && (
          <header style={styles.header}>
            <div>
              {title && <h1 style={styles.title}>{title}</h1>}
              {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
            </div>
            {actions && <div style={styles.actions}>{actions}</div>}
          </header>
        )}

        <div style={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "32px 16px",
    background:
      "radial-gradient(1200px 600px at 100% -10%, #e8efff 0%, rgba(232,239,255,0) 60%), " +
      "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
    color: "#111",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  card: {
    background: "#fff",
    border: "1px solid #eef2ff",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 10px 28px rgba(17, 24, 39, 0.08)",
    animation: "fadeIn .25s ease",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: 24,
    lineHeight: 1.2,
    fontWeight: 800,
    letterSpacing: "-0.01em",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#475569",
    fontSize: 14,
  },
  actions: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  content: {
    display: "grid",
    gap: 16,
    justifyItems: "center",
    marginTop: 8,
  },
};

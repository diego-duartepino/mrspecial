import { useEffect, useMemo } from "react";

export default function ExternalRedirect({
  to,
  replace = true,
  newTab = false,
  delay = 0,          // ms before navigating
  title = "Redirecting…",
  message,            // optional custom message
  ctaText = "Open now",
}) {
  // Compute a friendly label for the destination (e.g., hostname)
  const targetLabel = useMemo(() => {
    try {
      const url = new URL(to, window.location.href);
      return url.hostname || to;
    } catch {
      return to;
    }
  }, [to]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (newTab) {
        window.open(to, "_blank", "noopener,noreferrer");
      } else if (replace) {
        window.location.replace(to);
      } else {
        window.location.assign(to);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [to, replace, newTab, delay]);

  return (
    <div style={styles.wrap}>
      {/* Keyframes for the spinner */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>

      <div style={styles.card}>
        {/* Spinner */}
        <div
          aria-label="Loading"
          role="status"
          style={styles.spinner}
        />

        {/* Text */}
        <h1 style={styles.title}>{title}</h1>
        <p style={styles.subtitle}>
          {message ?? <>Taking you to <strong>{targetLabel}</strong>…</>}
        </p>

        {/* Actions */}
        <div style={styles.actions}>
          <a
            href={to}
            target={newTab ? "_blank" : "_self"}
            rel="noopener noreferrer"
            style={styles.primary}
          >
            {ctaText}
          </a>
          <button
            type="button"
            onClick={() => window.history.back()}
            style={styles.secondary}
          >
            Go back
          </button>
        </div>

        {/* No-JS fallback */}
        <noscript>
          <p style={{ marginTop: 12 }}>
            JavaScript is disabled. <a href={to}>Click here</a> to continue.
          </p>
        </noscript>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#fff",
    animation: "fadeIn .25s ease",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  card: {
    width: "min(560px, 92vw)",
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 16,
    padding: 24,
    textAlign: "center",
    boxShadow: "0 8px 24px rgba(0,0,0,.06)",
  },
  spinner: {
    width: 48,
    height: 48,
    margin: "0 auto 12px",
    borderRadius: "50%",
    border: "4px solid #e6e9ef",
    borderTopColor: "#155EEF",
    animation: "spin .8s linear infinite",
  },
  title: {
    margin: "6px 0 4px",
    fontSize: 22,
    fontWeight: 700,
    color: "#111",
  },
  subtitle: {
    margin: 0,
    color: "#444",
    opacity: 0.85,
  },
  actions: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    marginTop: 16,
  },
  primary: {
    padding: "10px 18px",
    borderRadius: 999,
    background: "#155EEF",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 600,
    boxShadow: "0 4px 14px rgba(21,94,239,.25)",
  },
  secondary: {
    padding: "10px 18px",
    borderRadius: 999,
    background: "#fff",
    color: "#111",
    border: "1px solid #ddd",
    cursor: "pointer",
  },
};

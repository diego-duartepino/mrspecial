import { Link, useNavigate } from "react-router-dom";

// inject styles once
(function injectBackLinkStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("backlink-styles")) return;
  const style = document.createElement("style");
  style.id = "backlink-styles";
  style.textContent = `
    .bl {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      text-decoration: none;
      background: #fff;
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
      border-radius: 999px;
      cursor: pointer;
      transition: transform .12s ease, box-shadow .12s ease, background .12s ease, border-color .12s ease, color .12s ease;
      box-shadow: 0 1px 0 rgba(0,0,0,.02);
    }
    .bl svg { color: #155EEF; }
    .bl:hover {
      transform: translateX(-2px);
      box-shadow: 0 8px 20px rgba(17,24,39,.08);
      border-color: #dbeafe;
      background: #f8fafc;
    }
    .bl:focus-visible {
      outline: none;
      box-shadow: 0 0 0 4px rgba(21,94,239,.15);
      border-color: #bfdbfe;
    }
    .bl--link {
      background: transparent;
      border: none;
      padding: 0;
      font-weight: 600;
      color: #155EEF;
    }
    .bl--link:hover { text-decoration: underline; transform: none; box-shadow: none; }
    .bl--muted { color: #111; opacity: .85; }
  `;
  document.head.appendChild(style);
})();

export default function BackLink({
  to,
  label = "Back",
  variant = "pill",     // "pill" | "link"
  className = "",
  style,
}) {
  const nav = useNavigate();
  const cls = `bl ${variant === "link" ? "bl--link bl--muted" : ""} ${className}`.trim();
  const baseStyle = { alignSelf: "start", margin: "8px 0 8px 8px", ...style };

  const Content = (
    <>
      <ArrowLeft />
      <span>{label}</span>
    </>
  );

  return to ? (
    <Link to={to} className={cls} style={baseStyle} aria-label={label} title={label}>
      {Content}
    </Link>
  ) : (
    <button
      type="button"
      onClick={() => nav(-1)}
      className={cls}
      style={baseStyle}
      aria-label={label}
      title={label}
    >
      {Content}
    </button>
  );
}

function ArrowLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

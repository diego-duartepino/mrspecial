export default function Button({ children, onClick, to, type="button" }) {
  const base = {
    padding: "10px 18px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    background: "#155EEF",
    color: "#fff",
    lineHeight: 1.1,
    textDecoration: "none",
    display: "inline-block",
    boxShadow: "0 4px 14px rgba(21,94,239,0.25)"
  };

  if (to) {
    return <a href={to} style={base}>{children}</a>;
  }
  return <button type={type} onClick={onClick} style={base}>{children}</button>;
}

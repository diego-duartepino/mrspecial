export function Field({ label, value, onChange, type="text", placeholder }) {
  return (
    <div style={{ width: "min(420px, 92vw)" }}>
      <div style={{
        background: "#eee",
        borderRadius: 999,
        padding: 8,
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 6
      }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || label}
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            padding: "4px 10px",
            fontSize: 15
          }}
        />
      </div>
    </div>
  );
}

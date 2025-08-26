export function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  options, // pass an array to render a <select>; supports ['A','B'] or [{label:'A', value:'a'}]
}) {
  const isSelect = Array.isArray(options) && options.length > 0;

  // normalize options to {label, value}
  const norm = isSelect
    ? options.map(o =>
        typeof o === "string" ? { label: o, value: o } : { label: o.label, value: o.value }
      )
    : [];

  return (
    <div style={{ width: "min(420px, 92vw)" }}>
      <div
        style={{
          background: "#eee",
          borderRadius: 999,
          padding: 8,
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 6,
        }}
      >
        {isSelect ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              padding: "4px 10px",
              color:'grey',
              fontSize: 15,
              width: "100%",
              // keep native arrow; remove if you later add custom chevron
              appearance: "menulist",
              WebkitAppearance: "menulist",
              MozAppearance: "menulist",
            }}
            aria-label={label || placeholder}
          >
            <option value="">{placeholder || "Select…"}</option>
            {norm.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
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
              fontSize: 15,
              width: "100%",
            }}
            aria-label={label || placeholder}
          />
        )}
      </div>
    </div>
  );
}

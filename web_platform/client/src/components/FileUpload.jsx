// src/components/FileUpload.js
import { useRef, useState } from "react";

export default function FileUpload({
  label = "Choose file",
  accept = "",
  multiple = false,
  uploadUrl,                 // e.g. "/api/upload/iri/items"
  fieldName = multiple ? "files" : "file",
  extraData = {},            // extra form fields, e.g. { source, year, month }
  onSelected,                // (filesArray) => void
  onUploaded,                // (jsonResponse) => void
  onError,                   // (message) => void
  disabled = false,
  maxSizeMB,                 // e.g. 50
}) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function selectFiles(list) {
    const arr = Array.from(list || []);
    const tooBig = maxSizeMB
      ? arr.find(f => f.size > maxSizeMB * 1024 * 1024)
      : null;
    if (tooBig) {
      const msg = `File "${tooBig.name}" exceeds ${maxSizeMB} MB.`;
      setError(msg);
      onError && onError(msg);
      return;
    }
    setError("");
    setFiles(arr);
    onSelected && onSelected(arr);
  }

  async function handleUpload() {
    if (!uploadUrl) return;
    if (!files.length) {
      const msg = "Please select a file first.";
      setError(msg);
      onError && onError(msg);
      return;
    }
    try {
      setUploading(true);
      setError("");

      const fd = new FormData();
      // append files
      if (multiple) {
        files.forEach(f => fd.append(fieldName, f));
      } else {
        fd.append(fieldName, files[0]);
      }
      // append extra fields
      Object.entries(extraData || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, String(v));
      });

      const res = await fetch(uploadUrl, { method: "POST", body: fd });
      const ct = res.headers.get("content-type") || "";
      const text = await res.text();
      if (!res.ok) {
        const msg = `Upload failed (${res.status}): ${text.slice(0, 200)}`;
        setError(msg);
        onError && onError(msg);
        return;
      }
      const json = ct.includes("application/json")
        ? JSON.parse(text)
        : { ok: true, raw: text };
      onUploaded && onUploaded(json);
    } catch (e) {
      const msg = String(e);
      setError(msg);
      onError && onError(msg);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ width: "min(520px, 92vw)" }}>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled) return;
          if (!multiple && e.dataTransfer.files.length > 1) {
            const msg = "This field accepts only one file.";
            setError(msg);
            onError && onError(msg);
            return;
          }
          selectFiles(e.dataTransfer.files);
        }}
        style={{
          cursor: disabled ? "not-allowed" : "pointer",
          borderRadius: 16,
          padding: 18,
          border: `2px dashed ${dragOver ? "#155EEF" : "#ddd"}`,
          background: dragOver ? "rgba(21,94,239,0.05)" : "#fafafa",
          textAlign: "center",
          transition: "all .12s ease",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          style={{ display: "none" }}
          onChange={(e) => selectFiles(e.target.files)}
        />
        <div style={{ fontWeight: 700, marginBottom: 6 }}>
          {label}
        </div>
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 10 }}>
          Drag & drop {multiple ? "files" : "a file"} here, or click to browse{accept ? ` (${accept})` : ""}.
          {maxSizeMB ? ` Max ${maxSizeMB} MB.` : ""}
        </div>

        {files.length > 0 && (
          <div style={{
            textAlign: "left",
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 10,
            marginTop: 8,
          }}>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
              Selected:
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {files.map((f, i) => (
                <li key={i} style={{ fontSize: 14 }}>
                  {f.name} <span style={{ opacity: 0.7 }}>({(f.size/1024/1024).toFixed(2)} MB)</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {uploadUrl && (
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={handleUpload}
              disabled={disabled || uploading}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                border: "none",
                fontWeight: 600,
                background: uploading ? "#94b2ff" : "#155EEF",
                color: "#fff",
                cursor: disabled || uploading ? "default" : "pointer",
                boxShadow: "0 4px 14px rgba(21,94,239,0.25)",
              }}
            >
              {uploading ? "Uploading..." : "Attach"}
            </button>
            {files.length > 0 && !uploading && (
              <button
                type="button"
                onClick={() => setFiles([])}
                style={{
                  marginLeft: 8,
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            )}
          </div>
        )}

        {error && (
          <div style={{ color: "crimson", marginTop: 10, fontSize: 13, whiteSpace: "pre-wrap" }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

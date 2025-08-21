# app.py (Flask)
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.get("/api/ping")
def ping():
    return jsonify({"ok": True, "pong": True})

@app.post("/api/upload/iri/items")
def upload_iri_items():
    data = request.get_json(silent=True) or {}
    # TODO: handle 'source', 'year', 'month'
    return jsonify({"ok": True, "received": data})

@app.post("/api/upload/iri/category-brand")
def upload_iri_category_brand():
    data = request.get_json(silent=True) or {}
    # TODO: handle 'source', 'year', 'month'
    return jsonify({"ok": True, "received": data})

if __name__ == "__main__":
    app.run(port=5001, debug=True)  # avoid AirPlay conflict on macOS

# app.py (Flask)
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import sys, os

# add project root (so 'automation' is importable)
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from automation.etl.pos import main as pos_main  # noqa

app = Flask(__name__)

# allow both localhost & 127.0.0.1 frontends
CORS(
    app,
    resources={r"/api/*": {"origins": [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "OPTIONS"]
)

@app.get("/api/ping")
def ping():
    return jsonify({"ok": True, "pong": True})

@app.post("/api/upload/iri/items")
def upload_iri_items():
    data = request.get_json(silent=True) or {}
    return jsonify({"ok": True, "received": data})

@app.post("/api/upload/iri/category-brand")
def upload_iri_category_brand():
    data = request.get_json(silent=True) or {}
    return jsonify({"ok": True, "received": data})

# 👇 register BEFORE app.run and allow OPTIONS
@app.route("/api/upload/pos/trigger", methods=["POST", "OPTIONS"])
@cross_origin(origins=["http://localhost:3000", "http://127.0.0.1:3000"])
def upload_pos_trigger():
    if request.method == "OPTIONS":
        # make preflight return 204 with CORS headers
        return ("", 204)
    data = request.get_json(silent=True) or {}
    print("Received data:", data)
    # pos_main(['DailyTotals_Products_By_SKU'])
    return jsonify({"ok": True, "received": data})

# 👇 register BEFORE app.run and allow OPTIONS
@app.route("/api/upload/pmr/trigger", methods=["POST", "OPTIONS"])
@cross_origin(origins=["http://localhost:3000", "http://127.0.0.1:3000"])
def upload_pmr_trigger():
    if request.method == "OPTIONS":
        # make preflight return 204 with CORS headers
        return ("", 204)
    data = request.get_json(silent=True) or {}
    print("Received data:", data)
    # pos_main(['DailyTotals_Products_By_SKU'])
    return jsonify({"ok": True, "received": data})

@app.route("/api/tables/create", methods=["POST", "OPTIONS"])
@cross_origin(origins=["http://localhost:3000", "http://127.0.0.1:3000"])
def create_table_trigger():
    if request.method == "OPTIONS":
        # make preflight return 204 with CORS headers
        return ("", 204)
    data = request.get_json(silent=True) or {}
    print("Received data:", data)
    # pos_main(['DailyTotals_Products_By_SKU'])
    return jsonify({"ok": True, "received": data})




if __name__ == "__main__":
    # keep host consistent with what you fetch
    app.run(host="127.0.0.1", port=5001, debug=True)  # avoid AirPlay conflict on macOS

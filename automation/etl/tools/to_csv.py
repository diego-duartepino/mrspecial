import os
import pandas as pd

input_folder = "/Volumes/T7/duartepino-data/Categories/r5/"
output_folder = "/Volumes/T7/duartepino-data/Categories/r5/csv"

os.makedirs(output_folder, exist_ok=True)

for filename in os.listdir(input_folder):
    if filename.endswith(".xlsx"):
        excel_path = os.path.join(input_folder, filename)
        try:
            df = pd.read_excel(excel_path, engine="openpyxl")
            csv_filename = os.path.splitext(filename)[0] + ".csv"
            csv_path = os.path.join(output_folder, csv_filename)
            df.to_csv(csv_path, index=False, encoding="utf-8")
            print(f"✅ Saved: {csv_path}")
        except Exception as e:
            print(f"⚠️ Skipped {filename} — not a valid Excel file. Error: {e}")

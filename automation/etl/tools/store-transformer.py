import pandas as pd
import re
import csv
import io

# --- Step 1: Read and decode the original CSV file ---
input_file = "./reliable_exported_tables/upc.csv"

with open(input_file, 'rb') as f:
    try:
        raw_text = f.read().decode('utf-8-sig')
    except UnicodeDecodeError:
        f.seek(0)
        raw_text = f.read().decode('utf-16-le')

# --- Step 2: Parse CSV with csv.reader to preserve commas inside quotes ---
reader = csv.reader(io.StringIO(raw_text))
rows = [row for row in reader if any(cell.strip() for cell in row)]  # Skip empty rows

# --- Step 3: Display column names ---
column_names = rows[0]  # First row usually contains headers
print("Column names:", column_names)
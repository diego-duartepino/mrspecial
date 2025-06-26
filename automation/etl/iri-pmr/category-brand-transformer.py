import numpy as np
import pandas as pd

# Load the two files
muestra_path = "./data-abril.csv"
transformada_path = "./data-transformada.csv"

# Read both CSVs
df_muestra = pd.read_csv(muestra_path)
df_transformada = pd.read_csv(transformada_path)

# Display a preview of both dataframes for analysis
df_muestra.head(), df_transformada.head()


# Step 1: Skip metadata rows and detect category/brand blocks
# The structure suggests:
# - Categories are in Unnamed:0
# - Brands are in Unnamed:1 when Unnamed:0 is NaN

# Clean up column names
df_muestra.columns = [f"col_{i}" if col.startswith("Unnamed") else col for i, col in enumerate(df_muestra.columns)]

# Prepare an output list
output = []

# Keep track of current category
current_category = None

# Loop through the rows, starting after headers
for _, row in df_muestra.iterrows():
    cat = row["col_0"]
    brand = row["col_1"]
    
    # Identify a category row
    if pd.notna(cat) and pd.notna(brand) and brand.isupper():
        current_category = cat.strip()
    
    # Identify a brand row
    elif pd.isna(cat) and pd.notna(brand) and current_category:
        # Extract for TOTAL MARKET 2025 only (col_3 to col_10 in cleaned header)
        try:
            output.append({
                "Category": current_category,
                "Brand": brand.strip(),
                "Source": "TOTAL MARKET",
                "Year": 2025,
                "Market Value (Dollars)": float(row["col_3"].replace(',', '')) if pd.notna(row["col_3"]) else 0.0,
                "Market Share (Dollars)": float(row["col_5"]) if pd.notna(row["col_5"]) else 0.0,
                "Market Volume (Selling Units)": float(row["col_7"].replace(',', '')) if pd.notna(row["col_7"]) else 0.0,
                "Market Share (Sell Units)": float(row["col_9"].replace('%', '')) / 100 if pd.notna(row["col_9"]) else 0.0,
                "Retail Price": float(row["col_11"].replace('$', '')) if pd.notna(row["col_11"]) else 0.0,
            })
        except Exception as e:
            print(f"Error parsing row: {row}, Error: {e}")
            continue

# Convert to DataFrame
df_result = pd.DataFrame(output)

df_sorted = df_result.sort_values(by="Brand", ascending=False).reset_index(drop=True)

df_sorted_by_category = df_result.sort_values(by=["Category", "Brand"], ascending=[True, False]).reset_index(drop=True)

df_sorted_by_category.to_csv("processed_data_sorted_by_category.csv", index=False)


print(df_sorted_by_category)

# Display the transformed data
# import ace_tools as tools; tools.display_dataframe_to_user(name="Data Transformada desde Muestra", dataframe=df_result)

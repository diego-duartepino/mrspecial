import os

folder_path = "/Users/dlaboy/Documents/GitHub/mrspecial/automation/etl/iri-pmr/left_to_upload/"

# List all files and filter only CSV files
csv_files = [f for f in os.listdir(folder_path) if f.endswith(".csv")]

for t in csv_files:
    csv_name = os.path.splitext(t)[0]
    print(f"Processing file: {csv_name}")


# print(csv_files)
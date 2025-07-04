import sys
import os

import psycopg2

# Add parent directory to import path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from etl import ETL 
    # Define the tables you want to extract
tables_to_extract = [
    # "iri category-brand total market 2023"
    # 'IRI CATEGORY-BRAND TOTAL MARKET 2023',
    # 'IRI CATEGORY-BRAND TOTAL MARKET 2024',
    # 'IRI CATEGORY-BRAND TOTAL MARKET 2025',
    # 'IRI ITEMS BIG CHAIN 2022',
    # 'IRI ITEMS BIG CHAIN 2023',
    # 'IRI ITEMS BIG CHAIN 2024',
    # 'IRI ITEMS BIG CHAIN 2025',
    # 'IRI ITEMS MR SPECIAL 2022',
    # 'IRI ITEMS MR SPECIAL 2023',
    # 'IRI ITEMS MR SPECIAL 2024',
    # 'IRI ITEMS MR SPECIAL 2025',
    # 'IRI ITEMS TOTAL MARKET 2022',
    # 'IRI ITEMS TOTAL MARKET 2023',
    # 'IRI ITEMS TOTAL MARKET 2024',
    # 'IRI ITEMS TOTAL MARKET 2025',
    "StoreSalesByUPC_2024_to_Q1_2025"
]

def get_tables_with_nulls(tables):
    import psycopg2

    user = os.getenv("PG_USER")
    password = os.getenv("PG_PASSWORD")
    host = os.getenv("PG_HOST")
    port = os.getenv("PG_PORT", 5432)
    database = os.getenv("PG_DB")

    conn = psycopg2.connect(
        dbname=database, user=user, password=password, host=host, port=port
    )
    cursor = conn.cursor()

    tables_with_nulls = []

    for table in tables:
        cursor.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = %s
        """, (table.lower(),))
        columns = [row[0] for row in cursor.fetchall()]

        for col in columns:
            cursor.execute(f'SELECT 1 FROM "{table}" WHERE "{col}" IS NULL LIMIT 1')
            if cursor.fetchone():
                print(f"⚠️ NULL found in table '{table}', column '{col}'")
                tables_with_nulls.append(table)
                break  # No need to check other columns for this table

    cursor.close()
    conn.close()

    return tables_with_nulls


def main(tables_with_nulls):
    etl = ETL()


    # Choose your source and target
    source_server = 'postgres'   # or 'postgres'
    target_server = 'postgres'    # or extend to 'sqlserver' if implemented

    # Step 1: Extract data from the source DB
    extracted_data = etl.extract(tables=tables_with_nulls, source=source_server, output_dir='./exported_tables')
    
    # Save to CSV
    extracted_data.to_csv('upc.csv', index=False)

    # # Step 2: Transform the extracted data
    # transformed_data = etl.transform_iri(extracted_data)

    # # # Step 3: Load the transformed data into the target DB
    etl.close()
    # etl.load(transformed_data, target=target_server)

    # # Step 4: Close both connections

if __name__ == '__main__':
    # tables_with_nulls = get_tables_with_nulls(tables_to_extract)
    # if tables_with_nulls:
    #     print(f"\n🚨 Running ETL for tables with NULLs: {tables_with_nulls}")
    # else:
    #     print("✅ All tables are clean — no NULLs found.")
    # main(tables_with_nulls)
    main(tables_to_extract)

import sys
import os

import psycopg2

from datetime import date, timedelta

# Add parent directory to import path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from etl import ETL 
    # Define the tables you want to extract
tables_to_extract = [
    # "iri category-brand total market 2023",
    # "StoreSalesByProductId"
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
    'DailyTotals_Products_By_SKU'
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

def updateBITables():
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

    yesterday = date.today() - timedelta(days=1)

    # cursor.execute(f"""
    # INSERT INTO "StoreSaleByDept_2024_to_Q1_2025" (
    # "Sales_Date", "Store", "SKU",
    # "Qty_Sold", "Total_Sold", "Weight_Sold", "PRO5_ProductId"
    # )
    # SELECT
    # TO_TIMESTAMP("TransactionDate", 'YYYY-MM-DD'),
    # "LocationId"::bigint, "SKU"::bigint,
    # "QtySold"::numeric, "TotalSold"::numeric, "WeightSold"::numeric, "PRO5_ProductId"::numeric
    # FROM "DailyTotals_Products_By_SKU"
    # WHERE TO_DATE("TransactionDate", 'YYYY-MM-DD') >= DATE '{yesterday}'
    # AND "SKU"::bigint < 100
    # AND "PRO5_ProductId"::numeric = 0.0;
    # """)
    cursor.execute(f"""
    INSERT INTO "StoreSaleByDept_2024_to_Q1_2025" (
    "Sales_Date", "Store", "SKU",
    "Qty_Sold", "Total_Sold", "Weight_Sold", "PRO5_ProductId"
    )
    SELECT
    TO_TIMESTAMP("TransactionDate", 'YYYY-MM-DD'),
    "LocationId"::bigint, "SKU"::bigint,
    "QtySold"::numeric, "TotalSold"::numeric, "WeightSold"::numeric, "PRO5_ProductId"::numeric
    FROM "DailyTotals_Products_By_SKU"
    WHERE TO_DATE("TransactionDate", 'YYYY-MM-DD') >= DATE '{yesterday}'
    AND "SKU"::bigint < 100
    AND "PRO5_ProductId"::numeric = 0.0;
    """)
    print("Query #1 Done")
    # cursor.execute(f"""
    # INSERT INTO "StoreSalesByUPC_2024_to_Q1_2025" (
    # "Sales_Date", "Store", "SBO_ProductId", "PRO5_ProductId", "SKU",
    # "Prod_Brand", "Prod_Descr", "Prod_PackSize", "ItemGroup",
    # "Department", "SubDepartment", "POSDepartment",
    # "Qty_Sold", "Total_Sold", "Weight_Sold"
    # )
    # SELECT
    # "TransactionDate", "LocationId"::bigint, "SBO_ProductId"::numeric, "PRO5_ProductId"::numeric, "SKU"::bigint,
    # "Brand", "Description", "PackSize", "ItemGroup",
    # "Department", "SubDepartment", "POSDepartment",
    # "QtySold"::numeric, "TotalSold"::numeric, "WeightSold"::numeric
    # FROM "DailyTotals_Products_By_SKU"
    # WHERE TO_DATE("TransactionDate", 'YYYY-MM-DD') >= DATE '{yesterday}' AND "SKU"::bigint>=100 AND "PRO5_ProductId"::numeric != 0.0;
    # """)
    cursor.execute(f"""
    INSERT INTO "StoreSalesByUPC_2024_to_Q1_2025" (
    "Sales_Date", "Store", "SBO_ProductId", "PRO5_ProductId", "SKU",
    "Prod_Brand", "Prod_Descr", "Prod_PackSize", "ItemGroup",
    "Department", "SubDepartment", "POSDepartment",
    "Qty_Sold", "Total_Sold", "Weight_Sold"
    )
    SELECT
    "TransactionDate", "LocationId"::bigint, "SBO_ProductId"::numeric, "PRO5_ProductId"::numeric, "SKU"::bigint,
    "Brand", "Description", "PackSize", "ItemGroup",
    "Department", "SubDepartment", "POSDepartment",
    "QtySold"::numeric, "TotalSold"::numeric, "WeightSold"::numeric
    FROM "DailyTotals_Products_By_SKU"
    WHERE TO_DATE("TransactionDate", 'YYYY-MM-DD') >= DATE '{yesterday}' AND "SKU"::bigint>=100 AND "PRO5_ProductId"::numeric != 0.0;
    """)
    print("Query #2 Done")
    # cursor.execute(f"""
    # INSERT INTO "StoreSalesUnkUPC_2024_to_Q1_2025" (
    # "Sales_Date", "Store", "PRO5_ProductId",
    # "Qty_Sold", "Total_Sold", "Weight_Sold"
    # )
    # SELECT
    # "TransactionDate", "LocationId"::bigint, "PRO5_ProductId"::numeric,
    # "QtySold"::numeric, "TotalSold"::numeric, "WeightSold"::numeric
    # FROM "DailyTotals_Products_By_SKU"
    # WHERE TO_DATE("TransactionDate", 'YYYY-MM-DD') >= DATE '{yesterday}' AND "SKU"::bigint>=100 AND "PRO5_ProductId"::numeric = 0.0;
    # """)
    cursor.execute(f"""
    INSERT INTO "StoreSalesUnkUPC_2024_to_Q1_2025" (
    "Sales_Date", "Store", "PRO5_ProductId",
    "Qty_Sold", "Total_Sold", "Weight_Sold"
    )
    SELECT
    "TransactionDate", "LocationId"::bigint, "PRO5_ProductId"::numeric,
    "QtySold"::numeric, "TotalSold"::numeric, "WeightSold"::numeric
    FROM "DailyTotals_Products_By_SKU"
    WHERE TO_DATE("TransactionDate", 'YYYY-MM-DD') >= DATE '{yesterday}' AND "SKU"::bigint>=100 AND "PRO5_ProductId"::numeric = 0.0;
    """)
    print("Query #3 Done")

    conn.commit()
    cursor.close()
    conn.close()
    return "Successfully Updated BI Tables!"

def updateMetabaseTables():
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

    yesterday = date.today() - timedelta(days=1)

    cursor.execute(f"""
    INSERT INTO "StoreSales"
    SELECT
        "Sales_Date",
        "Store",
        "SBO_ProductId",
        "PRO5_ProductId",
        "SKU",
        "Prod_Brand",
        "Prod_Descr",
        "Prod_PackSize",
        "ItemGroup",
        "Department",
        "SubDepartment",
        "POSDepartment",
        "Qty_Sold",
        "Total_Sold",
        "Weight_Sold",
        'StoreSalesByUPC' AS "Source"
    FROM "StoreSalesByUPC_2024_to_Q1_2025"
    WHERE TO_DATE("Sales_Date", 'YYYY-MM-DD') >= DATE '{yesterday}';
    """)
    print("Query #1 Done")
    cursor.execute(f"""
    INSERT INTO "StoreSales" (
    "Sales_Date",
    "Store",
    "SBO_ProductId",
    "PRO5_ProductId",
    "SKU",
    "Prod_Brand",
    "Prod_Descr",
    "Prod_PackSize",
    "ItemGroup",
    "Department",
    "SubDepartment",
    "POSDepartment",
    "Qty_Sold",
    "Total_Sold",
    "Weight_Sold",
    "Source"
    )
    SELECT
    "Sales_Date",
    "Store",
    0 AS "SBO_ProductId",
    0 AS "PRO5_ProductId",
    "SKU",
    NULL AS "Prod_Brand",
    NULL AS "Prod_Descr",
    NULL AS "Prod_PackSize",
    NULL AS "Item Group",
    NULL AS "Department",
    NULL AS "SubDepartment",
    NULL AS "POSDepartment",
    "Qty_Sold",
    "Total_Sold",
    "Weight_Sold",
    'StoreSaleByDept' as "Source"
    FROM "StoreSaleByDept_2024_to_Q1_2025"
    WHERE "Sales_Date"::date >= DATE '{yesterday}';
    """)
    print("Query #2 Done")
    cursor.execute(f"""
        INSERT INTO "StoreSales" (
    "Sales_Date",
    "Store",
    "SBO_ProductId",
    "PRO5_ProductId",
    "SKU",
    "Prod_Brand",
    "Prod_Descr",
    "Prod_PackSize",
    "ItemGroup",
    "Department",
    "SubDepartment",
    "POSDepartment",
    "Qty_Sold",
    "Total_Sold",
    "Weight_Sold",
        "Source"
    )
    SELECT
    "Sales_Date",
    "Store",
    0 AS "SBO_ProductId",
    0 AS "PRO5_ProductId",
    "SKU",
    NULL AS "Prod_Brand",
    NULL AS "Prod_Descr",
    NULL AS "Prod_PackSize",
    NULL AS "Item Group",
    NULL AS "Department",
    NULL AS "SubDepartment",
    NULL AS "POSDepartment",
    "Qty_Sold",
    "Total_Sold",
    "Weight_Sold",
    'StoreSalesUnkUPC' as "Source"
    FROM "StoreSalesUnkUPC_2024_to_Q1_2025"
    WHERE TO_DATE("Sales_Date", 'YYYY-MM-DD') >= DATE '{yesterday}';
    """)
    print("Query #3 Done")

    conn.commit()
    cursor.close()
    conn.close()
    return "Successfully Updated Metabase Tables!"



def remove_csv_file(file_path):
    """
    Removes a .csv file at the given file_path.

    Args:
        file_path (str): Full path to the .csv file.
    """
    if file_path.endswith('.csv'):
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"File removed: {file_path}")
        else:
            print(f"File not found: {file_path}")
    else:
        print("The specified file is not a .csv file.")


def main(tables):
    etl = ETL()


    # Choose your source and target
    source_server = 'sqlserver'   # or 'postgres'
    target_server = 'postgres'    # or extend to 'sqlserver' if implemented

    # Step 1: Extract data from the source DB
    extracted_data = etl.extract(tables=tables, source=source_server, output_dir='./exported_tables')

    # Step 2: Transform the extracted data
    transformed_data = etl.transform(extracted_data)

    # # Step 3: Load the transformed data into the target DB

    etl.close()
    etl.load(transformed_data, target=target_server)
    # updateBITables()
    # updateMetabaseTables()
    # remove_csv_file('exported_tables/db_mrspecialdw_DailyTotals_Products_By_SKU.csv')
    

    # # Step 4: Close both connections

if __name__ == '__main__':
    # tables_with_nulls = get_tables_with_nulls(tables_to_extract)
    # if tables_with_nulls:
    #     print(f"\n🚨 Running ETL for tables with NULLs: {tables_with_nulls}")
    #     main(tables_with_nulls)
    # else:
    #     print("✅ All tables are clean — no NULLs found.")
    main(tables_to_extract)


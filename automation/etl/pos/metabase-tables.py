import os

from datetime import date, timedelta

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
        *,
        'StoreSalesByUPC' AS "Source"
    FROM "StoreSalesByUPC_2024_to_Q1_2025"
    WHERE "Sales_Date" >= '{yesterday}';
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
    WHERE "Sales_Date" >= '{yesterday}';
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
    WHERE "Sales_Date" >= '{yesterday}';
    """)
    print("Query #3 Done")

    conn.commit()
    cursor.close()
    conn.close()
    return "Successfully Updated BI Tables!"
INSERT INTO "StoreSaleByDept_2024_to_Q1_2025" (
  "Sales_Date", "Store", "SKU",
  "Qty_Sold", "Total_Sold", "Weight_Sold", "PRO5_ProductId"
)
SELECT
  TO_TIMESTAMP("TransactionDate", 'YYYY-MM-DD'),
  "LocationId"::bigint, "SKU"::bigint,
  "QtySold"::numeric, "TotalSold"::numeric, "WeightSold"::numeric, "PRO5_ProductId"::numeric
FROM "DailyTotals_Products_By_SKU"
WHERE TO_DATE("TransactionDate", 'YYYY-MM-DD') >= DATE '2025-04-01'
  AND "SKU"::bigint < 100
  AND "PRO5_ProductId"::numeric = 0.0;
--
INSERT INTO "StoreSalesByUPC_2024_to_Q1_2025" (
  "Sales_Date", "Store", "SBO_ProductId", "PRO5_ProductId",
  "Prod_Brand", "Prod_Descr", "Prod_PackSize", "ItemGroup",
  "Department", "SubDepartment", "POSDepartment",
  "Qty_Sold", "Total_Sold", "Weight_Sold"
)
SELECT
  "TransactionDate", "LocationId"::bigint, "SBO_ProductId"::numeric, "PRO5_ProductId"::numeric,
  "Brand", "Description", "PackSize", "ItemGroup",
  "Department", "SubDepartment", "POSDepartment",
  "QtySold"::numeric, "TotalSold"::numeric, "WeightSold"::numeric
FROM "DailyTotals_Products_By_SKU"
WHERE TO_DATE("TransactionDate", 'YYYY-MM-DD') >= DATE '2025-04-01' AND "SKU"::bigint>=100 AND "PRO5_ProductId"::numeric != 0.0;

INSERT INTO "StoreSalesUnkUPC_2024_to_Q1_2025" (
  "Sales_Date", "Store", "PRO5_ProductId",
  "Qty_Sold", "Total_Sold", "Weight_Sold"
)
SELECT
  "TransactionDate", "LocationId"::bigint, "PRO5_ProductId"::numeric,
  "QtySold"::numeric, "TotalSold"::numeric, "WeightSold"::numeric
FROM "DailyTotals_Products_By_SKU"
WHERE TO_DATE("TransactionDate", 'YYYY-MM-DD') >= DATE '2025-04-01' AND "SKU"::bigint>=100 AND "PRO5_ProductId"::numeric = 0.0;


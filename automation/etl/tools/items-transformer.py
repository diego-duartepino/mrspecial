import pandas as pd
import re
import csv
import io

categories = [
    # "HOT DOGS"
    # "HOT TEA",
    # "HOUSEHOLD INSECTICIDES",
    # "HOUSEHOLD WIPES/CLOTHS",
    # "ICE CREAM/FRUIT BARS/ETC",
    # "INFANT FORMULA",
    # "JAMS/JELLIES/PRESERVES",
    # "KETCHUP",
    # "LAXATIVES",
    # "LUNCH COMBINATIONS",
    # "MALTA",
    # "MARGARINE/SPREAD",
    # "MAYONNAISE,SPREAD,WHIP",
    # "MILK ADDITIVES",
    # "MILK PRODUCT - ALL OTHER",
    # "MILK PRODUCT - CONDENSED",
    # "MILK PRODUCT - EVAPORATED",
    # "MILK PRODUCT - EXTENDED SHELVE LIFE",
    # "MILK PRODUCT - FRESH MILK",
    # "MILK PRODUCT - HALF & HALF",
    # "MILK PRODUCT - HEAVY CREAM",
    # "MILK PRODUCT - PLANT BASE",
    # "MILK PRODUCT - POWDER",
    # "MILK PRODUCT - ULTRA-HIGH TEMP.",
    # "MOPS",
    # "MOUTHWASH",
    # "NUTRITIONAL SUPP - ADULT",
    # "NUTRITIONAL SUPP - CHILD",
    # "NUTRITIONAL SUPP - SPECIALTY",
    # "NUTS",
    # "OLIVES/CAPERS",
    # "PAB - HARD SELTZER",
    # "PAB - MALTERNATIVE",
    # "PAB - RTD COCKTAILS",
    # "PANCAKE MIX",
    # "PANCAKE SYRUP",
    # "PAPER TOWEL",
    # "PASTA/PIZZA SAUCE",
    # "PET SUPPLIES (CAT LITTER)",
    # "PIMIENTOS MORRONES",
    # "POP-CORN",
    # "POWDERED DESSERTS",
    # "PREPARED DESSERTS",
    # "RAZOR BLADES",
    # "REFRIGERATED GARLIC",
    # "RICE",
    # "RTD - 100% JUICE BEVERAGES",
    # "RTD - DRINK BEVERAGES",
    # "RTD - ENERGY DRINKS",
    # "RTD - ICED TEA BEVERAGE JUICES",
    # "RTD - NECTAR BEVERAGES",
    # "RTD - SPORT BEVERAGES",
    # "RTD - TOMATO VEGETABLES JUICES",
    # "RUMS",
    # "SALAD DRESSING",
    # "SALTY SNACKS",
    # "SAZON",
    # "SHELF-STABLE VEGETABLES",
    "SLEEP AID",
    "SNACK CRACKERS",
    "SODA CRACKERS",
    "SOFRITO/RECAITO",
    "SOFT DRINKS",
    "SOUP",
    "SOUR CREAM",
    "SPONGES",
    "STOMACH RELIEF PRODUCTS",
    "SUGAR - LCS",
    "SUGAR / SUBS",
    "SUN PROTECTION PROD.",
    "SWEET COOKIES",
    "SWEET SNACKS",
    "TACO SHELLS/TORTILLAS/TACO KIT",
    "TEQUILA",
    "TOMATO - TOMATO PRODUCT",
    "TOMATO - TOMATO SAUCE",
    "TOOTHBRUSHES",
    "TOOTHPASTE",
    "TRASH BAGS",
    "VINEGAR",
    "VODKA",
    "WHIPPED CREAM",
    "WHISKY",
    "WINE - ALL OTHER COUNTRY",
    "WINE - ARGENTINA",
    "WINE - CHILE",
    "WINE - ESPANA",
    "WINE - FRANCIA",
    "WINE - GERMANY",
    "WINE - ITALY",
    "WINE - JAPON",
    "WINE - NEW ZEALAND",
    "WINE - PORTUGAL",
    "WINE - PUERTO RICO",
    "WINE - UNITED STATES",
    "WINE - URUGUAY",
    "YOGURT"


]

def sanitize_filename(name):
    # Replace / and \ with _
    return re.sub(r'[\\/]', '_', name)

for c in categories:
# --- Step 1: Read and decode the original CSV file ---
# input_file = "/Users/dlaboy/Desktop/duartepino/IRI data/Junio/Items Volume Mr.Special.csv"

    safe_c = sanitize_filename(c)
    input_file = f"/Volumes/T7/duartepino-data/Categories/r5/csv/{safe_c}.csv"
    with open(input_file, 'rb') as f:
        try:
            raw_text = f.read().decode('utf-8-sig')
        except UnicodeDecodeError:
            f.seek(0)
            raw_text = f.read().decode('utf-16-le')

    # --- Step 2: Parse CSV with csv.reader to preserve commas inside quotes ---
    reader = csv.reader(io.StringIO(raw_text))
    rows = [row for row in reader if any(cell.strip() for cell in row)]  # Skip empty rows

    # --- Step 3: Find index after "Grand Total"
    grand_total_index = None
    for i in range(3, len(rows)):
        if any("grand total" in col.lower() for col in rows[i]):
            grand_total_index = i + 1
            print(f"[INFO] Found 'Grand Total' at line {i+1}")
            break

    if grand_total_index is None:
        raise ValueError("'Grand Total' not found from line 4 onward.")

    # --- Step 4: Your original logic ---
    product_iri_values = []
    sku_iri_values = []
    product_mrspecial_values = []
    sku_mrspecial_values = []
    source_values = []
    # year_values = []

    # market_value = []
    # market_share_dollars = []
    # market_volume = []
    # market_share_units = []
    # retail_price = []
    mr_special_department = []
    category = []
    brand = []
    # cat="CAT FOOD"
    # months=[]



    sku_pattern = re.compile(r'\((\d+)\)')

    for row in rows[grand_total_index:]:
        parts = row
        # print(parts)
        if len(parts) >= 2 and parts[0].strip():
            product_iri = parts[0].strip()
            product_mrspecial = parts[1].strip()

            product_iri_values.append(product_iri)
            product_mrspecial_values.append(product_mrspecial)

            # Extract SKU IRI
            iri_match = sku_pattern.search(product_iri)
            sku_iri = iri_match.group(1) if iri_match else ''
            sku_iri_values.append(sku_iri)

            # Extract SKU MrSpecial
            mrspecial_match = sku_pattern.search(product_mrspecial)
            sku_mrspecial = mrspecial_match.group(1) if mrspecial_match else ''
            sku_mrspecial_values.append(sku_mrspecial)

            source_values.append("MR SPECIAL")
            # year_values.append("")

            def parse_value(v):
                try:
                    return float(v.replace(",", "").replace("$", "").replace("%", "").replace('"', '').strip()) if v.strip() else None
                except:
                    return None

            # market_value.append(parse_value(parts[2]))
            # market_share_dollars.append(parse_value(parts[5]))
            # market_volume.append(parse_value(parts[8]))
            # market_share_units.append(parse_value(parts[11]))
            # retail_price.append(parse_value(parts[14]))
            # months.append("June")
            mr_special_department.append("")
            category.append(c)
            brand.append("")
            # print(f"Processing: {product_iri} - {product_mrspecial}")
        else:
            product_iri_values.append('')
            product_mrspecial_values.append('')
            sku_iri_values.append('')
            sku_mrspecial_values.append('')
            source_values.append("MR SPECIAL")
            # year_values.append("2023")
            # market_value.append(0)
            # market_share_dollars.append(0)
            # market_volume.append(0)
            # market_share_units.append(0)
            # retail_price.append(0)

    # --- Step 5: Crear DataFrame base ---
    df = pd.DataFrame({
        'Product IRI': product_iri_values,
        'Product MrSpecial': product_mrspecial_values,
        'SKU IRI': sku_iri_values,
        'SKU MrSpecial': sku_mrspecial_values,
        'Source': source_values,
        # 'Year': year_values,
        # 'Market Value (Dollars)': market_value,
        # 'Market Share (Dollars)': market_share_dollars,
        # 'Market Volume (Selling Units)': market_volume,
        # 'Market Share (Sell Units)': market_share_units,
        # 'Retail Price': retail_price,
        "Mr Special Department": mr_special_department,
        "Category": category,
        "Brand": brand
        # "Month": months,
    })

    df_sorted = df.sort_values(by="Product IRI", ascending=False).reset_index(drop=True)

    # --- Step 6: Guardar resultado ---
    output_file = f"r5/{safe_c}.csv"
    df_sorted.to_csv(output_file, index=False)
    print(f"\n✅ CSV guardado como: {output_file}")

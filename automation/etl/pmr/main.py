import sys
import os
from datetime import date, timedelta
import requests  # <-- this replaces curl
from dotenv import load_dotenv
import csv
import pandas as pd
from io import StringIO


# Load environment variables from .env file (if you're using one)
load_dotenv()

# Add parent directory to import path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from etl import ETL  # Assuming you have an ETL class or function to use later

if __name__ == "__main__":
    from_date = date.today() - timedelta(days=1)
    # to_date = date.today() - timedelta(days=1) # You could also use: date.today() - timedelta(days=1)
    to_date = date.today() - timedelta(days=1) # You could also use: date.today() - timedelta(days=1)

    base_url = os.getenv('PMR_URL', 'https://www.pmrintellishelf.com/api/rawdata/shelf')
    url = f'{base_url}?from={from_date}&to={to_date}'

    token = os.getenv('token')  # Example: "Bearer eyJhbGc..."

    headers = {
        'Authorization': f'Bearer {token}'
        # "Content-Type": "application/json",
        # "Custom-Header": "value"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()

        # print("✅ Raw response:")
        # print(response.text)  # <-- Add this to see raw content

        data = response.text  # This is what's currently throwing the error
        print(f"✅ Data type: {type(data)}")
        print(f"✅ Data length: {len(data)}")
        data = data.splitlines()
        # print(f"✅ Data preview: {data[1]}")  # Print first 500 characters
        rows = []

        # Join lines into one string and use csv.reader to parse it safely
        csv_data = "\n".join(data)
        reader = csv.reader(StringIO(csv_data))

        # Skip header line
        next(reader)    

        for current_line in reader:
            if len(current_line) != 18:
                print(f"❌ Skipping row with {len(current_line)} columns: {current_line}")
                continue

            (
                id,
                date_,
                time_,
                productCode,
                category,
                brand,
                productUPC,
                productCustomerCode,
                product,
                outletCode,
                outlet,
                chain,
                facing,
                totalFacings,
                noos,
                promo,
                price,
                specialPrice
            ) = current_line

            rows.append({
                "id": id,
                "date": date_,
                "time": time_,
                "productCode": productCode,
                "category": category,
                "brand": brand,
                "productUPC": productUPC,
                "productCustomerCode": productCustomerCode,
                "product": product,
                "outletCode": outletCode,
                "outlet": outlet,
                "chain": chain,
                "facing": facing,
                "totalFacings": totalFacings,
                "noos": noos,
                "promo": promo,
                "price": price,
                "specialPrice": specialPrice
            })

        # Then create the DataFrame
        df = pd.DataFrame(rows)

        etl = ETL()
        etl.close()
        etl.load_pmr({"pmr": df}, target='postgres')
    except requests.exceptions.RequestException as e:
        print(f"❌ Error while making GET request: {e}")

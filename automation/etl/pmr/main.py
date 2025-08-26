import sys
import os
from datetime import date, timedelta, datetime
import requests
from dotenv import load_dotenv
import csv
import pandas as pd
from io import StringIO

# Cargar variables de entorno
load_dotenv()

# Añadir el directorio padre al PYTHONPATH para poder importar etl
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from etl import ETL  # asumiendo que existe un ETL con load_pmr(...)

def ingest_pmr(from_date, to_date, base_url=None, token=None):
    """
    Descarga datos PMR en CSV entre 'from_date' y 'to_date' (inclusive),
    los parsea a DataFrame y los carga con ETL en Postgres.

    Parámetros
    ----------
    from_date : date | str (YYYY-MM-DD)
    to_date   : date | str (YYYY-MM-DD)
    base_url  : str | None  -> por defecto PMR_URL o 'https://www.pmrintellishelf.com/api/rawdata/shelf'
    token     : str | None  -> por defecto env var 'token' (Bearer)

    Retorna
    -------
    pandas.DataFrame con los registros parseados.

    Lanza
    -----
    requests.exceptions.RequestException si falla la petición.
    ValueError si faltan credenciales o las fechas no son válidas.
    """

    def to_iso(d):
        if isinstance(d, date):
            return d.isoformat()
        if isinstance(d, str):
            # valida formato simple YYYY-MM-DD
            try:
                return datetime.strptime(d, "%Y-%m-%d").date().isoformat()
            except ValueError as e:
                raise ValueError(f"Fecha inválida '{d}', usa YYYY-MM-DD") from e
        raise ValueError(f"Tipo de fecha no soportado: {type(d)}")

    from_iso = to_iso(from_date)
    to_iso_s = to_iso(to_date)

    base_url = base_url or os.getenv('PMR_URL', 'https://www.pmrintellishelf.com/api/rawdata/shelf')
    token = token or os.getenv('token')
    if not token:
        raise ValueError("Falta el token (env var 'token' o parámetro 'token').")

    url = f"{base_url}?from={from_iso}&to={to_iso_s}"
    headers = {"Authorization": f"Bearer {token}"}

    # Petición
    resp = requests.get(url, headers=headers, timeout=60)
    resp.raise_for_status()

    # Texto CSV bruto
    csv_text = resp.text or ""
    # Parseo robusto usando csv.reader
    reader = csv.reader(StringIO(csv_text))

    # Saltar encabezado (si existe)
    try:
        header = next(reader)
    except StopIteration:
        # CSV vacío
        df = pd.DataFrame(columns=[
            "id","date","time","productCode","category","brand","productUPC",
            "productCustomerCode","product","outletCode","outlet","chain",
            "facing","totalFacings","noos","promo","price","specialPrice"
        ])
        return df

    rows = []
    for current_line in reader:
        if len(current_line) != 18:
            # línea inesperada, la omitimos
            continue

        (
            id_,
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
            "id": id_,
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

    df = pd.DataFrame(rows)

    # Carga vía ETL
    etl = ETL()
    try:
        etl.load_pmr({"pmr": df}, target='postgres')
    finally:
        etl.close()

    return df


# Ejecución directa (opcional): ayer -> ayer
if __name__ == "__main__":
    yday = date.today() - timedelta(days=1)
    ingest_pmr(yday, yday)

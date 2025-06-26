import os
import pyodbc
import psycopg2
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

from sqlalchemy import create_engine
import urllib
import os

def get_sqlserver_connection():
    """
    Returns a SQLAlchemy engine connected to SQL Server.
    """
    creds = {
        'server': os.getenv('SQLSERVER_SERVER'),
        'database': "db_mrspecialdw",
        'username': os.getenv('SQLSERVER_USER'),
        'password': "msp@dm1n",
        'driver': os.getenv('SQLSERVER_DRIVER', 'ODBC Driver 17 for SQL Server')
    }

    # urlencode params for SQLAlchemy
    params = urllib.parse.quote_plus(
        f"DRIVER={{{creds['driver']}}};"
        f"SERVER={creds['server']};"
        f"DATABASE={creds['database']};"
        f"UID={creds['username']};"
        f"PWD={creds['password']};"
        f"TrustServerCertificate=yes;"
    )

    try:
        engine = create_engine(f"mssql+pyodbc:///?odbc_connect={params}")
        print(f"✅ Connected to SQL Server: {creds['server']}\\{creds['database']}")
        return engine, creds
    except Exception as e:
        print(f"❌ SQL Server connection failed: {e}")
        raise


def get_postgres_connection():
    """
    Returns a SQLAlchemy engine connected to PostgreSQL.
    """
    import os

    user = os.getenv("PG_USER")
    password = os.getenv("PG_PASSWORD")
    host = os.getenv("PG_HOST")
    port = os.getenv("PG_PORT", 5432)
    database = "mrspecial_pos_db"

    try:
        engine = create_engine(f'postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}')
        print(f"✅ Connected to PostgreSQL: {host}:{port}/{database}")
        return engine, {
            "user": user,
            "host": host,
            "port": port,
            "database": database
        }
    except Exception as e:
        print(f"❌ PostgreSQL connection failed: {e}")
        raise
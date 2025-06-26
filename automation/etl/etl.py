import os
import pandas as pd
from tools.conn import get_sqlserver_connection, get_postgres_connection
from tools.transform import transform_dataframe, transform_iri_dataframe
from tools.load import load_to_postgres  # You can add load_to_sqlserver if needed
from tqdm import tqdm
import time


class ETL:
    def __init__(self):
        self.__sql_conn, self.__sql_creds = get_sqlserver_connection()
        self.__pg_conn, self.__pg_creds = get_postgres_connection()

    def extract(self, tables: list, source: str = 'sqlserver', output_dir: str = './exported_tables', chunksize: int = 100_000) -> dict:
        """
        Efficiently extract large tables in chunks using SQLAlchemy.
        Overwrites existing CSVs if they already exist.
        """
        os.makedirs(output_dir, exist_ok=True)
        dataframes = {}

        if source == 'sqlserver':
            engine = self.__sql_conn
            db_name = self.__sql_creds['database']
        elif source == 'postgres':
            engine = self.__pg_conn
            db_name = self.__pg_creds['database']
        else:
            raise ValueError("source_db must be either 'sqlserver' or 'postgres'")

        print(f"\n📦 Starting extraction from {source}...\n")

        for table in tqdm(tables, desc="Extracting tables", unit="table"):
            print(f"\n📥 Extracting: {table} from {source}")
            csv_path = os.path.join(output_dir, f"{db_name}_{table}.csv")

            # ✅ Remove existing file to start fresh
            if os.path.exists(csv_path):
                os.remove(csv_path)

            try:
                total_rows = 0
                first_chunk = True
                chunk_num = 0

                for chunk in pd.read_sql(f'SELECT * FROM \"{table}\"', engine, chunksize=chunksize):
                    chunk_num += 1
                    chunk.to_csv(csv_path, mode='a', index=False, header=first_chunk)
                    total_rows += len(chunk)
                    first_chunk = False
                    print(f"  ↪ Chunk {chunk_num}: saved {len(chunk)} rows")

                print(f"✓ Finished {table}: {total_rows} rows written to {csv_path}")
                dataframes[table] = pd.read_csv(csv_path)
            except Exception as e:
                print(f"✗ Failed to extract {table}: {e}")

        return dataframes
    def transform(self, dataframes: dict) -> dict:
        """
        Apply transformations to each DataFrame.
        """
        transformed = {}
        for table, df in dataframes.items():
            print(f"🔄 Transforming {table}...")
            transformed_df = transform_dataframe(df)
            transformed[table] = transformed_df
        return transformed

    def transform_iri(self, dataframes: dict) -> dict:
        """
        Apply transformations to each DataFrame.
        """
        transformed = {}
        for table, df in dataframes.items():
            print(f"🔄 Transforming {table}...")
            transformed_df = transform_iri_dataframe(df)
            transformed[table] = transformed_df
        return transformed

    def load(self, dataframes: dict, target: str = 'postgres'):
        """
        Load the given DataFrames into the target database.
        """
        for table, df in dataframes.items():
            print(f"🚚 Loading table: {table} into {target}")
            if target == 'postgres':
                load_to_postgres(df, table_name=table)
            else:
                raise NotImplementedError("Only PostgreSQL loading is implemented. Add more loaders if needed.")

    def close(self):
        """
        Close both SQL Server and PostgreSQL connections.
        """
        self.__sql_conn.dispose()
        self.__pg_conn.dispose()


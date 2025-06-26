import os
import time
import pandas as pd
import psycopg2
from tqdm import trange
from threading import Thread, Event
from dotenv import load_dotenv
from io import StringIO

load_dotenv()

def show_spinner(message, stop_event):
    for _ in trange(9999, desc=message, leave=False, ncols=100):
        if stop_event.is_set():
            break
        time.sleep(0.1)

def load_to_postgres(df, table_name, if_exists='replace'):
    user = os.getenv("PG_USER")
    password = os.getenv("PG_PASSWORD")
    host = os.getenv("PG_HOST")
    port = os.getenv("PG_PORT", 5432)
    database = os.getenv("PG_DB")

    quoted_table_name = f'"{table_name}"'
    total_rows = len(df)
    print(f"📦 Preparing to load {total_rows} rows to table {quoted_table_name}")

    if total_rows == 0:
        print(f"⚠️ No data to load for table {quoted_table_name}")
        return

    # Step 1: Drop table if exists
    if if_exists == 'replace':
        try:
            with psycopg2.connect(dbname=database, user=user, password=password, host=host, port=port) as conn:
                conn.set_session(autocommit=True)
                with conn.cursor() as cur:
                    cur.execute("""
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_schema = 'public' AND table_name = %s
                        )
                    """, (table_name,))
                    if cur.fetchone()[0]:
                        print(f"🔄 Dropping existing table {quoted_table_name}...")

                        # Check for blocking sessions
                        cur.execute("""
                            SELECT pid, state, query, wait_event_type, wait_event
                            FROM pg_stat_activity
                            WHERE datname = %s AND query ILIKE %s
                        """, (database, f'%{table_name}%'))
                        blockers = cur.fetchall()

                        if blockers:
                            print("⚠️ Possible blockers detected:")
                            for pid, state, query, wait_type, wait in blockers:
                                print(f"  PID: {pid} | State: {state} | Event: {wait_type}/{wait} | Query: {query.strip()[:80]}")

                        # Start spinner
                        stop_event = Event()
                        spinner_thread = Thread(target=show_spinner, args=(f"Dropping {quoted_table_name}", stop_event))
                        spinner_thread.start()

                        start = time.time()
                        cur.execute(f'DROP TABLE {quoted_table_name}')
                        elapsed = time.time() - start

                        # Stop spinner
                        stop_event.set()
                        spinner_thread.join()

                        print(f"✅ Dropped in {elapsed:.2f}s")
                    else:
                        print(f"ℹ️ Table {quoted_table_name} does not exist — skipping drop.")
        except Exception as e:
            print(f"❌ DROP failed: {e}")
            return

    # Step 2: Create table
    try:
        with psycopg2.connect(dbname=database, user=user, password=password, host=host, port=port) as conn:
            conn.set_session(autocommit=True)
            with conn.cursor() as cur:
                cols = ', '.join([f'"{col}" TEXT' for col in df.columns])
                cur.execute(f'CREATE TABLE {quoted_table_name} ({cols})')
                print(f"🧱 Created table {quoted_table_name} with {len(df.columns)} columns")
    except Exception as e:
        print(f"❌ CREATE failed: {e}")
        return

    # Step 3: Load data
    try:
        with psycopg2.connect(dbname=database, user=user, password=password, host=host, port=port) as conn:
            conn.set_session(autocommit=True)
            with conn.cursor() as cur:
                buffer = StringIO()
                df.to_csv(buffer, index=False, header=False)
                buffer.seek(0)
                cur.copy_expert(f'COPY {quoted_table_name} FROM STDIN WITH CSV', buffer)
                print(f"✅ Loaded {total_rows} rows into {quoted_table_name}")
    except Exception as e:
        print(f"❌ COPY failed: {e}")


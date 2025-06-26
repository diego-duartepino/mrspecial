import sys 
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from tools.conn import get_sqlserver_connection



def get_create_table_query(table_name, schema='dbo'):
    conn, creds = get_sqlserver_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
    """, (schema, table_name))

    columns = cursor.fetchall()
    if not columns:
        print(f"⚠️ Table '{schema}.{table_name}' not found.")
        return

    col_defs = []
    for col in columns:
        col_name, data_type, max_len, is_nullable = col
        if data_type in ['varchar', 'nvarchar', 'char', 'nchar']:
            type_def = f"{data_type}({max_len if max_len else 'MAX'})"
        elif data_type in ['decimal', 'numeric']:
            # You could expand with precision/scale lookup if needed
            type_def = f"{data_type}(18, 2)"
        else:
            type_def = data_type

        nullable = "NULL" if is_nullable == 'YES' else "NOT NULL"
        col_defs.append(f"[{col_name}] {type_def} {nullable}")

    create_stmt = f"CREATE TABLE [{schema}].[{table_name}] (\n    " + ",\n    ".join(col_defs) + "\n);"
    print("\n🔧 CREATE TABLE Script:")
    print(create_stmt)

    cursor.close()
    conn.close()

# Example usage
if __name__ == "__main__":
    get_create_table_query("StoreSaleByDept")
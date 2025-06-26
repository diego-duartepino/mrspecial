import pandas as pd

# This code transforms a DataFrame by applying general cleaning steps.
# It currently replaces null values with 0, but can be extended with more transformation logic as needed.


def transform_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transforms the input DataFrame by applying general cleaning steps.
    Currently replaces null values with 0.

    Params:
        df (pd.DataFrame): The input raw dataframe.

    Returns:
        pd.DataFrame: Transformed dataframe.
    """

    # ---------------------------------------------
    # 🧹 General Cleaning Logic
    # ---------------------------------------------

    # Strip whitespace from column names
    df.columns = df.columns.str.strip()

    # Drop duplicate rows
    df = df.drop_duplicates()

    # Replace all nulls with 0
    df = df.fillna(0)

    # ---------------------------------------------
    # 🛠️ Add more transformation logic below as needed
    # ---------------------------------------------

    # Example:
    # df['sale_date'] = pd.to_datetime(df['sale_date'], errors='coerce')
    # df['total'] = df['quantity'] * df['price']
    # df['category'] = df['category'].fillna('Unknown')

    # ---------------------------------------------
    # ✅ Done
    # ---------------------------------------------

    return df

def transform_iri_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transforms the input DataFrame by applying general cleaning steps.
    Currently replaces null values with 0.

    Params:
        df (pd.DataFrame): The input raw dataframe.

    Returns:
        pd.DataFrame: Transformed dataframe.
    """

    # ---------------------------------------------
    # 🧹 General Cleaning Logic
    # ---------------------------------------------

    # Strip whitespace from column names
    df.columns = df.columns.str.strip()

    # Drop duplicate rows
    df = df.drop_duplicates()

    # Replace all nulls with 0
    df = df.fillna(0)



    # ---------------------------------------------
    # 🛠️ Add more transformation logic below as needed
    # ---------------------------------------------

    # Example:
    # df['sale_date'] = pd.to_datetime(df['sale_date'], errors='coerce')
    # df['total'] = df['quantity'] * df['price']
    # df['category'] = df['category'].fillna('Unknown')
    print(df.columns.tolist())

    if 'SKU IRI' in df.columns and 'SKU MrSpecial' in df.columns:
        df['SKU MrSpecial'] = df['SKU IRI']


    # ---------------------------------------------
    # ✅ Done
    # ---------------------------------------------

    return df










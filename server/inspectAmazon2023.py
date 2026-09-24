from datasets import Dataset, concatenate_datasets
import pandas as pd
from pathlib import Path

DATASET_DIR = Path("dataset/amazon-products-2023")

print("=" * 60)
print("DECISIONLENS - AMAZON PRODUCTS 2023 INSPECTION")
print("=" * 60)


# =========================================================
# FIND ARROW FILES
# =========================================================

files = sorted(DATASET_DIR.glob("*.arrow"))

print(f"\nFound {len(files)} Arrow files:\n")

for file in files:
    print(f" - {file.name}")


# =========================================================
# COLUMNS WE ACTUALLY NEED
# =========================================================

REQUIRED_COLUMNS = [
    "parent_asin",
    "title",
    "description",
    "filename",
    "main_category",
    "categories",
    "store",
    "average_rating",
    "rating_number",
    "price",
    "features",
    "details",
    "image"
]


# =========================================================
# READ ARROW FILES
# =========================================================

datasets = []

for file in files:

    print(f"\nReading: {file.name}")

    ds = Dataset.from_file(str(file))

    print(f"Rows: {len(ds)}")
    print(f"Columns in file: {len(ds.column_names)}")

    # Keep only columns required for our project
    available_columns = [
        column
        for column in REQUIRED_COLUMNS
        if column in ds.column_names
    ]

    ds = ds.select_columns(available_columns)

    print(f"Columns kept: {len(ds.column_names)}")

    datasets.append(ds)


# =========================================================
# COMBINE USING HUGGING FACE
# =========================================================

print("\n" + "=" * 60)
print("COMBINING DATASETS")
print("=" * 60)

combined = concatenate_datasets(datasets)

print(f"\nTotal rows: {len(combined)}")
print(f"Total columns: {len(combined.column_names)}")


# =========================================================
# CONVERT TO PANDAS
# =========================================================

print("\nConverting selected columns to Pandas...")

df = combined.to_pandas()

print("Conversion complete.")


# =========================================================
# COLUMN INFORMATION
# =========================================================

print("\n" + "=" * 60)
print("COLUMN INFORMATION")
print("=" * 60)

for column in df.columns:
    print(f"- {column}")


# =========================================================
# MAIN CATEGORY DISTRIBUTION
# =========================================================

print("\n" + "=" * 60)
print("MAIN CATEGORY DISTRIBUTION")
print("=" * 60)

print(
    df["main_category"]
    .value_counts(dropna=False)
    .to_string()
)


# =========================================================
# SAMPLE PRODUCTS
# =========================================================

print("\n" + "=" * 60)
print("SAMPLE PRODUCTS")
print("=" * 60)

sample_columns = [
    "parent_asin",
    "title",
    "main_category",
    "categories",
    "store",
    "price",
    "average_rating",
    "rating_number"
]

print(
    df[sample_columns]
    .head(10)
    .to_string(index=False)
)


# =========================================================
# CELL PHONES & ACCESSORIES
# =========================================================

print("\n" + "=" * 60)
print("CELL PHONES & ACCESSORIES")
print("=" * 60)

mobile_mask = (
    df["filename"]
    .astype(str)
    .str.contains(
        "Cell_Phones_and_Accessories",
        case=False,
        na=False
    )
)

mobile_df = df[mobile_mask]

print(
    f"Cell Phones & Accessories products: "
    f"{len(mobile_df)}"
)

print(
    mobile_df[sample_columns]
    .head(20)
    .to_string(index=False)
)


# =========================================================
# ELECTRONICS
# =========================================================

print("\n" + "=" * 60)
print("ELECTRONICS")
print("=" * 60)

electronics_mask = (
    df["filename"]
    .astype(str)
    .str.contains(
        "Electronics",
        case=False,
        na=False
    )
)

electronics_df = df[electronics_mask]

print(
    f"Electronics products: "
    f"{len(electronics_df)}"
)

print(
    electronics_df[sample_columns]
    .head(20)
    .to_string(index=False)
)


# =========================================================
# LAPTOP INSPECTION
# =========================================================

print("\n" + "=" * 60)
print("LAPTOP INSPECTION")
print("=" * 60)

laptop_pattern = (
    r"\blaptop\b"
    r"|\blaptops\b"
    r"|\bnotebook\b"
    r"|\bnotebooks\b"
    r"|\bchromebook\b"
    r"|\bchromebooks\b"
    r"|\bmacbook\b"
    r"|\bmacbooks\b"
)

laptop_mask = (
    df["title"]
    .astype(str)
    .str.contains(
        laptop_pattern,
        case=False,
        na=False,
        regex=True
    )
)

laptop_df = df[laptop_mask]

print(
    f"Laptop-related title matches: "
    f"{len(laptop_df)}"
)

print(
    laptop_df[sample_columns]
    .head(30)
    .to_string(index=False)
)


# =========================================================
# SMARTPHONE / MOBILE PHONE INSPECTION
# =========================================================

print("\n" + "=" * 60)
print("SMARTPHONE / MOBILE PHONE INSPECTION")
print("=" * 60)

mobile_pattern = (
    r"\bsmartphone\b"
    r"|\bsmartphones\b"
    r"|\bmobile phone\b"
    r"|\bmobile phones\b"
    r"|\bcell phone\b"
    r"|\bcell phones\b"
    r"|\biphone\b"
    r"|\bandroid phone\b"
)

mobile_keyword_mask = (
    df["title"]
    .astype(str)
    .str.contains(
        mobile_pattern,
        case=False,
        na=False,
        regex=True
    )
)

mobile_keyword_df = df[mobile_keyword_mask]

print(
    f"Mobile-related title matches: "
    f"{len(mobile_keyword_df)}"
)

print(
    mobile_keyword_df[sample_columns]
    .head(30)
    .to_string(index=False)
)


# =========================================================
# FINISHED
# =========================================================

print("\n" + "=" * 60)
print("INSPECTION COMPLETE")
print("=" * 60)
from datasets import Dataset
from pathlib import Path
import json
import re


# =========================================================
# PATHS
# =========================================================

DATASET_DIR = Path("dataset/amazon-products-2023")
OUTPUT_FILE = Path("dataset/decisionlens-products.jsonl")


# =========================================================
# FIND ARROW FILES
# =========================================================

files = sorted(DATASET_DIR.glob("*.arrow"))

print("=" * 70)
print("DECISIONLENS - AMAZON 2023 PRODUCT CONVERTER")
print("=" * 70)

print(f"\nFound {len(files)} Arrow files.")


# =========================================================
# CATEGORY NORMALIZATION
# =========================================================

def normalize_categories(categories):

    if not isinstance(categories, list):
        return []

    result = []

    for item in categories:

        if item is None:
            continue

        text = str(item).strip()

        if text:
            result.append(text)

    return result


def category_text(categories):

    return " | ".join(categories).lower()


# =========================================================
# PRODUCT CLASSIFICATION
# =========================================================

def classify_product(row):

    categories = normalize_categories(row.get("categories"))

    category_text_value = category_text(categories)

    title = str(row.get("title") or "").lower()

    filename = str(row.get("filename") or "").lower()

    main_category = str(
        row.get("main_category") or ""
    ).lower()


    # -----------------------------------------------------
    # 1. LAPTOPS
    # -----------------------------------------------------

    if (
        "laptops" in category_text_value
        or "traditional laptops" in category_text_value
        or "gaming laptops" in category_text_value
        or "2 in 1 laptops" in category_text_value
    ):

        return "Laptops"


    # -----------------------------------------------------
    # 2. MOBILE PHONES
    # -----------------------------------------------------

    if (
        "cell phones" in category_text_value
        and "accessories" not in category_text_value
        or category_text_value.endswith("| cell phones")
    ):

        # Extra protection against cases/accessories
        accessory_words = [
            "case",
            "cover",
            "screen protector",
            "tempered glass",
            "charger",
            "charging cable",
            "cable",
            "screen film",
            "protector",
            "mount",
            "holder",
            "stand",
            "band",
            "replacement"
        ]

        if not any(word in title for word in accessory_words):

            return "Mobiles"


    # -----------------------------------------------------
    # 3. CAMERAS
    # -----------------------------------------------------

    camera_keywords = [
        "camera & photo",
        "digital cameras",
        "mirrorless cameras",
        "dslr cameras",
        "action cameras",
        "point & shoot cameras",
        "camcorders",
        "security cameras"
    ]

    if any(
        keyword in category_text_value
        for keyword in camera_keywords
    ):

        return "Cameras"


    # -----------------------------------------------------
    # 4. AUDIO
    # -----------------------------------------------------

    audio_keywords = [
        "headphones",
        "earbuds",
        "earbud headphones",
        "over-ear headphones",
        "on-ear headphones",
        "speakers",
        "portable audio",
        "home audio",
        "home audio & theater",
        "sound bars",
        "audio components"
    ]

    if any(
        keyword in category_text_value
        for keyword in audio_keywords
    ):

        return "Audio"


    # -----------------------------------------------------
    # 5. TELEVISIONS
    # -----------------------------------------------------

    tv_keywords = [
        "televisions",
        "tv",
        "tvs",
        "led & lcd televisions",
        "smart televisions"
    ]

    if any(
        keyword in category_text_value
        for keyword in tv_keywords
    ):

        return "TV"


    # -----------------------------------------------------
    # 6. WEARABLES
    # -----------------------------------------------------

    wearable_keywords = [
        "smartwatches",
        "wearable technology",
        "fitness trackers"
    ]

    if any(
        keyword in category_text_value
        for keyword in wearable_keywords
    ):

        return "Wearables"


    # -----------------------------------------------------
    # 7. ELECTRONICS ACCESSORIES
    # -----------------------------------------------------

    accessory_keywords = [
        "laptop accessories",
        "tablet accessories",
        "computer accessories",
        "cables & accessories",
        "chargers & power adapters",
        "cases, holsters & sleeves",
        "screen protectors",
        "stands",
        "mounts",
        "keyboard",
        "mice",
        "power banks"
    ]

    if any(
        keyword in category_text_value
        for keyword in accessory_keywords
    ):

        return "Accessories"


    # -----------------------------------------------------
    # 8. OTHER ELECTRONICS
    # -----------------------------------------------------

    electronics_indicators = [
        "electronics",
        "computers",
        "computer & accessories",
        "computers & tablets",
        "car electronics",
        "camera & photo",
        "home audio",
        "portable audio"
    ]

    if (
        "meta_electronics" in filename
        or "cell phones & accessories" in main_category
        or "all electronics" in main_category
        or any(
            keyword in category_text_value
            for keyword in electronics_indicators
        )
    ):

        return "Other Electronics"


    # -----------------------------------------------------
    # NOT AN ELECTRONICS PRODUCT
    # -----------------------------------------------------

    return None


# =========================================================
# SAFE VALUE CONVERSION
# =========================================================

def safe_float(value):

    if value is None:
        return None

    try:

        number = float(value)

        if number != number:
            return None

        return number

    except:

        return None


def safe_string(value):

    if value is None:
        return ""

    return str(value).strip()


# =========================================================
# OUTPUT
# =========================================================

if OUTPUT_FILE.exists():

    print("\nRemoving previous converted file...")

    OUTPUT_FILE.unlink()


output = open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
)


# =========================================================
# STATISTICS
# =========================================================

stats = {}

total_read = 0
total_selected = 0
total_skipped = 0

seen_asins = set()


# =========================================================
# PROCESS EACH ARROW FILE
# =========================================================

for file in files:

    print("\n" + "-" * 70)
    print(f"Processing: {file.name}")
    print("-" * 70)

    dataset = Dataset.from_file(str(file))

    print(f"Rows: {len(dataset)}")


    for row in dataset:

        total_read += 1


        # -------------------------------------------------
        # CLASSIFY
        # -------------------------------------------------

        decision_category = classify_product(row)

        if decision_category is None:

            total_skipped += 1

            continue


        # -------------------------------------------------
        # ASIN
        # -------------------------------------------------

        asin = safe_string(
            row.get("parent_asin")
        )

        if not asin:

            total_skipped += 1

            continue


        # Avoid duplicate products
        if asin in seen_asins:

            continue

        seen_asins.add(asin)


        # -------------------------------------------------
        # PRODUCT DATA
        # -------------------------------------------------

        title = safe_string(
            row.get("title")
        )

        if not title:

            total_skipped += 1

            continue


        price = safe_float(
            row.get("price")
        )

        rating = safe_float(
            row.get("average_rating")
        )

        review_count = safe_float(
            row.get("rating_number")
        )


        # -------------------------------------------------
        # CATEGORIES
        # -------------------------------------------------

        categories = normalize_categories(
            row.get("categories")
        )


        sub_category = (
            categories[-1]
            if categories
            else decision_category
        )


        # -------------------------------------------------
        # DESCRIPTION
        # -------------------------------------------------

        description = row.get(
            "description"
        )

        if isinstance(description, list):

            description = " ".join(
                str(x)
                for x in description
                if x
            )

        description = safe_string(description)


        # -------------------------------------------------
        # FEATURES
        # -------------------------------------------------

        features = row.get("features")

        if isinstance(features, list):

            features = [
                str(x).strip()
                for x in features
                if x
            ]

        else:

            features = []


        # -------------------------------------------------
        # IMAGE
        # -------------------------------------------------

        image = row.get("image")

        if isinstance(image, list):

            image = (
                image[0]
                if image
                else ""
            )

        image = safe_string(image)


        # -------------------------------------------------
        # BRAND / STORE
        # -------------------------------------------------

        brand = safe_string(
            row.get("store")
        )

        if not brand:

            brand = "Unknown Brand"


        # -------------------------------------------------
        # PRODUCT DOCUMENT
        # -------------------------------------------------

        product = {

            "name": title,

            "brand": brand,

            "category": "electronics",

            "subCategory": decision_category,

            "description": description,

            "price": price,

            "originalPrice": price,

            "mrp": price,

            "discount": 0,

            "rating": rating or 0,

            "reviewCount": int(
                review_count or 0
            ),

            "processor": "",

            "ram": "",

            "storage": "",

            "gpu": "",

            "battery": "",

            "display": "",

            "weight": "",

            "packSize": "",

            "offers": [],

            "comboOffers": [],

            "stockAvailable": True,

            "siteName": "Amazon",

            "crawlTimestamp": None,

            "asin": asin,

            "productUrl":
                f"https://www.amazon.com/dp/{asin}",

            "image": image,

            "source": "Amazon Products 2023",

            "features": features,

            "amazonCategories": categories
        }


        # -------------------------------------------------
        # WRITE JSONL
        # -------------------------------------------------

        output.write(
            json.dumps(
                product,
                ensure_ascii=False
            )
            + "\n"
        )


        # -------------------------------------------------
        # STATISTICS
        # -------------------------------------------------

        stats[decision_category] = (
            stats.get(
                decision_category,
                0
            ) + 1
        )

        total_selected += 1


output.close()


# =========================================================
# FINAL REPORT
# =========================================================

print("\n")
print("=" * 70)
print("CONVERSION COMPLETE")
print("=" * 70)

print(f"\nTotal rows read:       {total_read}")
print(f"Products selected:     {total_selected}")
print(f"Products skipped:      {total_skipped}")
print(f"Unique ASINs:          {len(seen_asins)}")

print("\nDecisionLens categories:")

for category, count in sorted(
    stats.items(),
    key=lambda x: x[1],
    reverse=True
):

    print(
        f"  {category:<25} {count}"
    )


print(
    f"\nOutput file:\n"
    f"{OUTPUT_FILE}"
)

print("\nReady for MongoDB import.")
import os
import json
import pandas as pd

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
DATA_DIR = os.path.join(BASE_DIR, "data", "processed")
METADATA_DIR = os.path.join(BASE_DIR, "data", "metadata")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(METADATA_DIR, exist_ok=True)

os.makedirs(DATA_DIR, exist_ok=True)


def get_file_path(year, gp):
    return os.path.join(DATA_DIR, f"{year}_{gp}.parquet")


def save_laps(laps, year, gp):
    path = get_file_path(year, gp)
    print("Saving to:", path)
    laps.to_parquet(path)



def load_laps(year, gp):
    path = get_file_path(year, gp)
    print("Trying to load from:", path)

    if os.path.exists(path):
        print("File exists, loading...")
        return pd.read_parquet(path)

    print("File not found!")
    return None

def _get_metadata_path(year, gp):
    safe_gp = gp.replace(" ", "_").lower()
    return os.path.join(METADATA_DIR, f"{year}_{safe_gp}.json")


def save_metadata(year, gp, drivers):
    path = _get_metadata_path(year, gp)
    with open(path, "w") as f:
        json.dump(drivers, f)


def load_metadata(year, gp):
    path = _get_metadata_path(year, gp)

    if not os.path.exists(path):
        return None

    try:
        with open(path, "r") as f:
            data = json.load(f)

        if not isinstance(data, list) or len(data) == 0:
            return None

        return data

    except Exception:
        return None
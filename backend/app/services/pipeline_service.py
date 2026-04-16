from app.services.data_loader import load_race_session
from app.services.data_cleaner import clean_laps, remove_outliers
from app.services.feature_engineering import (
    add_tyre_life,
    adjust_for_fuel,
    remove_stint_edges,
    smooth_lap_times
)
from app.services.degradation import compute_degradation
from app.services.storage import load_laps, save_laps, load_metadata, save_metadata


def get_drivers_metadata(year: int, gp: str):
    cached = load_metadata(year, gp)

    if cached:
        return cached

    session = load_race_session(year, gp, metadata_only=True)

    drivers = session.results['Abbreviation'].tolist()

    save_metadata(year, gp, drivers)

    return drivers
def get_processed_laps(year: int, gp: str):
    cached = load_laps(year, gp)
    if cached is not None:
        print("Loaded from local cache\n")
        return cached

    print("Cache miss -> recomputing pipeline...\n")
    
    session = load_race_session(year, gp)
    laps = session.laps

    # Cleaning
    laps = clean_laps(laps)
    laps = remove_outliers(laps)

    # Features
    laps = add_tyre_life(laps)
    laps = adjust_for_fuel(laps)

    # Stabilization
    laps = remove_stint_edges(laps)
    laps = smooth_lap_times(laps)

    save_laps(laps, year, gp)

    print("Saved processed data to cache\n")

    return laps


def get_degradation_data(year: int, gp: str):
    laps = get_processed_laps(year, gp)
    results = compute_degradation(laps)
    return results


def get_driver_comparison(year: int, gp: str, drivers: list):
    laps = get_processed_laps(year, gp)
    return laps[laps['Driver'].isin(drivers)]
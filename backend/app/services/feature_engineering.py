def add_tyre_life(laps):
    laps = laps.copy()

    # Tyre life = lap number within stint
    laps['TyreLife'] = laps['LapNumber'] - laps.groupby(['Driver', 'Stint'])['LapNumber'].transform('min')

    return laps

def adjust_for_fuel(laps):
    laps = laps.copy()

    # Convert lap time to seconds
    laps['LapTimeSeconds'] = laps['LapTime'].dt.total_seconds()

    # Simple linear fuel model (approx)
    fuel_effect_per_lap = 0.03  # tweak later

    laps['FuelEffect'] = laps['LapNumber'] * fuel_effect_per_lap

    laps['AdjustedLapTime'] = laps['LapTimeSeconds'] - laps['FuelEffect']

    return laps

def remove_stint_edges(laps):
    laps = laps.copy()

    laps['StintLapCount'] = laps.groupby(['Driver', 'Stint'])['LapNumber'].transform('count')

    # Remove last 3 laps (not 2)
    laps = laps[laps['TyreLife'] < (laps['StintLapCount'] - 4)]

    return laps

def smooth_lap_times(laps):
    laps = laps.copy()

    laps['SmoothedLapTime'] = laps.groupby(['Driver', 'Stint'])['AdjustedLapTime'] \
        .transform(lambda x: x.rolling(window=2, min_periods=1).mean())

    return laps
import pandas as pd

def clean_laps(laps):
    laps = laps.dropna(subset=['LapTime'])

    # Remove pit laps
    laps = laps[laps['PitOutTime'].isna()]
    laps = laps[laps['PitInTime'].isna()]
    laps = laps[laps['LapNumber'] > 2]

    # Keep only dry compounds
    laps = laps[laps['Compound'].isin(['SOFT', 'MEDIUM', 'HARD'])]

    return laps

def remove_outliers(laps):
    laps = laps.copy()

    # Remove extreme lap times (very slow laps)
    laps['LapTimeSeconds'] = laps['LapTime'].dt.total_seconds()
    threshold = laps.groupby('Driver')['LapTimeSeconds'].transform(lambda x: x.quantile(0.98))
    laps = laps[laps['LapTimeSeconds'] < threshold]

    return laps

#def remove_lap_jumps(laps):
#    laps = laps.copy()
#
#    laps['LapTimeSeconds'] = laps['LapTime'].dt.total_seconds()
#
#    laps['LapDiff'] = laps.groupby('Driver')['LapTimeSeconds'].diff()
#
#    # Remove large jumps (>1.5 seconds)
#    laps = laps[(laps['LapDiff'].abs() < 1.5) | (laps['LapDiff'].isna())]
#
#    return laps
import numpy as np

def compute_degradation(laps):
    results = []

    grouped = laps.groupby(['Driver', 'Stint', 'Compound'])

    for (driver, stint, compound), group in grouped:
        if len(group) < 8:
            continue

        x = group['TyreLife'].values
        y = group['SmoothedLapTime'].values

        # Linear regression (slope = degradation)
        slope, intercept = np.polyfit(x, y, 1)

        import math

        # clean slope
        if math.isnan(slope) or math.isinf(slope):
            continue

        results.append({
            'Driver': driver,
            'Stint': stint,
            'Compound': compound,
            'DegradationRate': slope
        })

    return results
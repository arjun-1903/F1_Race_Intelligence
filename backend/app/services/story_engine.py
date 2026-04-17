import pandas as pd

def generate_insights(laps_df, degradation, drivers):
    insights = []
    drivers_set = set(drivers)

    stint_lengths = {}
    for (driver, stint, compound), group in laps_df.groupby(['Driver', 'Stint', 'Compound']):
        if pd.isna(driver) or driver not in drivers_set: continue
        stint_lengths[(driver, stint, compound)] = len(group)

    degs_by_compound = {}
    for d in degradation:
        if d['Driver'] not in drivers_set: continue
        c = d['Compound']
        if c not in degs_by_compound: 
            degs_by_compound[c] = []
        degs_by_compound[c].append(d)

    # 1. Comparative Insight (Most Important)
    comparative_insights = []
    for c, degs in degs_by_compound.items():
        if len(degs) >= 2:
            sorted_degs = sorted(degs, key=lambda x: x['DegradationRate'], reverse=True)
            d1 = sorted_degs[0]
            # Ensure we don't compare a driver's stint to their own secondary stint
            d2 = next((d for d in reversed(sorted_degs) if d['Driver'] != d1['Driver']), None)
            
            if d2 is not None:
                diff = d1['DegradationRate'] - d2['DegradationRate']
                if diff > 0.04:
                    comparative_insights.append(
                        f"⚡ {d1['Driver']}'s {c.lower()} tyres dropped off faster than {d2['Driver']}'s during their stint"
                    )
    
    # 2. High Degradation 
    extreme_insights = []
    for d in degradation:
        if d['Driver'] not in drivers_set: continue
        if d['DegradationRate'] > 0.12:
            extreme_insights.append(f"⚡ {d['Driver']} struggled with severe tyre wear on the {d['Compound'].lower()} compound")

    # 3. Long Stint
    general_insights = []
    for (driver, stint, compound), length in stint_lengths.items():
        if (compound == 'SOFT' and length > 22) or (compound == 'MEDIUM' and length > 36) or (compound == 'HARD' and length > 50):
            general_insights.append(f"⚡ {driver} managed to stretch their {compound.lower()} tyres for an incredibly long {length}-lap stint")

    insights = comparative_insights + extreme_insights + general_insights

    return insights[:3]

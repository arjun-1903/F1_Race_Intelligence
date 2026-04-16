import pandas as pd

def get_strategy(laps_df, drivers):
    # Enforce strict driver order
    laps_df['Driver'] = pd.Categorical(laps_df['Driver'], categories=drivers, ordered=True)
    laps_df = laps_df.sort_values(['Driver', 'LapNumber'])
    
    strategy_map = {}
    
    # observed=False handles older pandas categorically if needed, but we can stick to native iteration
    # Since we mapped categorical, observed=True or False doesn't matter much if we're filtering anyway
    for (driver, stint, compound), group in laps_df.groupby(['Driver', 'Stint', 'Compound']):
        
        if len(group) < 2:
            continue
            
        start = group['LapNumber'].min()
        end = group['LapNumber'].max()
        
        # Safe FreshTyre handling
        fresh = True
        if 'FreshTyre' in group.columns:
            val = group['FreshTyre'].iloc[0]
            fresh = bool(val) if pd.notna(val) else True
            
        if pd.isna(driver): continue
            
        d_name = str(driver)
        if d_name not in strategy_map:
            strategy_map[d_name] = []
            
        strategy_map[d_name].append({
            "Compound": compound,
            "StartLap": int(start),
            "EndLap": int(end),
            "FreshTyre": fresh
        })
        
    result = []
    # Explicit mapping back
    for d in drivers:
        if d in strategy_map:
            # Sort stints
            stints = sorted(strategy_map[d], key=lambda x: x["StartLap"])
            result.append({
                "Driver": d,
                "Stints": stints
            })
            
    return result

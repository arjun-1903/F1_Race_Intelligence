from app.services.data_loader import load_race_session

session = load_race_session(2024, 'Silverstone')

laps = session.laps

#print(laps[['Driver', 'LapNumber', 'LapTime', 'Compound']].head())
#print(laps.columns)
driver_laps = laps[laps['Driver'] == 'HAM']
print(driver_laps[['LapNumber', 'Stint', 'Compound', 'LapTime']].head(15))
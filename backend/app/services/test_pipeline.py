from app.services.pipeline_service import get_processed_laps, get_degradation_data
from app.services.plotter import plot_degradation_curve, compare_drivers

laps = get_processed_laps(2024, 'Silverstone')

results = get_degradation_data(2024, 'Silverstone')

for r in results[:10]:
    print(r)

plot_degradation_curve(laps, 'HAM')
compare_drivers(laps, ['HAM','VER','NOR'])
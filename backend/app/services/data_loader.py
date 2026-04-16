import fastf1
import os

# Enable cache (adjust path if needed)
CACHE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "cache")
)

def load_race_session(year: int, gp: str, metadata_only: bool = False):
    fastf1.Cache.enable_cache(CACHE_DIR)

    session = fastf1.get_session(year, gp, 'R')
    
    if metadata_only:
        session.load(laps=False, telemetry=False, weather=False, messages=False)
    else:
        session.load()
        
    return session

def enable_fastf1_cache():
    os.makedirs(CACHE_DIR, exist_ok=True)
    fastf1.Cache.enable_cache(CACHE_DIR)
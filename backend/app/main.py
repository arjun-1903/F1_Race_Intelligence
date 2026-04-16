# Main FastAPI entry point
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import pandas as pd
import numpy as np
from pydantic import BaseModel
from app.services.data_loader import enable_fastf1_cache
import fastf1 

from app.services.pipeline_service import (
    get_processed_laps,
    get_degradation_data,
    get_driver_comparison,
    get_drivers_metadata
)

app = FastAPI(title="F1 Tyre Degradation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def serialize_results(results):
    cleaned = []

    for r in results:
        val = r.get("DegradationRate")

        # skip bad values
        if val is None:
            continue

        if isinstance(val, float) and (np.isnan(val) or np.isinf(val)):
            continue

        cleaned.append({
            "Driver": r["Driver"],
            "Stint": int(r["Stint"]),
            "Compound": r["Compound"],
            "DegradationRate": float(val)
        })

    return cleaned

def serialize_comparison(laps):
    cleaned = []

    for _, row in laps.iterrows():
        val = row.get("SmoothedLapTime")

        # skip bad rows
        if val is None:
            continue

        if isinstance(val, float) and (np.isnan(val) or np.isinf(val)):
            continue

        cleaned.append({
            "Driver": row["Driver"],
            "Compound": row["Compound"],
            "Stint": int(row["Stint"]),
            "TyreLife": int(row["TyreLife"]),
            "LapTime": round(float(val), 3)
        })

    return cleaned


@app.get("/")
def root():
    return {"message": "F1 Tyre Degradation API is running"}


@app.get("/races")
def get_races(year: int):
    enable_fastf1_cache()

    schedule = fastf1.get_event_schedule(year)

    races = schedule[schedule['EventFormat'] == 'conventional']

    return {
        "races": races['EventName'].tolist()
    }

class DegradationResponse(BaseModel):
    Driver: str
    Stint: int
    Compound: str
    DegradationRate: float


# 🔥 Degradation endpoint
@app.get("/degradation", response_model=List[DegradationResponse])
def degradation(year: int, gp: str):
    data = get_degradation_data(year, gp)
    return serialize_results(data)


# 🔥 Driver comparison endpoint
@app.get("/comparison")
def comparison(
    year: int,
    gp: str,
    drivers: str = Query(..., description="Comma separated drivers e.g. HAM,VER")
):
    driver_list = drivers.split(",")

    laps = get_driver_comparison(year, gp, driver_list)


    laps = laps.replace([np.inf, -np.inf], None)
    laps = laps.where(laps.notna(), None)

    # Convert to JSON-friendly format
    return {
        "data": serialize_comparison(laps)
    }


# 🔥 Driver list endpoint
@app.get("/drivers")
def drivers(year: int, gp: str):
    driver_list = get_drivers_metadata(year, gp)
    return {"drivers": sorted(driver_list) if driver_list else []}

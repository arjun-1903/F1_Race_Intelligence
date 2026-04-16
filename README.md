# 🏎️ F1 Race Intelligence Dashboard

A full-stack data platform that transforms raw Formula 1 telemetry into **clear race narratives**, combining performance analysis, strategy visualization, and automated insights.

---

## 🚀 Overview

This project analyzes Formula 1 race data using FastF1 and presents it through a modern, interactive dashboard.

Instead of just showing raw numbers, the platform answers:

* How did tyre performance evolve over a stint?
* What strategy did each driver follow?
* Who managed tyres better — and why?

---

## 🧠 Key Features

### 📈 Tyre Degradation Analysis

* Lap-by-lap performance curves
* Fuel-adjusted lap times
* Visual comparison across multiple drivers

---

### 📊 Race Strategy Timeline

* Pirelli-style horizontal timeline
* Displays tyre compounds across stints
* Clear mapping of race strategies per driver

---

### ⚡ Race Insights Engine

* Automatically generated insights
* Highlights:

  * High degradation
  * Long stints
  * Driver vs driver comparisons
* Converts data into readable race narratives

---

## 🏗️ Architecture

### Backend (FastAPI)

* Data ingestion via FastF1
* Data cleaning and feature engineering
* Parquet-based caching for performance
* Unified `/analysis` endpoint:

```json
{
  "comparison": [...],
  "strategy": [...],
  "insights": [...]
}
```

---

### Frontend (React + Plotly)

* Interactive dashboard UI
* Driver selection with dynamic updates
* Dual visualization:

  * Degradation curves
  * Strategy timeline
* Insight panel for narrative output

---

## ⚙️ Tech Stack

**Backend**

* Python
* FastAPI
* Pandas
* FastF1

**Frontend**

* React
* Plotly.js
* Axios

**Storage**

* Parquet (for processed race data)
* JSON (for metadata caching)

---

## 📦 Project Structure

```
backend/
  app/
    main.py
    services/
      data_loader.py
      data_cleaner.py
      feature_engineering.py
      degradation.py
      strategy_builder.py
      story_engine.py
      storage.py

frontend/
  src/
    App.jsx
    api.js
    index.css
```

---

## 🧪 How It Works

1. User selects:

   * Season
   * Grand Prix
   * Drivers

2. Frontend calls:

```
GET /analysis?year=2024&gp=Silverstone&drivers=HAM,VER,NOR
```

3. Backend:

* Loads cached data (or fetches via FastF1)
* Processes telemetry
* Generates:

  * Degradation curves
  * Strategy timeline
  * Insights

4. UI renders everything in a single view

---

## ⚡ Performance Optimizations

* Parquet caching avoids repeated API calls
* Metadata (drivers) loaded separately for instant UI response
* Single API call (`/analysis`) reduces frontend complexity

---

## 🧩 Future Improvements

* Preloading popular races to avoid cache delays
* Weather and track condition integration
* Advanced strategy classification
* Improved narrative generation (commentary-style insights)

---

## 🛠️ Setup Instructions

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📌 Notes

* First-time race loads may take longer due to FastF1 data fetching
* Subsequent requests are significantly faster due to caching

---

## 💡 Motivation

Most F1 data tools focus on raw telemetry.

This project focuses on **interpretation** — turning complex data into insights that fans can understand instantly.

---

## 👨‍💻 Author

Arjun Rajesh

---

## ⭐ If you like this project

Give it a star and feel free to fork or contribute!


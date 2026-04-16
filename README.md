# 🏎️ F1 Race Intelligence

### Turn raw telemetry into race strategy, performance insights, and clear race narratives.

---

## 🚀 What is this?

Most Formula 1 tools show raw lap times and charts.

This project goes further.

👉 It explains **how a race unfolded**:

* Who managed tyres better
* Which strategy worked
* Where performance was gained or lost

All through a clean, interactive dashboard.

---

## 🔥 Key Features

### 📈 Tyre Degradation Analysis

* Lap-by-lap performance curves
* Fuel-adjusted lap times
* Compare multiple drivers in real time

---

### 📊 Race Strategy Timeline

* Pirelli-style horizontal timeline
* Visualizes tyre stints across the race
* Instantly understand each driver’s strategy

---

### ⚡ Race Insights Engine

* Automatically generated insights
* Detects:

  * High degradation
  * Long stints
  * Driver vs driver comparisons

👉 Turns raw data into **human-readable race stories**

---

## 🧠 Why this project matters

Most F1 dashboards stop at visualization.

This system focuses on **interpretation**.

It bridges the gap between:

* 📊 Data → and → 🧠 Understanding

Making race analysis accessible, fast, and intuitive.

---

## 🏗️ Architecture

### Backend (FastAPI)

* FastF1 data ingestion
* Data cleaning & feature engineering
* Degradation modeling
* Parquet caching for performance
* Unified API:

```json
GET /analysis

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

* Parquet (processed telemetry)
* JSON (metadata caching)

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

## 🧪 How it works

1. User selects:

   * Season
   * Grand Prix
   * Drivers

2. Frontend calls:

```
/analysis?year=2024&gp=Silverstone&drivers=HAM,VER,NOR
```

3. Backend:

* Loads cached race data (or fetches via FastF1)
* Processes telemetry
* Generates:

  * Degradation curves
  * Strategy timeline
  * Insights

4. Everything is rendered in a single unified dashboard

---

## ⚡ Performance Optimizations

* Parquet caching avoids repeated data downloads
* Metadata API ensures instant UI responsiveness
* Single `/analysis` endpoint reduces frontend overhead

---

## ⚠️ Challenges

* Handling NaN / Pandas serialization issues for API responses
* Managing heavy telemetry downloads without freezing UI
* Designing a system that is both **accurate** and **intuitive**
* Ensuring race strategy visualization reflects real-world logic

---

## 🛠️ Setup

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

## 💡 Learnings

* Building production-ready data pipelines (not just notebooks)
* Designing clean API contracts for complex data
* Translating raw telemetry into meaningful insights
* Balancing backend accuracy with frontend clarity

---

## 👨‍💻 Author

Arjun Rajesh

---

## ⭐ If you found this interesting

Give it a star ⭐ — or feel free to fork and build on it.



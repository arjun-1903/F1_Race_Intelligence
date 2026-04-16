import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { getRaces, getDrivers, getComparison } from "./api";
import "./index.css";

const driverColors = {
  VER: "#1E41FF", 
  PER: "#1E41FF", 
  HAM: "#00D2BE", 
  RUS: "#00D2BE", 
  NOR: "#FF8700", 
  PIA: "#FF8700",
  LEC: "#DC0000", 
  SAI: "#DC0000",
  ALO: "#0090FF", 
  STR: "#0090FF",
  ALB: "#005AFF", 
  SAR: "#005AFF",
  TSU: "#2B4562", 
  RIC: "#2B4562",
  LAW: "#2B4562",
  GAS: "#FF87BC", 
  OCO: "#FF87BC",
  BOT: "#52E252", 
  ZHO: "#52E252",
  MAG: "#FFFFFF", 
  HUL: "#FFFFFF",
};

const fallbackColors = ["#E10600", "#00D2BE", "#FF8700", "#2B4562", "#DC0000", "#0090FF"];

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [year, setYear] = useState(2024);
  const [races, setRaces] = useState([]);
  const [race, setRace] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [data, setData] = useState([]);
  const [hoveredDriver, setHoveredDriver] = useState(null);

  // Architecture UPGRADE: Explicit async states
  const [isDriversLoading, setIsDriversLoading] = useState(false);
  const [isTelemetryLoading, setIsTelemetryLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRaces(year).then((res) => {
      setRaces(res.data.races);
      setRace(res.data.races[0]);
    }).catch(err => {
      setError("Backend Offline: Failed to fetch Grand Prix schedule");
    });
  }, [year]);

  // Fetch Drivers Only on Race Change (Fast Metadata Fetch)
  useEffect(() => {
    if (!race) return;

    const fetchDrivers = async () => {
      try {
        setIsDriversLoading(true);
        setError(null);

        const res = await getDrivers(year, race);
        if (!res.data.drivers || res.data.drivers.length === 0) {
            setError("Failed to load drivers");
            return;
        }
        setDrivers(res.data.drivers);
      } catch (err) {
        setError("Failed to load drivers");
      } finally {
        setIsDriversLoading(false);
      }
    };

    fetchDrivers();
  }, [race, year]);

  // Fetch Telemetry ONLY on Explicit Driver Select (Heavy Payload)
  useEffect(() => {
    if (selectedDrivers.length === 0 || !race) {
        setData([]);
        return;
    }

    const fetchData = async () => {
      try {
        setIsTelemetryLoading(true);
        setError(null);

        const res = await getComparison(year, race, selectedDrivers);
        setData(res.data.data);
      } catch (err) {
        setError("Failed to load telemetry data: Backend Timeout");
      } finally {
        setIsTelemetryLoading(false);
      }
    };

    fetchData();
  }, [selectedDrivers, race, year]);

  const toggleDriver = (driver) => {
    setSelectedDrivers((prev) => 
      prev.includes(driver) 
        ? prev.filter((d) => d !== driver)
        : [...prev, driver]
    );
  };

  const getDriverColor = (driver, index) => {
      return driverColors[driver] || fallbackColors[index % fallbackColors.length];
  };

  const plotData = selectedDrivers.reduce((acc, driver, index) => {
    const driverData = data.filter((d) => d.Driver === driver);
    const stints = [...new Set(driverData.map(d => d.Stint))];
    
    stints.forEach(stint => {
        const stintData = driverData.filter(d => d.Stint === stint);
        if (stintData.length === 0) return;
        const compound = stintData[0].Compound;

        const baseWidth = compound === "SOFT" ? 4 : (compound === "MEDIUM" ? 3 : 2);
        const isHovered = hoveredDriver === driver;
        const opacity = hoveredDriver ? (isHovered ? 1 : 0.15) : 1;
        const finalWidth = hoveredDriver && isHovered ? baseWidth + 2 : baseWidth;

        acc.push({
          x: stintData.map((d) => d.TyreLife),
          y: stintData.map((d) => d.LapTime),
          type: "scatter",
          mode: "lines+markers",
          name: `${driver} (${compound})`,
          opacity: opacity,
          line: {
            color: getDriverColor(driver, index),
            dash: compound === "SOFT" ? "solid" : (compound === "MEDIUM" ? "dash" : "dot"),
            width: finalWidth
          },
          marker: {
            color: getDriverColor(driver, index),
            size: finalWidth * 1.5
          },
          customdata: stintData.map(() => driver), 
        });
    });

    return acc;
  }, []);

  if (!showDashboard) {
    return (
      <div className="landing-hero">
        <h1 className="hero-title">F1 TYRE INTELLIGENCE</h1>
        <p className="hero-subtitle">
          Deep performance insights across drivers, compounds, and race strategy
        </p>
        <button className="hero-btn" onClick={() => setShowDashboard(true)}>
          Enter Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="glass-panel">
        <div style={{ display: "flex", gap: "2rem" }}>
          <div className="control-group">
            <span className="control-label">Season</span>
            <select className="custom-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {[2022, 2023, 2024].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <span className="control-label">Grand Prix</span>
            <select className="custom-select" value={race} onChange={(e) => {
              setDrivers([]);
              setSelectedDrivers([]); 
              setRace(e.target.value);
            }}>
              {races.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="control-group" style={{ flexGrow: 1 }}>
          <span className="control-label">Select Drivers</span>
          <div className="drivers-grid">
            {isDriversLoading ? (
              <span style={{color: 'gray'}}>Loading Telemetry Metadata...</span>
            ) : drivers.map((d) => (
              <button 
                key={d} 
                className={`driver-pill ${selectedDrivers.includes(d) ? 'active' : ''}`}
                onClick={() => toggleDriver(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-container">
        {error && (
            <div className="error-box">
            {error}
            </div>
        )}

        {!error && selectedDrivers.length === 0 && (
            <div className="empty-state">
            Select drivers to begin telemetry analysis
            </div>
        )}

        {!error && isTelemetryLoading && selectedDrivers.length > 0 && (
            <div className="loading-box">
            Analyzing tyre degradation...
            </div>
        )}

        {!error && !isTelemetryLoading && selectedDrivers.length > 0 && (
            <Plot
            data={plotData}
            onHover={(e) => {
                if (e.points && e.points.length > 0) {
                setHoveredDriver(e.points[0].customdata);
                }
            }}
            onUnhover={() => setHoveredDriver(null)}
            layout={{
                title: { text: "Tyre Degradation Signatures", font: { family: "Outfit", size: 24, color: "#FFF" } },
                paper_bgcolor: "transparent",
                plot_bgcolor: "transparent",
                font: { family: "Inter", color: "#FFF" },
                hovermode: "closest",
                xaxis: { 
                title: "Tyre Life (laps)", 
                gridcolor: "rgba(255,255,255,0.05)",
                zerolinecolor: "rgba(255,255,255,0.1)"
                },
                yaxis: { 
                title: "Lap Time (s)", 
                gridcolor: "rgba(255,255,255,0.05)",
                zerolinecolor: "rgba(255,255,255,0.1)"
                },
                autosize: true,
                margin: { t: 50, l: 30, r: 20, b: 50 },
                legend: { 
                    orientation: "h", 
                    y: -0.2, 
                    font: { family: "Inter", size: 12, color: "rgba(255,255,255,0.7)" }
                }
            }}
            useResizeHandler={true}
            style={{ width: "100%", height: "100%" }}
            />
        )}
      </div>
    </div>
  );
}

export default App;

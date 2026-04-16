import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { getRaces, getDrivers, getAnalysis } from "./api";
import "./index.css";

const driverColors = {
  VER: "#1E41FF", PER: "#1E41FF", 
  HAM: "#00D2BE", RUS: "#00D2BE", 
  NOR: "#FF8700", PIA: "#FF8700",
  LEC: "#DC0000", SAI: "#DC0000",
  ALO: "#0090FF", STR: "#0090FF",
  ALB: "#005AFF", SAR: "#005AFF",
  TSU: "#2B4562", RIC: "#2B4562", LAW: "#2B4562",
  GAS: "#FF87BC", OCO: "#FF87BC",
  BOT: "#52E252", ZHO: "#52E252",
  MAG: "#FFFFFF", HUL: "#FFFFFF",
};

const compoundColors = {
  SOFT: "#FF2800",
  MEDIUM: "#EAE000",
  HARD: "#FFFFFF",
  INTERMEDIATE: "#39B54A",
  WET: "#00AEEF"
};

const fallbackColors = ["#E10600", "#00D2BE", "#FF8700", "#2B4562", "#DC0000", "#0090FF"];

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [year, setYear] = useState(2024);
  const [races, setRaces] = useState([]);
  const [race, setRace] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  
  // Unified Analysis State
  const [comparisonData, setComparisonData] = useState([]);
  const [strategyData, setStrategyData] = useState([]);
  const [insightsData, setInsightsData] = useState([]);

  const [hoveredDriver, setHoveredDriver] = useState(null);

  const [isDriversLoading, setIsDriversLoading] = useState(false);
  const [isTelemetryLoading, setIsTelemetryLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRaces(year).then((res) => {
      setRaces(res.data.races);
      setRace(res.data.races[0]);
    }).catch(() => {
      setError("Backend Offline: Failed to fetch Grand Prix schedule");
    });
  }, [year]);

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

  useEffect(() => {
    if (selectedDrivers.length === 0 || !race) {
        setComparisonData([]);
        setStrategyData([]);
        setInsightsData([]);
        return;
    }

    const fetchData = async () => {
      try {
        setIsTelemetryLoading(true);
        setError(null);
        const res = await getAnalysis(year, race, selectedDrivers);
        setComparisonData(res.data.comparison);
        setStrategyData(res.data.strategy);
        setInsightsData(res.data.insights);
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

  // Build Degradation Chart
  const plotData = selectedDrivers.reduce((acc, driver, index) => {
    const driverData = comparisonData.filter((d) => d.Driver === driver);
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

  // Build Strategy Timeline Chart (Pirelli Style)
  const strategyTraces = [];
  const seenLegend = new Set();

  strategyData.forEach(d => {
      d.Stints.forEach(stint => {
          const cColor = compoundColors[stint.Compound] || "#FFFFFF";
          strategyTraces.push({
              type: 'bar',
              orientation: 'h',
              y: [d.Driver],
              x: [stint.EndLap - stint.StartLap],
              base: stint.StartLap,
              name: stint.Compound,
              marker: { 
                  color: stint.FreshTyre ? cColor : 'rgba(0,0,0,0)',
                  pattern: !stint.FreshTyre ? { shape: "/", fgcolor: cColor, bgcolor: 'transparent', size: 5 } : undefined,
                  line: { color: !stint.FreshTyre ? cColor : 'rgba(0,0,0,0.5)', width: !stint.FreshTyre ? 1 : 0 }
              },
              legendgroup: stint.Compound,
              showlegend: !seenLegend.has(stint.Compound),
              hovertext: `Lap ${stint.StartLap} - ${stint.EndLap} (${stint.Compound}${!stint.FreshTyre ? ' Used' : ' New'})`,
              hoverinfo: "text"
          });
          seenLegend.add(stint.Compound);
      });
  });

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

  const driverOrder = selectedDrivers;

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

      <div className="chart-container" style={{ height: "auto" }}>
        {error && <div className="error-box">{error}</div>}

        {!error && selectedDrivers.length === 0 && (
            <div className="empty-state">Select drivers to begin telemetry analysis</div>
        )}

        {!error && isTelemetryLoading && selectedDrivers.length > 0 && (
            <div className="loading-box">Analyzing tyre degradation...</div>
        )}

        {!error && !isTelemetryLoading && selectedDrivers.length > 0 && comparisonData.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Plot
                  data={plotData}
                  layout={{
                      title: { text: "Tyre Degradation Signatures", font: { family: "Outfit", size: 24, color: "#FFF" } },
                      paper_bgcolor: "rgba(10,10,10,0.5)",
                      plot_bgcolor: "transparent",
                      font: { family: "Inter", color: "#FFF" },
                      hovermode: "closest",
                      xaxis: { title: "Tyre Life (laps)", gridcolor: "rgba(255,255,255,0.05)" },
                      yaxis: { title: "Lap Time (s)", gridcolor: "rgba(255,255,255,0.05)", categoryorder: "array", categoryarray: driverOrder },
                      autosize: true,
                      margin: { t: 50, l: 50, r: 20, b: 50 },
                      showlegend: false
                  }}
                  useResizeHandler={true}
                  style={{ width: "100%", height: "400px" }}
                />

                <Plot
                  data={strategyTraces}
                  layout={{
                      title: { text: "Race Strategy Timeline<br><sup style='color:gray;font-size:12px;'>Each bar represents a tracked telemetry stint (pit laps and safety cars filtered)</sup>", font: { family: "Outfit", size: 20, color: "#FFF" } },
                      barmode: "stack",
                      bargap: 0.65,
                      paper_bgcolor: "rgba(10,10,10,0.5)",
                      plot_bgcolor: "transparent",
                      font: { family: "Inter", color: "#FFF" },
                      xaxis: { title: "Race Lap", gridcolor: "rgba(255,255,255,0.05)" },
                      yaxis: { categoryorder: "array", categoryarray: driverOrder, automargin: true },
                      autosize: true,
                      margin: { t: 60, l: 50, r: 20, b: 50 },
                      showlegend: true,
                      legend: { orientation: "h", y: -0.2, font: { family: "Outfit", color: "#FFF" } }
                  }}
                  useResizeHandler={true}
                  style={{ width: "100%", height: `${Math.max(250, driverOrder.length * 40 + 100)}px` }}
                />
            </div>
        )}

        {!error && !isTelemetryLoading && insightsData.length > 0 && (
            <div className="insights-panel">
              <h3 className="insights-title">Race Insights</h3>
              <ul className="insights-list">
                {insightsData.map((insight, idx) => (
                  <li key={idx} className="insight-item">
                     {insight}
                  </li>
                ))}
              </ul>
            </div>
        )}
      </div>
    </div>
  );
}

export default App;

import { useState, useEffect } from "react";
import ThreeCanvas from "./components/ThreeCanvas";
import BlueprintModal from "./components/BlueprintModal";
import { 
  Compass, 
  RotateCw, 
  RefreshCw, 
  Sun, 
  Layers, 
  Sparkles, 
  Info, 
  Wind, 
  Eye, 
  EyeOff, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  Thermometer, 
  Activity, 
  Building2, 
  Camera,
  Ruler,
  Compass as Landmark 
} from "lucide-react";

interface HoveredInfo {
  name: string;
  material: string;
  rating: string;
  x: number;
  y: number;
}

interface SelectedFloorInfo {
  floorNum: number;
  floorName: string;
}

const PHASES = [
  { id: "foundation", label: "Foundation Phase", desc: "Subsurface concrete raft & core base footings", progress: 15, date: "Q1 2026" },
  { id: "structure", label: "Structural Core", desc: "Superstructure framing & 18 floors slab pour", progress: 45, date: "Q3 2026" },
  { id: "facade", label: "Facade Glazing", desc: "Low-E glass curtain wall & louvers install", progress: 75, date: "Q1 2027" },
  { id: "finishing", label: "Plaza & Finishing", desc: "Site landscaping, street traffic & LED lamps", progress: 100, date: "Q3 2027" }
];

export default function App() {
  const [activeSectionId] = useState<string | null>(null);
  const [visualizationMode, setVisualizationMode] = useState<"architectural" | "wireframe" | "blueprint">("architectural");
  const [sunAngle, setSunAngle] = useState<number>(140); // Golden hour sunset rotation
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [thermalOverlayActive, setThermalOverlayActive] = useState<boolean>(false);
  const [isMetric, setIsMetric] = useState<boolean>(true);
  const [seasonMode, setSeasonMode] = useState<"summer" | "winter">("summer");

  // States for interactive engineering visualizer overlays
  const [constructionPhase, setConstructionPhase] = useState<"foundation" | "structure" | "facade" | "finishing">("finishing");
  const [shadowAnalysisActive, setShadowAnalysisActive] = useState<boolean>(false);
  const [windTunnelActive, setWindTunnelActive] = useState<boolean>(false);

  // States for Materials Palette Panel
  const [glassPreset, setGlassPreset] = useState<string>("sky-blue");
  const [claddingPreset, setCladdingPreset] = useState<string>("crimson-acp");
  const [vrModeActive, setVrModeActive] = useState<boolean>(false);

  // States for hovering specs and floor blueprints
  const [hoveredPart, setHoveredPart] = useState<HoveredInfo | null>(null);
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<SelectedFloorInfo | null>(null);

  // Layout states for enhanced professional UI/UX
  const [hudVisible, setHudVisible] = useState<boolean>(true);
  const [isLeftCardCollapsed, setIsLeftCardCollapsed] = useState<boolean>(false);
  const [isRightCardCollapsed, setIsRightCardCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Monitor screen size for mobile optimization
  useEffect(() => {
    const handleResize = () => {
      const isCurrMobile = window.innerWidth < 1024;
      setIsMobile(isCurrMobile);
      if (isCurrMobile) {
        // Default to collapsed or compact for better initial viewport visibility
        setIsLeftCardCollapsed(true);
        setIsRightCardCollapsed(true);
      } else {
        setIsLeftCardCollapsed(false);
        setIsRightCardCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResetCamera = () => {
    const event = new CustomEvent("reset-3d-camera");
    window.dispatchEvent(event);
  };

  const handleCameraTour = (preset: string) => {
    const event = new CustomEvent("set-camera-tour", { detail: preset });
    window.dispatchEvent(event);
  };

  const handleCaptureSnapshot = () => {
    const event = new CustomEvent("capture-3d-snapshot");
    window.dispatchEvent(event);
  };

  const handleSectionClick = () => {
    // Callback placeholder
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#f1f5f9] text-slate-800 font-sans select-none antialiased">
      
      {/* 1. IMMERSIVE FULL-SCREEN 3D WEBGL ENGINE */}
      <div className="absolute inset-0 w-full h-full z-0 p-3 md:p-4 bg-[#f1f5f9]">
        <ThreeCanvas
          activeSectionId={activeSectionId}
          onSectionClick={handleSectionClick}
          visualizationMode={visualizationMode}
          sunAngle={sunAngle}
          autoRotate={autoRotate}
          onHover={setHoveredPart}
          onFloorSelect={(num, name) => setSelectedFloorPlan({ floorNum: num, floorName: name })}
          thermalOverlayActive={thermalOverlayActive}
          glassPreset={glassPreset}
          claddingPreset={claddingPreset}
          vrModeActive={vrModeActive}
          constructionPhase={constructionPhase}
          shadowAnalysisActive={shadowAnalysisActive}
          windTunnelActive={windTunnelActive}
          isMetric={isMetric}
          seasonMode={seasonMode}
        />
      </div>

      {/* 2. MASTER GLOBAL CONTROLLER & TOUR BAR (Top Center) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-auto pointer-events-auto max-w-[95%]">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 px-4 py-2 rounded-full shadow-xl flex items-center justify-between gap-4">
          {/* Preset Camera Tour */}
          <div className="flex items-center space-x-1.5 border-r border-slate-200 pr-4">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest hidden md:inline">
              Tour Presets:
            </span>
            <div className="flex space-x-1">
              {[
                { id: "facade", label: "Facade" },
                { id: "podium", label: "Podium" },
                { id: "rooftop", label: "Rooftop" },
                { id: "front", label: "Front" }
              ].map((tour) => (
                <button
                  key={tour.id}
                  onClick={() => handleCameraTour(tour.id)}
                  className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:border-cyan-500 hover:text-cyan-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  {tour.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMetric(!isMetric)}
              title={isMetric ? "Switch to Imperial (Feet)" : "Switch to Metric (Meters)"}
              className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:border-cyan-500 hover:text-cyan-600 hover:bg-slate-100 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Ruler className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
              <span className="text-[9px] font-mono font-bold uppercase">
                {isMetric ? "METRIC (M)" : "IMPERIAL (FT)"}
              </span>
            </button>

            <button
              onClick={handleCaptureSnapshot}
              title="Capture Snapshot (JPEG)"
              className="p-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 transition-all cursor-pointer flex items-center justify-center space-x-1"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[9px] font-mono font-bold uppercase pl-0.5 pr-1">Capture Snapshot</span>
            </button>

            <button
              onClick={handleResetCamera}
              title="Reset Camera Angle"
              className="p-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:border-cyan-500 hover:text-cyan-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setHudVisible(!hudVisible)}
              title={hudVisible ? "Hide UI Panels" : "Show UI Panels"}
              className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                hudVisible 
                  ? "bg-slate-50 border-slate-200 text-slate-700 hover:border-cyan-500 hover:text-cyan-600 hover:bg-slate-100" 
                  : "bg-cyan-50 border-cyan-500 text-cyan-700"
              }`}
            >
              {hudVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>

            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. FLOATING HUD: LEFT SIDEBAR (Project Metadata Card) */}
      <div 
        className={`absolute top-20 left-4 z-10 w-[320px] max-w-[90%] transition-all duration-300 ease-out pointer-events-auto ${
          hudVisible && (!isMobile || mobileMenuOpen) ? "translate-x-0 opacity-100" : "-translate-x-[360px] opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-xl rounded-2xl overflow-hidden">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-150">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-amber-500 animate-spin-slow" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                LANDMARK SPECIFICATION
              </span>
            </div>
            <button
              onClick={() => setIsLeftCardCollapsed(!isLeftCardCollapsed)}
              className="text-slate-400 hover:text-slate-700 transition-all"
            >
              {isLeftCardCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Collapsible Content */}
          <div className={`transition-all duration-300 ease-in-out ${isLeftCardCollapsed ? "max-h-0 opacity-0 overflow-hidden" : "p-4 space-y-4"}`}>
            
            {/* Title Block */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900 font-mono uppercase">
                  MOLLIK TOWER
                </h1>
                <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wide">18-Story Commercial Landmark</p>
              </div>
              <span className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[8px] font-mono font-extrabold text-emerald-700">ACTIVE</span>
              </span>
            </div>

            {/* Core Tech Table */}
            <div className="space-y-1.5 text-[9px] font-mono">
              {[
                { label: "HEIGHT", val: isMetric ? "72.00 METERS" : "236.22 FEET", color: "text-slate-700" },
                { label: "STRUCTURE", val: "C40 CONCRETE SHEAR WALLS", color: "text-slate-700" },
                { label: "CURTAIN WALL", val: "SKY-BLUE TRIPLE-SILVER LOW-E", color: "text-cyan-700" },
                { label: "LOUVERS", val: "ANODIZED ARCHITECTURAL BRONZE", color: "text-amber-700" },
                { label: "PODIUM BASE", val: "CRIMSON PERFORATED ACP", color: "text-red-700" },
                { label: "WIND / SEISMIC", val: isMetric ? "241 km/h / ZONE 3 (BNBC)" : "150 mph / ZONE 3 (BNBC)", color: "text-teal-700" }
              ].map((spec, sidx) => (
                <div key={sidx} className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 font-bold uppercase">{spec.label}</span>
                  <span className={`font-extrabold ${spec.color}`}>{spec.val}</span>
                </div>
              ))}
            </div>

            {/* PROGRESS GALLERY CAROUSEL */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
                  <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase">Progress Gallery</span>
                </div>
                <span className="text-[8px] font-mono bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded font-bold uppercase">
                  Phase {PHASES.findIndex(p => p.id === constructionPhase) + 1} / 4
                </span>
              </div>

              {/* Carousel UI */}
              <div className="relative flex items-center justify-between bg-white border border-slate-200/60 rounded-lg p-2.5 shadow-sm">
                <button
                  onClick={() => {
                    const idx = PHASES.findIndex(p => p.id === constructionPhase);
                    const prevIdx = (idx - 1 + PHASES.length) % PHASES.length;
                    setConstructionPhase(PHASES[prevIdx].id as any);
                  }}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="text-center flex-1 px-2 select-none">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                    {PHASES.find(p => p.id === constructionPhase)?.label}
                  </div>
                  <div className="text-[8px] text-slate-400 font-mono mt-0.5">
                    Target: {PHASES.find(p => p.id === constructionPhase)?.date}
                  </div>
                  <div className="text-[8.5px] text-slate-600 font-mono leading-tight mt-1 min-h-[24px]">
                    {PHASES.find(p => p.id === constructionPhase)?.desc}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const idx = PHASES.findIndex(p => p.id === constructionPhase);
                    const nextIdx = (idx + 1) % PHASES.length;
                    setConstructionPhase(PHASES[nextIdx].id as any);
                  }}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Indicator dots and progress bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[8px] font-mono text-slate-400">
                  <span>Phase Milestone Completion</span>
                  <span className="text-cyan-600 font-bold">{PHASES.find(p => p.id === constructionPhase)?.progress}%</span>
                </div>
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 transition-all duration-500 rounded-full" 
                    style={{ width: `${PHASES.find(p => p.id === constructionPhase)?.progress}%` }}
                  />
                </div>
                <div className="flex justify-between pt-1">
                  {PHASES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setConstructionPhase(p.id as any)}
                      className={`w-2.5 h-2.5 rounded-full border transition-all cursor-pointer ${
                        constructionPhase === p.id 
                          ? "bg-cyan-500 border-cyan-600 scale-125" 
                          : "bg-slate-200 border-slate-300 hover:bg-slate-300"
                      }`}
                      title={p.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Instructions Tip */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5 animate-pulse" />
              <div className="text-[9px] font-mono text-slate-600 leading-normal">
                <span className="text-cyan-700 font-bold block mb-0.5">INTERACTIVE SHEET MAP:</span>
                Hover on structure parts for specs/sustainability ratings. <span className="text-amber-700 font-bold">Click any floor</span> to open detailed 2D CAD blueprint plans!
              </div>
            </div>

            {/* Quick Live Stats */}
            <div className="grid grid-cols-2 gap-2 font-mono text-[9px]">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                <span className="block text-slate-400 font-bold">SYSTEM CLOCK</span>
                <span className="text-cyan-600 font-bold text-xs">{currentTime || "11:16:04"}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                <span className="block text-slate-400 font-bold">COORDINATES</span>
                <span className="text-slate-600 text-xs">23.81° N, 90.41° E</span>
              </div>
            </div>

          </div>

          {/* Quick collapsed preview strip */}
          {isLeftCardCollapsed && (
            <div className="p-3 bg-slate-50 text-center text-[10px] font-mono text-slate-500">
              Mollik Tower Specs Collapsed
            </div>
          )}

        </div>
      </div>

      {/* 4. FLOATING HUD: RIGHT SIDEBAR (Visualizer Engines & Solar Controls) */}
      <div 
        className={`absolute top-20 right-4 z-10 w-[280px] max-w-[90%] transition-all duration-300 ease-out pointer-events-auto ${
          hudVisible && (!isMobile || mobileMenuOpen) ? "translate-x-0 opacity-100" : "translate-x-[320px] opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border border-slate-250/80 shadow-xl rounded-2xl overflow-hidden space-y-0">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-150">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-600 animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                VISUALIZER CONTROLS
              </span>
            </div>
            <button
              onClick={() => setIsRightCardCollapsed(!isRightCardCollapsed)}
              className="text-slate-400 hover:text-slate-700 transition-all"
            >
              {isRightCardCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Collapsible Content */}
          <div className={`transition-all duration-300 ease-in-out ${isRightCardCollapsed ? "max-h-0 opacity-0 overflow-hidden" : "p-4 space-y-4"}`}>
            
            {/* Visualizer Presets */}
            <div className="flex flex-col space-y-1">
              {[
                { id: "architectural", label: "Rendered Photo Mode" },
                { id: "wireframe", label: "Structural Wireframe" },
                { id: "blueprint", label: "Blueprint Vector" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setVisualizationMode(mode.id as any)}
                  className={`text-left text-[10px] font-mono py-2.5 px-3.5 rounded-xl uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                    visualizationMode === mode.id
                      ? "bg-cyan-50 text-cyan-700 border-cyan-200 shadow-sm font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{mode.label}</span>
                    {mode.id === "wireframe" && (
                      <Wind className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-slate-150 my-1"></div>

            {/* Thermal Overlay Toggle */}
            <button
              onClick={() => setThermalOverlayActive(!thermalOverlayActive)}
              className={`w-full flex items-center justify-between text-[10px] font-mono py-2.5 px-3.5 rounded-xl uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                thermalOverlayActive
                  ? "bg-red-50 text-red-700 border-red-200 shadow-sm font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Sun className={`w-3.5 h-3.5 ${thermalOverlayActive ? "text-red-500 animate-spin-slow" : "text-slate-400"}`} />
                <span>Thermal Analysis</span>
              </div>
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                thermalOverlayActive ? "bg-red-100 text-red-600 border border-red-200" : "bg-slate-100 text-slate-400"
              }`}>
                {thermalOverlayActive ? "ACTIVE" : "OFF"}
              </span>
            </button>

            {thermalOverlayActive && (
              <div className="bg-red-50/50 border border-red-100 rounded-xl p-2.5 space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  <span>Thermodynamic Scale</span>
                  <span className="text-red-600">Heat Gain (W/m²)</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-blue-700 via-cyan-400 via-yellow-400 to-red-500"></div>
                <div className="flex justify-between text-[8px] font-mono text-slate-500">
                  <span>24°C (Cool)</span>
                  <span>42°C (Med)</span>
                  <span>60°C (Hot)</span>
                </div>
              </div>
            )}

            {/* Wind Tunnel Simulation Toggle */}
            <button
              onClick={() => setWindTunnelActive(!windTunnelActive)}
              className={`w-full flex items-center justify-between text-[10px] font-mono py-2.5 px-3.5 rounded-xl uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                windTunnelActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Wind className={`w-3.5 h-3.5 ${windTunnelActive ? "text-emerald-500 animate-pulse" : "text-slate-400"}`} />
                <span>Wind Tunnel CFD</span>
              </div>
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                windTunnelActive ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-400"
              }`}>
                {windTunnelActive ? "ACTIVE" : "OFF"}
              </span>
            </button>

            {windTunnelActive && (
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2.5 space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  <span>CFD Velocity Vector Analysis</span>
                  <span className="text-emerald-600">Velocity (m/s)</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-emerald-600 via-cyan-400 to-sky-500"></div>
                <div className="flex justify-between text-[8px] font-mono text-slate-500">
                  <span>12 m/s (Low)</span>
                  <span>24 m/s (Medium)</span>
                  <span>38 m/s (High Peak)</span>
                </div>
              </div>
            )}

            {/* Dynamic context warnings */}
            {(visualizationMode === "wireframe" || windTunnelActive) && !thermalOverlayActive && (
              <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-2.5 flex items-center space-x-2 shadow-sm">
                <Wind className="w-3.5 h-3.5 text-cyan-600 animate-pulse shrink-0" />
                <p className="text-[8px] font-mono text-slate-500 leading-normal">
                  <span className="text-cyan-700 font-bold uppercase block">Aerodynamic Wind Flow:</span>
                  Rendering dynamic CFD streamlines and flow vectors around the tower model to visualize aerodynamic pressure impact.
                </p>
              </div>
            )}

            <div className="border-t border-slate-150 my-1"></div>

            {/* Quick Auto-Spin controller */}
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`w-full flex items-center justify-between text-[10px] font-mono py-2.5 px-3.5 rounded-xl uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                autoRotate
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center space-x-2">
                <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? "animate-spin-slow" : ""}`} />
                <span>Model Auto-Spin</span>
              </div>
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                autoRotate ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-400"
              }`}>
                {autoRotate ? "ON" : "OFF"}
              </span>
            </button>

            <div className="border-t border-slate-150 my-1"></div>

            {/* Materials Palette Panel */}
            <div className="space-y-3 p-1">
              <div className="flex items-center space-x-1.5 text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                <Sparkles className="w-3 h-3 text-cyan-600" />
                <span>Materials Palette</span>
              </div>

              {/* Facade Glass */}
              <div className="space-y-1 bg-slate-50 border border-slate-100 p-2 rounded-xl shadow-sm">
                <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider font-bold">1. Facade Glass Finish</span>
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {[
                    { id: "sky-blue", name: "Sky Blue Low-E", bg: "bg-[#3d5361] border-[#556c7a]" },
                    { id: "emerald", name: "Emerald Solar", bg: "bg-[#2e4a43] border-[#3f5f57]" },
                    { id: "gold", name: "Champagne Gold", bg: "bg-[#baa487] border-[#ccb89e]" },
                    { id: "dark-obsidian", name: "Obsidian Black", bg: "bg-[#1b222d] border-[#2c3746]" },
                    { id: "copper", name: "Luxury Copper", bg: "bg-[#ad826b] border-[#c09780]" }
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGlassPreset(g.id)}
                      title={g.name}
                      className={`h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer relative ${
                        glassPreset === g.id ? "scale-110 ring-2 ring-cyan-500 border-slate-200" : "border-slate-200 hover:border-slate-450 hover:scale-105"
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full border ${g.bg} shadow-md`}></span>
                    </button>
                  ))}
                </div>
                <div className="text-[7.5px] font-mono text-slate-500 capitalize tracking-wide text-center pt-0.5">
                  Active: <span className="text-cyan-600 font-bold">{glassPreset.replace("-", " ")}</span>
                </div>
              </div>

              {/* Cladding Finish */}
              <div className="space-y-1 bg-slate-50 border border-slate-100 p-2 rounded-xl shadow-sm">
                <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider font-bold">2. Cladding Material</span>
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {[
                    { id: "crimson-acp", name: "Crimson ACP", bg: "bg-[#6e1f1f] border-[#8c2d2d]" },
                    { id: "champagne-gold", name: "Champagne Gold", bg: "bg-[#bda275] border-[#d4bd94]" },
                    { id: "matte-platinum", name: "Matte Platinum", bg: "bg-[#5a6375] border-[#747e92]" },
                    { id: "emerald-copper", name: "Oxidized Copper", bg: "bg-[#2e4f4a] border-[#3f635d]" },
                    { id: "midnight-obsidian", name: "Midnight Slate", bg: "bg-[#111622] border-[#22293b]" }
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCladdingPreset(c.id)}
                      title={c.name}
                      className={`h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer relative ${
                        claddingPreset === c.id ? "scale-110 ring-2 ring-cyan-500 border-slate-200" : "border-slate-200 hover:border-slate-450 hover:scale-105"
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-sm border ${c.bg} shadow-md`}></span>
                    </button>
                  ))}
                </div>

                {/* Custom Finish color picker */}
                <div className="flex items-center justify-between border-t border-slate-200/60 mt-2 pt-2 text-[8px] font-mono">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Custom Finish:</span>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="color"
                      value={claddingPreset.startsWith("#") ? claddingPreset : "#6e1f1f"}
                      onChange={(e) => setCladdingPreset(e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border border-slate-300 p-0 overflow-hidden outline-none bg-transparent"
                    />
                    <span className="text-[8px] text-slate-600 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200/80">
                      {claddingPreset.startsWith("#") ? claddingPreset.toUpperCase() : "PRESET"}
                    </span>
                  </div>
                </div>

                <div className="text-[7.5px] font-mono text-slate-500 capitalize tracking-wide text-center pt-1 border-t border-slate-200/40 mt-1">
                  Active: <span className="text-cyan-600 font-bold">
                    {claddingPreset.startsWith("#") ? `Custom Hex (${claddingPreset.toUpperCase()})` : claddingPreset.replace("-", " ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-150 my-1"></div>

            {/* Climate Control Section */}
            <div className="space-y-3 p-1">
              <div className="flex items-center space-x-1.5 text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                <Sun className="w-3 h-3 text-cyan-600 animate-spin-slow" />
                <span>Climate Control</span>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl shadow-sm space-y-2">
                <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider font-bold">Seasonal Solar Simulation</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSeasonMode("summer")}
                    className={`py-1.5 px-2 text-[9px] font-mono uppercase rounded-xl border text-center transition-all cursor-pointer ${
                      seasonMode === "summer"
                        ? "bg-amber-50 border-amber-500 text-amber-700 font-bold shadow-sm"
                        : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Summer
                  </button>
                  <button
                    onClick={() => setSeasonMode("winter")}
                    className={`py-1.5 px-2 text-[9px] font-mono uppercase rounded-xl border text-center transition-all cursor-pointer ${
                      seasonMode === "winter"
                        ? "bg-sky-50 border-sky-400 text-sky-700 font-bold shadow-sm"
                        : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Winter
                  </button>
                </div>

                {/* Season statistics panel */}
                <div className="bg-white rounded-lg p-2 border border-slate-100 space-y-1 text-[8px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">SOLAR INTENSITY:</span>
                    <span className={`${seasonMode === "summer" ? "text-amber-600" : "text-sky-600"} font-bold`}>
                      {seasonMode === "summer" ? "980 W/m²" : "620 W/m²"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ZENITH ANGLE:</span>
                    <span className="text-slate-600 font-bold">
                      {seasonMode === "summer" ? "88°" : "41°"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">AMBIENT BASELINE:</span>
                    <span className="text-slate-600 font-bold">
                      {seasonMode === "summer" ? "34°C" : "18°C"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-150 my-1"></div>

            {/* VR Immersion Walk-Through */}
            <button
              onClick={() => setVrModeActive(!vrModeActive)}
              className={`w-full flex items-center justify-between text-[10px] font-mono py-2.5 px-3.5 rounded-xl uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                vrModeActive
                  ? "bg-purple-50 text-purple-700 border-purple-200 shadow-sm font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Activity className={`w-3.5 h-3.5 ${vrModeActive ? "text-purple-600 animate-pulse" : "text-slate-400"}`} />
                <span>VR Immersion Walk</span>
              </div>
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                vrModeActive ? "bg-purple-100 text-purple-600 border border-purple-200" : "bg-slate-100 text-slate-400"
              }`}>
                {vrModeActive ? "ACTIVE" : "OFF"}
              </span>
            </button>

          </div>

          {/* Quick collapsed preview strip */}
          {isRightCardCollapsed && (
            <div className="p-3 bg-slate-50 text-center text-[10px] font-mono text-slate-500">
              Visualizer Options Collapsed
            </div>
          )}

        </div>
      </div>

      {/* 5. INTERACTIVE TOOLTIP HOVER SPECIFICATION OVERLAY */}
      {hoveredPart && (
        <div
          className="fixed z-40 pointer-events-none bg-white/95 border border-cyan-200 rounded-xl p-3.5 shadow-xl w-72 backdrop-blur-md transform -translate-y-full mb-4 animate-fade-in"
          style={{
            left: `${Math.min(window.innerWidth - 300, hoveredPart.x + 15)}px`,
            top: `${Math.max(100, hoveredPart.y - 10)}px`,
          }}
        >
          <div className="space-y-2">
            {/* Spec Title */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-[10px] font-mono font-bold text-cyan-700 uppercase tracking-wider">
                {hoveredPart.name}
              </span>
              <span className="text-[8px] font-mono bg-cyan-50 text-cyan-600 px-1.5 py-0.5 rounded border border-cyan-200 uppercase">
                Active Spec
              </span>
            </div>

            {/* Material description */}
            <div className="space-y-0.5 text-[9px] font-mono">
              <span className="text-slate-400 uppercase block font-bold">MATERIAL:</span>
              <span className="text-slate-700 leading-normal block">{hoveredPart.material}</span>
            </div>

            {/* Sustainability LEED rating */}
            <div className="space-y-0.5 text-[9px] font-mono bg-emerald-50 border border-emerald-100 p-1.5 rounded-lg">
              <span className="text-emerald-700 uppercase block font-bold tracking-wider">SUSTAINABILITY RATING:</span>
              <span className="text-slate-600 leading-normal block">{hoveredPart.rating}</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. FLOATING HUD: BOTTOM LIGHTING CONTROLS CARD */}
      <div 
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-lg px-4 transition-all duration-300 ease-out pointer-events-auto ${
          hudVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200 px-6 py-4 rounded-2xl shadow-xl space-y-3">
          
          {/* Day Cycle Headline */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-500">
              <Sun className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
              <span className="uppercase tracking-widest font-bold">Dhaka Solar Elevation Angle</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Shadow Analysis Toggle */}
              <button
                onClick={() => setShadowAnalysisActive(!shadowAnalysisActive)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[8.5px] font-mono uppercase tracking-wider border transition-all cursor-pointer ${
                  shadowAnalysisActive
                    ? "bg-amber-50 text-amber-700 border-amber-200 shadow-sm font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
                title="Display exact projected ground shadow footprint based on active sun position"
              >
                <Compass className={`w-3 h-3 ${shadowAnalysisActive ? "text-amber-500 animate-spin-slow" : "text-slate-400"}`} />
                <span>Shadow Analysis</span>
                <span className={`h-1.5 w-1.5 rounded-full ${shadowAnalysisActive ? "bg-amber-500 animate-pulse" : "bg-slate-300"}`}></span>
              </button>

              <span className="text-cyan-600 font-mono text-[9px] font-bold bg-cyan-50/50 border border-cyan-100 px-2 py-0.5 rounded-full shrink-0">
                {sunAngle}° ({
                  sunAngle <= 30 || sunAngle >= 330 ? "Midnight" : sunAngle <= 85 ? "Sunrise" : sunAngle <= 265 ? "Midday Clear Sky" : "Golden Sunset"
                })
              </span>
            </div>
          </div>

          {/* Interactive slider */}
          <div className="flex items-center space-x-3">
            <span className="text-[9px] font-mono text-slate-400">0°</span>
            <input
              type="range"
              min="0"
              max="360"
              value={sunAngle}
              onChange={(e) => setSunAngle(parseInt(e.target.value))}
              className="w-full accent-cyan-600 bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[9px] font-mono text-slate-400">360°</span>
          </div>

          <div className="text-[8px] font-mono text-slate-400 text-center uppercase tracking-wide">
            Rotate slider to transition between Day, Amber Golden Hour, and High-Contrast Night illuminated views
          </div>

        </div>
      </div>

      {/* 7. MINIMAL BRAND FLAG */}
      <div className="absolute bottom-6 right-6 z-10 pointer-events-none hidden md:block">
        <div className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-mono text-slate-500 flex items-center space-x-1.5">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Interactive Architectural CAD Sheet</span>
        </div>
      </div>

      {/* 8. DETAILED 2D ARCHITECTURAL FLOOR PLAN BLUEPRINT MODAL */}
      {vrModeActive && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm px-4 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-xl border border-purple-200 p-4 rounded-2xl shadow-xl space-y-2 text-center animate-fade-in">
            <div className="flex items-center justify-center space-x-2 text-purple-700 font-mono font-bold text-[10px] uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
              <span>STEREOSCOPIC VR WALKTHROUGH ACTIVE</span>
            </div>
            <p className="text-[9px] font-mono text-slate-600 leading-relaxed">
              Side-by-side stereoscopic split-screen is rendering live with virtual eye-separation. Enable <span className="text-amber-700 font-bold">Model Auto-Spin</span> to automatically glide and tour Mollik Tower, or orbit/drag with mouse to look around in virtual reality!
            </p>
            <div className="flex justify-center pt-1">
              <button
                onClick={() => setVrModeActive(false)}
                className="px-3 py-1 text-[8.5px] font-mono font-bold uppercase rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-all cursor-pointer"
              >
                Exit VR Viewport
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedFloorPlan && (
        <BlueprintModal
          floorNum={selectedFloorPlan.floorNum}
          floorName={selectedFloorPlan.floorName}
          isMetric={isMetric}
          onClose={() => setSelectedFloorPlan(null)}
        />
      )}

    </div>
  );
}

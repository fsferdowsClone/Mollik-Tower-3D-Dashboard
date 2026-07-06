import React, { useState } from "react";
import { X, Layers, Maximize2, Compass, LayoutGrid, Cpu, ShieldCheck, Sun, Split, Sparkles, Building2 } from "lucide-react";

interface BlueprintModalProps {
  floorNum: number;
  floorName: string;
  onClose: () => void;
}

export default function BlueprintModal({ floorNum, floorName, onClose }: BlueprintModalProps) {
  // Allow user to toggle between different floors from within the blueprint viewer!
  const [currentLevel, setCurrentLevel] = useState<number>(floorNum);
  const [isSplitView, setIsSplitView] = useState<boolean>(false);
  const [leftLevel, setLeftLevel] = useState<number>(floorNum);
  const [rightLevel, setRightLevel] = useState<number>(floorNum === 18 ? 5 : 18);

  // States for new requested features
  const [compareWithBelow, setCompareWithBelow] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"sheets" | "legend">("sheets");

  // Derive floor details based on active selected level
  const getFloorDetails = (level: number) => {
    if (level === 1) {
      return {
        name: "Ground Floor Lobby",
        height: "8.20 meters",
        area: "720 m²",
        efficiency: "94.5%",
        occupancy: "Grand Entrance & Reception",
        specList: [
          { label: "Spider Glass", val: "Low-Iron Monolithic Safety Glass" },
          { label: "Floor Finish", val: "Calacatta Gold Italian Marble Slab" },
          { label: "Entrance", val: "3.2m Automatic Revolving Glass Portal" },
          { label: "Elevators", val: "4x Schindler High-Speed Smart Elevators" },
          { label: "HVAC Zone", val: "Centralized VAV Constant-Volume Supply" }
        ]
      };
    } else if (level >= 2 && level <= 4) {
      return {
        name: `Podium Retail - Level ${level}`,
        height: "3.60 meters",
        area: "1,150 m²",
        efficiency: "88.2%",
        occupancy: "Premium Retail & F&B Outlets",
        specList: [
          { label: "Structure", val: "C40 Post-Tensioned Concrete Frame" },
          { label: "Facade", val: "Crimson Perforated Aluminum Composite Panels" },
          { label: "Atrium", val: "16-Meter Centering Skylight Dome" },
          { label: "Subsystem", val: "Smart Ventilation with CO₂ Monitoring" },
          { label: "Fire Safety", val: "Grade-A Automated Dry-Pipe Sprinklers" }
        ]
      };
    } else if (level === 18) {
      return {
        name: "Rooftop Sky Garden",
        height: "3.50 meters",
        area: "640 m²",
        efficiency: "72.0%",
        occupancy: "Landscaped Garden & Solar Array",
        specList: [
          { label: "Garden Soil", val: "150mm lightweight engineered substrate" },
          { label: "Solar Energy", val: "45 kWp Monocrystalline PV Panels" },
          { label: "HVAC Stack", val: "Dual Variable-Refrigerant Flow condensers" },
          { label: "Balustrade", val: "15mm tempered clear safety glass barriers" },
          { label: "Rain Capture", val: "Active stormwater greywater recycling tank" }
        ]
      };
    } else {
      return {
        name: `Commercial Suite - Floor ${level}`,
        height: "3.20 meters",
        area: "860 m²",
        efficiency: "91.8%",
        occupancy: "Executive Premium Office Spaces",
        specList: [
          { label: "Ceiling", val: "Acoustic mineral fiber panel layout" },
          { label: "Curtain Wall", val: "Sky-Blue Triple-Silver Low-E DGU" },
          { label: "Mullion System", val: "120mm deep extruded aluminum framing" },
          { label: "Lighting", val: "IoT Dali-controlled 2.4w smart LED fixtures" },
          { label: "Refuge Zone", val: "Integrated pressurized fire escape stairwell" }
        ]
      };
    }
  };

  const activeDetails = getFloorDetails(currentLevel);

  // Helper to determine the floor beneath the active selected level for underlay mapping
  const getLevelBelow = (level: number) => {
    if (level === 18) return 10; // Below Rooftop is Offices
    if (level >= 5 && level <= 17) return 3; // Below Offices is Podium
    if (level >= 2 && level <= 4) return 1; // Below Podium is Lobby
    return 0; // Below Lobby is Basement Foundation cap level
  };

  // Reusable core vector components to draw active floor plan vs. underlying reference outline
  const renderInnerElements = (level: number, isOverlay: boolean = false) => {
    const strokeColor = (activeCol: string, overlayCol: string = "currentColor") => isOverlay ? overlayCol : activeCol;
    const fillColor = (activeCol: string, overlayCol: string = "none") => isOverlay ? overlayCol : activeCol;

    if (level === 0) {
      // Sub-level 0 Foundational Basement Footprint & Piles
      return (
        <>
          {/* Diaphragm outer concrete foundation walls */}
          <rect x="45" y="45" width="310" height="310" rx="6" stroke={strokeColor("#a855f7")} strokeWidth={isOverlay ? "1.2" : "2.5"} strokeDasharray={isOverlay ? "3,3" : "6,4"} fill="none" />
          <rect x="52" y="52" width="296" height="296" rx="4" stroke={strokeColor("#c084fc")} strokeWidth="1" strokeDasharray="3,3" fill="none" />

          {/* Mass concrete friction piles/piers matrix */}
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3].map((c) => {
              const cx = 80 + r * 80;
              const cy = 80 + c * 80;
              return (
                <g key={`${r}-${c}`}>
                  <circle cx={cx} cy={cy} r="10" stroke={strokeColor("#c084fc")} strokeWidth="1.5" fill="none" />
                  <line x1={cx - 14} y1={cy} x2={cx + 14} y2={cy} stroke={strokeColor("#c084fc")} strokeWidth="1" />
                  <line x1={cx} y1={cy - 14} x2={cx} y2={cy + 14} stroke={strokeColor("#c084fc")} strokeWidth="1" />
                  {!isOverlay && (
                    <text x={cx + 12} y={cy + 4} className="fill-purple-600 text-[7px] font-mono">P-{r * 4 + c + 1}</text>
                  )}
                </g>
              );
            })
          )}

          {/* Main concrete tie-beams */}
          <line x1="80" y1="80" x2="320" y2="80" stroke={strokeColor("#d8b4fe")} strokeWidth="1" strokeDasharray="4,2" />
          <line x1="80" y1="160" x2="320" y2="160" stroke={strokeColor("#d8b4fe")} strokeWidth="1" strokeDasharray="4,2" />
          <line x1="80" y1="240" x2="320" y2="240" stroke={strokeColor("#d8b4fe")} strokeWidth="1" strokeDasharray="4,2" />
          <line x1="80" y1="320" x2="320" y2="320" stroke={strokeColor("#d8b4fe")} strokeWidth="1" strokeDasharray="4,2" />

          <line x1="80" y1="80" x2="80" y2="320" stroke={strokeColor("#d8b4fe")} strokeWidth="1" strokeDasharray="4,2" />
          <line x1="160" y1="80" x2="160" y2="320" stroke={strokeColor("#d8b4fe")} strokeWidth="1" strokeDasharray="4,2" />
          <line x1="240" y1="80" x2="240" y2="320" stroke={strokeColor("#d8b4fe")} strokeWidth="1" strokeDasharray="4,2" />
          <line x1="320" y1="80" x2="320" y2="320" stroke={strokeColor("#d8b4fe")} strokeWidth="1" strokeDasharray="4,2" />

          {!isOverlay && (
            <text x="110" y="205" className="fill-purple-700 text-[9px] font-mono font-bold uppercase tracking-widest">FOUNDATION PILE MATRIX</text>
          )}
        </>
      );
    }

    if (level === 1) {
      // Ground floor Lobby plan
      return (
        <>
          {/* Exterior Double Wall Border */}
          <rect x="50" y="50" width="300" height="300" rx="8" stroke={strokeColor("#0284c7")} strokeWidth={isOverlay ? "1" : "2"} strokeDasharray={isOverlay ? "4,3" : "6,3"} fill="none" />
          <rect x="55" y="55" width="290" height="290" rx="6" stroke={strokeColor("#38bdf8")} strokeWidth="1" fill="none" />

          {/* Entrance Door revolving layout */}
          <circle cx="200" cy="350" r="22" stroke={strokeColor("#d97706")} strokeWidth="1.5" fill="none" />
          <line x1="200" y1="328" x2="200" y2="372" stroke={strokeColor("#d97706")} strokeWidth="2" />
          <line x1="178" y1="350" x2="222" y2="350" stroke={strokeColor("#d97706")} strokeWidth="2" />
          {!isOverlay && (
            <text x="175" y="318" className="fill-amber-700 text-[9px] font-mono font-bold">GRAND PORTAL</text>
          )}

          {/* Central Structural Concrete Core (Shear walls) */}
          <rect x="150" y="150" width="100" height="100" rx="4" stroke={strokeColor("#dc2626")} strokeWidth={isOverlay ? "1.5" : "2.5"} fill={fillColor("#fee2e2", "none")} fillOpacity={isOverlay ? "0" : "0.3"} />
          {/* Shaft partitions inside core */}
          <line x1="200" y1="150" x2="200" y2="250" stroke={strokeColor("#dc2626")} strokeWidth="1" />
          <line x1="150" y1="200" x2="250" y2="200" stroke={strokeColor("#dc2626")} strokeWidth="1" />
          {/* Elevator icons inside shafts */}
          {!isOverlay && (
            <>
              <text x="168" y="182" className="fill-red-700 text-[9px] font-mono">LIFT 1</text>
              <text x="212" y="182" className="fill-red-700 text-[9px] font-mono">LIFT 2</text>
              <text x="168" y="232" className="fill-red-700 text-[9px] font-mono">LIFT 3</text>
              <text x="212" y="232" className="fill-red-700 text-[9px] font-mono">LIFT 4</text>
            </>
          )}

          {/* Reception Counter Curved */}
          <path d="M 120 290 Q 200 310 280 290" stroke={strokeColor("#059669")} strokeWidth="2.5" fill="none" />
          {!isOverlay && (
            <text x="162" y="280" className="fill-emerald-700 text-[9px] font-mono uppercase font-bold">Reception desk</text>
          )}

          {/* Structural Columns - Bronze Pilasters mapped */}
          {[
            { cx: 65, cy: 65 }, { cx: 200, cy: 65 }, { cx: 335, cy: 65 },
            { cx: 65, cy: 200 }, { cx: 335, cy: 200 },
            { cx: 65, cy: 335 }, { cx: 335, cy: 335 }
          ].map((col, idx) => (
            <circle key={idx} cx={col.cx} cy={col.cy} r="8" fill={fillColor("#fef3c7", "none")} stroke={strokeColor("#d97706")} strokeWidth="2" />
          ))}

          {/* Lounge furniture layout indicators */}
          {!isOverlay && (
            <>
              <rect x="75" y="120" width="30" height="15" rx="2" stroke="#94a3b8" strokeWidth="1" fill="none" />
              <rect x="75" y="145" width="30" height="15" rx="2" stroke="#94a3b8" strokeWidth="1" fill="none" />
              <rect x="295" y="120" width="30" height="15" rx="2" stroke="#94a3b8" strokeWidth="1" fill="none" />
              <rect x="295" y="145" width="30" height="15" rx="2" stroke="#94a3b8" strokeWidth="1" fill="none" />
            </>
          )}

          {/* CAD dimensions */}
          {!isOverlay && (
            <>
              <line x1="50" y1="30" x2="350" y2="30" stroke="#0284c7" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="50" y1="25" x2="50" y2="35" stroke="#0284c7" strokeWidth="1" />
              <line x1="350" y1="25" x2="350" y2="35" stroke="#0284c7" strokeWidth="1" />
              <text x="175" y="24" className="fill-cyan-700 text-[9px] font-mono font-bold">36,000 mm</text>

              <line x1="25" y1="50" x2="25" y2="350" stroke="#0284c7" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="20" y1="50" x2="30" y2="50" stroke="#0284c7" strokeWidth="1" />
              <line x1="20" y1="350" x2="30" y2="350" stroke="#0284c7" strokeWidth="1" />
              <text x="12" y="205" className="fill-cyan-700 text-[9px] font-mono font-bold [writing-mode:vertical-lr] rotate-180">36,000 mm</text>
            </>
          )}
        </>
      );
    } else if (level >= 2 && level <= 4) {
      // Podium Retail layouts
      return (
        <>
          {/* Asymmetrical Crimson Podium shell outer bounds */}
          <path d="M 40 40 L 360 40 L 360 260 L 220 360 L 40 360 Z" stroke={strokeColor("#dc2626")} strokeWidth={isOverlay ? "1.5" : "2.5"} fill="none" />
          <path d="M 45 45 L 355 45 L 355 255 L 217 355 L 45 355 Z" stroke={strokeColor("#ef4444")} strokeWidth="1" strokeDasharray="4,2" fill="none" />

          {/* Central Glass Atrium Skylight circle */}
          <circle cx="160" cy="180" r="45" stroke={strokeColor("#0284c7")} strokeWidth="2" fill={fillColor("#e0f2fe", "none")} fillOpacity={isOverlay ? "0" : "0.3"} />
          <circle cx="160" cy="180" r="38" stroke={strokeColor("#38bdf8")} strokeWidth="1" strokeDasharray="4,2" fill="none" />
          {!isOverlay && (
            <text x="122" y="184" className="fill-cyan-700 text-[9px] font-mono uppercase font-bold tracking-wider">GLASS ATRIUM</text>
          )}

          {/* Retail partition blocks */}
          <rect x="65" y="65" width="70" height="55" stroke={strokeColor("#059669")} strokeWidth="1.5" fill="none" />
          {!isOverlay && <text x="82" y="98" className="fill-emerald-700 text-[9px] font-mono font-bold">STORE A</text>}

          <rect x="155" y="65" width="75" height="55" stroke={strokeColor("#059669")} strokeWidth="1.5" fill="none" />
          {!isOverlay && <text x="175" y="98" className="fill-emerald-700 text-[9px] font-mono font-bold">STORE B</text>}

          <rect x="250" y="65" width="90" height="55" stroke={strokeColor("#059669")} strokeWidth="1.5" fill="none" />
          {!isOverlay && <text x="268" y="98" className="fill-emerald-700 text-[9px] font-mono font-bold">RESTAURANT</text>}

          <rect x="65" y="270" width="80" height="70" stroke={strokeColor("#059669")} strokeWidth="1.5" fill="none" />
          {!isOverlay && <text x="85" y="310" className="fill-emerald-700 text-[9px] font-mono font-bold">STORE C</text>}

          <path d="M 240 250 L 340 250 L 280 320 Z" stroke={strokeColor("#059669")} strokeWidth="1.5" fill="none" />
          {!isOverlay && <text x="264" y="280" className="fill-emerald-700 text-[9px] font-mono font-bold">CAFE DECK</text>}

          {/* Structural core (offset from center) */}
          <rect x="140" y="210" width="40" height="40" stroke={strokeColor("#dc2626")} strokeWidth="2" fill={fillColor("#fee2e2", "none")} />
          {!isOverlay && <text x="148" y="234" className="fill-red-700 text-[8px] font-mono font-bold">CORE</text>}

          {/* Escalator symbol */}
          <rect x="240" y="150" width="45" height="18" stroke={strokeColor("#d97706")} strokeWidth="1.5" fill="none" />
          <line x1="240" y1="168" x2="285" y2="150" stroke={strokeColor("#d97706")} strokeWidth="1.5" />
          {!isOverlay && <text x="243" y="142" className="fill-amber-700 text-[8px] font-mono font-bold">ESCALATOR UP</text>}
        </>
      );
    } else if (level === 18) {
      // Rooftop Sky Garden plans
      return (
        <>
          {/* Standard Tower Boundary 8x8 */}
          <rect x="60" y="60" width="280" height="280" rx="4" stroke={strokeColor("#059669")} strokeWidth={isOverlay ? "1.5" : "2.2"} fill="none" />
          <rect x="65" y="65" width="270" height="270" rx="2" stroke={strokeColor("#10b981")} strokeWidth="1" strokeDasharray="3,3" fill="none" />

          {/* Walking Paths curving around garden */}
          <path d="M 100 100 Q 200 70 300 100 Q 330 200 300 300 Q 200 330 100 300 Q 70 200 100 100 Z" stroke="#64748b" strokeWidth="1.5" strokeDasharray="5,3" fill="none" />
          {!isOverlay && <text x="160" y="130" className="fill-slate-600 text-[9px] font-mono font-bold">SKY PATHWAY</text>}

          {/* Solar Panel Array grids */}
          <g transform="translate(190, 160)">
            {!isOverlay && <text x="0" y="-12" className="fill-amber-700 text-[8px] font-mono font-bold">PV SOLAR STACKS</text>}
            <rect x="0" y="0" width="35" height="20" rx="1" stroke={strokeColor("#d97706")} strokeWidth="1" fill={fillColor("#fef3c7", "none")} />
            <rect x="45" y="0" width="35" height="20" rx="1" stroke={strokeColor("#d97706")} strokeWidth="1" fill={fillColor("#fef3c7", "none")} />
            <rect x="0" y="28" width="35" height="20" rx="1" stroke={strokeColor("#d97706")} strokeWidth="1" fill={fillColor("#fef3c7", "none")} />
            <rect x="45" y="28" width="35" height="20" rx="1" stroke={strokeColor("#d97706")} strokeWidth="1" fill={fillColor("#fef3c7", "none")} />
          </g>

          {/* HVAC Chillers */}
          <g transform="translate(80, 170)">
            <rect x="0" y="0" width="28" height="28" stroke="#475569" strokeWidth="1.5" fill="none" />
            <circle cx="14" cy="14" r="9" stroke="#475569" strokeWidth="1" fill="none" />
            {!isOverlay && <text x="-4" y="-8" className="fill-slate-500 text-[8px] font-mono">CHILLER 1</text>}
          </g>
          <g transform="translate(80, 225)">
            <rect x="0" y="0" width="28" height="28" stroke="#475569" strokeWidth="1.5" fill="none" />
            <circle cx="14" cy="14" r="9" stroke="#475569" strokeWidth="1" fill="none" />
            {!isOverlay && <text x="-4" y="-8" className="fill-slate-500 text-[8px] font-mono">CHILLER 2</text>}
          </g>

          {/* Landscaped Green shrub polygons */}
          <path d="M 80 80 L 150 75 L 140 120 L 75 110 Z" fill={fillColor("#d1fae5", "none")} opacity={isOverlay ? "0" : "0.5"} stroke={strokeColor("#059669")} strokeWidth="1" />
          {!isOverlay && <text x="92" y="98" className="fill-emerald-800 text-[8px] font-mono font-bold">ZONE ALPHA</text>}

          <path d="M 260 260 L 320 250 L 310 320 L 240 310 Z" fill={fillColor("#d1fae5", "none")} opacity={isOverlay ? "0" : "0.5"} stroke={strokeColor("#059669")} strokeWidth="1" />
          {!isOverlay && <text x="264" y="290" className="fill-emerald-800 text-[8px] font-mono font-bold">ZONE BETA</text>}
        </>
      );
    } else {
      // Commercial office suite plan (Floors 5 to 17)
      return (
        <>
          {/* Outer Glass Curtain boundary 8m x 8m */}
          <rect x="60" y="60" width="280" height="280" rx="4" stroke={strokeColor("#0284c7")} strokeWidth={isOverlay ? "1.5" : "2.2"} fill="none" />
          <rect x="65" y="65" width="270" height="270" rx="2" stroke={strokeColor("#38bdf8")} strokeWidth="1" strokeDasharray="3,1" fill="none" />

          {/* Central Structural Concrete Core Shear layout */}
          <rect x="145" y="145" width="110" height="110" rx="3" stroke={strokeColor("#dc2626")} strokeWidth={isOverlay ? "1.5" : "2.5"} fill={fillColor("#fee2e2", "none")} fillOpacity={isOverlay ? "0" : "0.3"} />
          <line x1="200" y1="145" x2="200" y2="255" stroke={strokeColor("#dc2626")} strokeWidth="1" />
          <line x1="145" y1="200" x2="255" y2="200" stroke={strokeColor("#dc2626")} strokeWidth="1" />
          {!isOverlay && (
            <text x="172" y="135" className="fill-red-700 text-[8px] font-mono font-bold uppercase tracking-widest">SHEAR CORE</text>
          )}

          {/* Elevator indicators */}
          {!isOverlay && (
            <>
              <text x="162" y="180" className="fill-red-700 text-[8px] font-mono">LIFT A</text>
              <text x="212" y="180" className="fill-red-700 text-[8px] font-mono">LIFT B</text>
              <text x="162" y="230" className="fill-red-700 text-[8px] font-mono">LIFT C</text>
              <text x="212" y="230" className="fill-red-700 text-[8px] font-mono">LIFT D</text>
            </>
          )}

          {/* Executive partitioned office suites wrapping around facade */}
          {/* Suite 1 (Top Left) */}
          <rect x="65" y="65" width="75" height="75" stroke={strokeColor("#0284c7")} strokeWidth="1.2" fill="none" />
          {!isOverlay && (
            <>
              <text x="75" y="95" className="fill-cyan-800 text-[8px] font-mono font-bold">SUITE 1</text>
              <text x="75" y="110" className="fill-slate-500 text-[7px] font-mono">CEO Office</text>
            </>
          )}

          {/* Suite 2 (Top Right) */}
          <rect x="260" y="65" width="75" height="75" stroke={strokeColor("#0284c7")} strokeWidth="1.2" fill="none" />
          {!isOverlay && (
            <>
              <text x="270" y="95" className="fill-cyan-800 text-[8px] font-mono font-bold">SUITE 2</text>
              <text x="270" y="110" className="fill-slate-500 text-[7px] font-mono">Board Room</text>
            </>
          )}

          {/* Suite 3 (Bottom Left) */}
          <rect x="65" y="260" width="75" height="75" stroke={strokeColor("#0284c7")} strokeWidth="1.2" fill="none" />
          {!isOverlay && (
            <>
              <text x="75" y="290" className="fill-cyan-800 text-[8px] font-mono font-bold">SUITE 3</text>
              <text x="75" y="305" className="fill-slate-500 text-[7px] font-mono">Finance</text>
            </>
          )}

          {/* Open Plan workstations (Bottom Right) */}
          <path d="M 200 280 L 335 280 L 335 335 L 260 335 Z" stroke={strokeColor("#059669")} strokeWidth="1" strokeDasharray="3,2" fill="none" />
          {!isOverlay && (
            <>
              <text x="215" y="305" className="fill-emerald-800 text-[8px] font-mono font-bold">OPEN WORKSPACE</text>
              <text x="215" y="318" className="fill-slate-500 text-[7px] font-mono">24 Desks Layout</text>
            </>
          )}

          {/* Architectural dimension strings */}
          {!isOverlay && (
            <>
              <line x1="60" y1="40" x2="340" y2="40" stroke="#0284c7" strokeWidth="0.8" />
              <line x1="60" y1="36" x2="60" y2="44" stroke="#0284c7" strokeWidth="1" />
              <line x1="340" y1="36" x2="340" y2="44" stroke="#0284c7" strokeWidth="1" />
              <text x="172" y="32" className="fill-cyan-700 text-[9px] font-mono font-bold">24,000 mm</text>
            </>
          )}
        </>
      );
    }
  };

  // Render SVG Floor Plan matching selected category
  const renderSVGFloorPlan = (level: number, showOverlay: boolean = false) => {
    const levelBelow = getLevelBelow(level);
    return (
      <svg viewBox="0 0 400 400" className="w-full h-full text-cyan-600 stroke-cyan-600/40 fill-none select-none">
        <defs>
          <pattern id="modal-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#modal-grid)" />

        {/* FAINT OVERLAY UNDERLAY footprint of the floor below */}
        {showOverlay && (
          <g opacity="0.3" className="pointer-events-none text-[#a855f7] stroke-[#a855f7] fill-none" strokeWidth="1" strokeDasharray="4,3">
            {renderInnerElements(levelBelow, true)}
          </g>
        )}

        {/* ACTIVE MAIN LEVEL LAYOUT */}
        <g>
          {renderInnerElements(level, false)}
        </g>
      </svg>
    );
  };

  const renderSplitPane = (
    level: number,
    setLevel: (lvl: number) => void,
    paneLabel: string
  ) => {
    const details = getFloorDetails(level);
    return (
      <div className="flex flex-col h-full overflow-y-auto p-5 space-y-4">
        {/* Pane Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
              SHEET {paneLabel}
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-800 truncate max-w-[150px]">
              {details.name}
            </span>
          </div>

          {/* Selector */}
          <div className="flex items-center space-x-1">
            {[
              { lvl: 1, label: "Lobby" },
              { lvl: 3, label: "Podium" },
              { lvl: 10, label: "Offices" },
              { lvl: 18, label: "Rooftop" }
            ].map((opt) => {
              const isActive = (opt.lvl === 1 && level === 1) ||
                              (opt.lvl === 3 && level >= 2 && level <= 4) ||
                              (opt.lvl === 10 && level >= 5 && level <= 17) ||
                              (opt.lvl === 18 && level === 18);
              return (
                <button
                  key={opt.lvl}
                  onClick={() => setLevel(opt.lvl)}
                  className={`px-2 py-1 text-[8px] font-mono uppercase rounded border transition-all cursor-pointer ${
                    isActive
                      ? "bg-cyan-50 border-cyan-500 text-cyan-700 font-bold"
                      : "bg-white border-slate-200 text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CAD drawing box with Blueprint Grid */}
        <div className="relative border border-slate-200 bg-[#fafcfd] rounded-2xl p-4 shadow-sm aspect-[4/3] flex items-center justify-center">
          <div className="w-full max-w-[280px] aspect-square relative flex items-center justify-center">
            {renderSVGFloorPlan(level, compareWithBelow)}
          </div>
          <div className="absolute bottom-2 right-2 text-[8px] font-mono text-slate-400">
            SHEET: AD-201-{level}
          </div>
        </div>

        {/* Comparative stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
            <span className="text-[8px] font-mono text-slate-400 block uppercase font-bold">Gross Area</span>
            <span className="text-slate-800 font-mono text-xs font-bold">{details.area}</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
            <span className="text-[8px] font-mono text-slate-400 block uppercase font-bold">Efficiency</span>
            <span className="text-emerald-600 font-mono text-xs font-bold">{details.efficiency}</span>
          </div>
        </div>

        {/* Specifications matrix */}
        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-2">
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
            Technical Specs Matrix {paneLabel}
          </span>
          <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
            {details.specList.slice(0, 4).map((spec, sidx) => (
              <div key={sidx} className="bg-white border border-slate-100 p-2 rounded-lg shadow-sm">
                <span className="text-slate-400 uppercase block text-[8px]">{spec.label}</span>
                <span className="text-slate-700 font-bold leading-tight block truncate" title={spec.val}>
                  {spec.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className={`bg-white border border-slate-200 rounded-3xl w-full h-[90vh] md:h-[85vh] flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${
        isSplitView ? "max-w-[95vw]" : "max-w-5xl"
      }`}>
        
        {/* Modal Header */}
        <div className="flex justify-between items-center bg-slate-50 px-6 py-4 border-b border-slate-150">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-50 border border-cyan-200 rounded-xl">
              <Layers className="w-5 h-5 text-cyan-600 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-700 tracking-widest bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  CAD BLUEPRINT
                </span>
                <span className="text-slate-400 font-mono text-[10px]">VER 2.01</span>
              </div>
              <h2 className="text-base font-bold text-slate-800 font-sans tracking-tight">
                {isSplitView ? "Comparative CAD Sheet Analyzer — Split View Comparison Mode" : `${activeDetails.name} — Interactive CAD Layout`}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSplitView(!isSplitView)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase border transition-all cursor-pointer ${
                isSplitView
                  ? "bg-cyan-50 border-cyan-500 text-cyan-700"
                  : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Split className="w-4 h-4 text-cyan-600 animate-pulse" />
              <span>{isSplitView ? "Disable Split" : "Split-View Compare"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {isSplitView ? (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-white divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            {/* Left Pane (A) */}
            {renderSplitPane(leftLevel, setLeftLevel, "A")}
            {/* Right Pane (B) */}
            {renderSplitPane(rightLevel, setRightLevel, "B")}
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-white">
            
            {/* Left Column: Specs & Floor Switcher */}
            <div className="lg:col-span-4 border-r border-slate-100 p-6 flex flex-col justify-between overflow-y-auto space-y-4 bg-slate-50/50">
              
              <div className="space-y-4">
                
                {/* 1. VISUAL THUMBNAIL PREVIEW (Micro Schematic Map) */}
                <div className="flex items-center space-x-4 bg-white border border-slate-100 p-3 rounded-2xl shadow-sm">
                  <div className="w-16 h-16 rounded-xl border border-slate-200 bg-[#fafcfd] overflow-hidden flex items-center justify-center p-1 shrink-0 relative">
                    <div className="w-full h-full scale-110">
                      {renderSVGFloorPlan(currentLevel, false)}
                    </div>
                    <div className="absolute inset-0 bg-transparent" /> {/* Click Shield */}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[8px] font-mono text-slate-400 block uppercase tracking-widest font-extrabold">Active Schematic</span>
                    <span className="text-slate-900 font-mono text-[11px] font-bold truncate block">{activeDetails.name}</span>
                    <span className="text-cyan-600 font-mono text-[9px] uppercase tracking-wide">Sheet AD-201-{currentLevel}</span>
                  </div>
                </div>

                {/* Left Panel Mode Selector Tabs (Floor sheets vs. Structural Legend) */}
                <div className="flex border-b border-slate-150 pb-0.5">
                  <button
                    onClick={() => setActiveTab("sheets")}
                    className={`flex-1 pb-2 text-[9px] font-mono uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer ${
                      activeTab === "sheets"
                        ? "border-cyan-600 text-cyan-700"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Floor Sheets
                  </button>
                  <button
                    onClick={() => setActiveTab("legend")}
                    className={`flex-1 pb-2 text-[9px] font-mono uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer ${
                      activeTab === "legend"
                        ? "border-cyan-600 text-cyan-700"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Structural Legend
                  </button>
                </div>

                {activeTab === "sheets" ? (
                  <div className="space-y-4">
                    {/* Floor Switcher Tabs inside Blueprint */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                        Select Level Sheets
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => setCurrentLevel(1)}
                          className={`py-1.5 px-2.5 text-[9px] font-mono uppercase rounded-xl border text-center transition-all cursor-pointer ${
                            currentLevel === 1
                              ? "bg-cyan-50 border-cyan-500 text-cyan-700 font-bold shadow-sm"
                              : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          Lobby G
                        </button>
                        <button
                          onClick={() => setCurrentLevel(3)}
                          className={`py-1.5 px-2.5 text-[9px] font-mono uppercase rounded-xl border text-center transition-all cursor-pointer ${
                            currentLevel >= 2 && currentLevel <= 4
                              ? "bg-cyan-50 border-cyan-500 text-cyan-700 font-bold shadow-sm"
                              : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          Podium R
                        </button>
                        <button
                          onClick={() => setCurrentLevel(10)}
                          className={`py-1.5 px-2.5 text-[9px] font-mono uppercase rounded-xl border text-center transition-all cursor-pointer ${
                            currentLevel >= 5 && currentLevel <= 17
                              ? "bg-cyan-50 border-cyan-500 text-cyan-700 font-bold shadow-sm"
                              : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          Offices 5-17
                        </button>
                        <button
                          onClick={() => setCurrentLevel(18)}
                          className={`py-1.5 px-2.5 text-[9px] font-mono uppercase rounded-xl border text-center transition-all cursor-pointer ${
                            currentLevel === 18
                              ? "bg-cyan-50 border-cyan-500 text-cyan-700 font-bold shadow-sm"
                              : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          Rooftop SkyG
                        </button>
                      </div>
                    </div>

                    {/* Compare with Below Toggle */}
                    <button
                      onClick={() => setCompareWithBelow(!compareWithBelow)}
                      className={`w-full flex items-center justify-between text-[10px] font-mono py-2.5 px-3.5 rounded-xl uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                        compareWithBelow
                          ? "bg-purple-50 border-purple-300 text-purple-700 font-bold shadow-sm"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Layers className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                        <span>Compare with Below</span>
                      </div>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                        compareWithBelow ? "bg-purple-100 text-purple-700 border border-purple-200" : "bg-slate-100 text-slate-400"
                      }`}>
                        {compareWithBelow ? "ACTIVE" : "OFF"}
                      </span>
                    </button>

                    {/* Quick Metrics */}
                    <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <div className="flex items-center space-x-1.5 text-slate-400">
                          <Maximize2 className="w-3.5 h-3.5 text-cyan-600" />
                          <span>GROSS BUILT AREA</span>
                        </div>
                        <span className="text-slate-800 font-bold">{activeDetails.area}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <div className="flex items-center space-x-1.5 text-slate-400">
                          <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" />
                          <span>PLAN EFFICIENCY</span>
                        </div>
                        <span className="text-emerald-600 font-bold">{activeDetails.efficiency}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <div className="flex items-center space-x-1.5 text-slate-400">
                          <Compass className="w-3.5 h-3.5 text-amber-600" />
                          <span>PRIMARY PURPOSE</span>
                        </div>
                        <span className="text-slate-600 font-bold text-[9px] truncate max-w-[150px]" title={activeDetails.occupancy}>
                          {activeDetails.occupancy}
                        </span>
                      </div>
                    </div>

                    {/* Technical Specifications */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                        Technical Specification Matrix
                      </span>
                      <div className="space-y-1">
                        {activeDetails.specList.slice(0, 4).map((spec, sidx) => (
                          <div key={sidx} className="bg-white border border-slate-100 p-2 rounded-xl shadow-sm space-y-0.5">
                            <span className="text-[8px] font-mono text-slate-400 uppercase block">{spec.label}</span>
                            <span className="text-slate-700 font-mono text-[9px] font-bold leading-normal">{spec.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* NEW requested feature: 'Structural Legend' panel */
                  <div className="space-y-4 animate-fade-in">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                      Blueprint Color Key & Symbols
                    </span>
                    <div className="space-y-2">
                      {[
                        {
                          title: "Shear Core Wall",
                          desc: "Reinforced C60/75 High-Strength concrete core system, designed to resist high lateral shear forces.",
                          badgeColor: "bg-red-100 border-red-200 text-red-700",
                          indicator: <span className="w-3.5 h-3.5 rounded bg-red-600 border border-red-800 shrink-0" />
                        },
                        {
                          title: "Facade Curtain Wall",
                          desc: "Double extruded structural aluminum framing backstop supporting sky-blue reflective Low-E double glazing.",
                          badgeColor: "bg-sky-100 border-sky-200 text-sky-700",
                          indicator: <span className="w-3.5 h-3.5 rounded bg-sky-500 border border-sky-600 shrink-0" />
                        },
                        {
                          title: "Structural Columns",
                          desc: "Amber metallic circles representing load-bearing steel-concrete composite pillars & bronze pilasters.",
                          badgeColor: "bg-amber-100 border-amber-200 text-amber-700",
                          indicator: <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-amber-600 shrink-0" />
                        },
                        {
                          title: "Vegetation & Drainage",
                          desc: "Lush green zone representing sedum vegetation garden mats, lightweight substrate, and water capture lines.",
                          badgeColor: "bg-emerald-100 border-emerald-200 text-emerald-700",
                          indicator: <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-600 shrink-0" />
                        },
                        {
                          title: "Egress & Revolving Portals",
                          desc: "Automated high-capacity mechanical revolving glass portals and fire-pressurized egress stairways.",
                          badgeColor: "bg-amber-100 border-amber-200 text-amber-700",
                          indicator: <span className="w-3.5 h-1.5 rounded bg-amber-600 shrink-0" />
                        },
                        {
                          title: "Underlay Footprint",
                          desc: "Faint purple dotted lines representing lower level alignment footprint (Compare with Below).",
                          badgeColor: "bg-purple-100 border-purple-200 text-purple-700",
                          indicator: <span className="w-3.5 h-1 border-t-2 border-dashed border-purple-500 shrink-0" />
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-white border border-slate-100 p-2.5 rounded-2xl shadow-sm flex items-start space-x-2.5">
                          {item.indicator}
                          <div className="space-y-0.5 min-w-0">
                            <span className="text-[9px] font-mono font-bold text-slate-800 uppercase block tracking-tight">{item.title}</span>
                            <p className="text-[8px] font-mono text-slate-400 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Smart Green Rating badge inside modal */}
              <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl flex items-start space-x-3 mt-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-emerald-700 font-extrabold tracking-widest uppercase">
                    LEED GOLD GREEN STANDARD
                  </span>
                  <p className="text-[9px] text-slate-500 font-mono leading-relaxed">
                    Compliant with high energy-efficiency ratings and eco-pavements to reduce carbon footprints.
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: High-Tech SVG CAD Drawing Board */}
            <div className="lg:col-span-8 flex flex-col relative overflow-hidden bg-slate-50">
              {/* Top Toolbar overlay on CAD Drawing */}
              <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
                <div className="bg-white/95 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-xl flex items-center space-x-2 pointer-events-auto shadow-sm">
                  <Cpu className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="text-[9px] font-mono text-cyan-700 font-extrabold uppercase tracking-widest">
                    Live Vector Render Sheet
                  </span>
                </div>

                <div className="bg-white/95 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-xl flex items-center space-x-3 pointer-events-auto text-[9px] font-mono text-slate-500 shadow-sm">
                  <div className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-600"></span>
                    <span>Curtain Frame</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                    <span>Shear Core</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>Columns</span>
                  </div>
                </div>
              </div>

              {/* Rendered CAD Canvas Drawing */}
              <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
                <div className="w-full max-w-[480px] aspect-square border border-slate-200 bg-[#fafcfd] rounded-2xl p-4 shadow-sm relative flex items-center justify-center">
                  {renderSVGFloorPlan(currentLevel, compareWithBelow)}
                </div>
              </div>

              {/* Bottom Scale ruler */}
              <div className="bg-white px-6 py-3.5 border-t border-slate-150 text-[9px] font-mono text-slate-400 flex justify-between items-center shadow-sm">
                <span>SCALE: 1:150 METRIC SYSTEM</span>
                <span>COORDINATES: CENTRAL ALIGNMENT (0.00, 0.00)</span>
                <span>SHEET: AD-201-{currentLevel}</span>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

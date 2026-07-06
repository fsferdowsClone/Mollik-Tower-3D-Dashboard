import { useState } from "react";
import { MoveHorizontal, Compass, Ruler, Maximize2 } from "lucide-react";

export default function ElevationsView() {
  const [activeCallout, setActiveCallout] = useState<string | null>(null);

  const callouts = [
    { id: "pv", label: "45 kWp Monocrystalline PV Array", x: 260, y: 35, text: "High-yield monocrystalline panels angled at 22° south for optimal solar generation feeding the building LED grids." },
    { id: "roof", label: "Landscaped Rooftop Sky Garden (+72.00m)", x: 200, y: 55, text: "Extensive green roofing layer with a 150mm engineered soil substrate, providing thermal insulation and rainwater mitigation." },
    { id: "glazing", label: "Sky-Blue Triple Silver Low-E Glass", x: 230, y: 180, text: "6mm high-performance double glazed units with argon insulation. U-value: 1.4 W/m²K, SHGC: 0.28, offering extreme solar heat rejection." },
    { id: "louvers", label: "Copper-Anodized Architectural Bronze Louvers", x: 275, y: 220, text: "Thick 400mm deep vertical louvers serving as primary structural column casings and passive shade fins." },
    { id: "branding", label: "3D Gold-Leaf Branding Signage", x: 295, y: 150, text: "Precision-molded 1.2m tall gold capital letters spelling out 'MOLLIK TOWER' vertically on the rightmost bronze pillar." },
    { id: "podium", label: "Crimson Red Perforated ACP Cladding (+11.00m)", x: 120, y: 330, text: "Geometric perforated aluminum composite panels with dynamic white LED backlighting for retail prominence." },
    { id: "lobby", label: "Spider-Supported Structural Glass Lobby", x: 220, y: 410, text: "8.2m clear height lobby clad in low-iron monolithic spider glazing, providing structural visual transparency." },
    { id: "foundation", label: "Cast-in-situ Bored Concrete Piles (-32.00m)", x: 200, y: 480, text: "1.2m diameter deep concrete piles transfer building loads to deep load-bearing strata." }
  ];

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 flex flex-col space-y-4">
      {/* Blueprint Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 space-y-2 sm:space-y-0">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest font-mono">
            Mollik Tower 2D CAD Elevation Sheet
          </h3>
          <p className="text-[10px] text-slate-400 font-mono">SHEET A-101 // FRONT NORTH ELEVATION // SCALE 1:250</p>
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Compass className="w-3.5 h-3.5 text-cyan-500 animate-spin-slow" />
            <span>N-01°</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Ruler className="w-3.5 h-3.5 text-cyan-500" />
            <span>METRIC (m)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Drafting Area */}
        <div className="lg:col-span-8 bg-slate-900/40 rounded-xl border border-slate-800/60 p-4 relative overflow-hidden flex justify-center">
          {/* Subtle Blueprint Grid Lines Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-15 pointer-events-none" />

          <svg
            viewBox="0 0 450 500"
            className="w-full max-w-[420px] h-auto select-none relative z-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* DEFINE GRADIENTS & SHADERS */}
            <defs>
              <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="copperGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#b45309" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
              <linearGradient id="podiumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#991b1b" stopOpacity="1" />
              </linearGradient>
              <pattern id="perforated" width="6" height="6" patternUnits="userSpaceOnUse">
                <circle cx="3" cy="3" r="1.2" fill="#7f1d1d" />
              </pattern>
            </defs>

            {/* GROUND LEVEL GRID */}
            <line x1="20" y1="430" x2="430" y2="430" stroke="#334155" strokeWidth="2" strokeDasharray="1 3" />
            <line x1="20" y1="431" x2="430" y2="431" stroke="#475569" strokeWidth="1" />

            {/* AXIS LABELS */}
            <text x="30" y="445" fill="#475569" fontSize="7" fontFamily="monospace">GRID X-01</text>
            <text x="400" y="445" fill="#475569" fontSize="7" fontFamily="monospace">GRID X-02</text>

            {/* ELEVATION INDICATORS (Y-AXIS METRICS) */}
            <g stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4">
              {/* Roof Line */}
              <line x1="40" y1="50" x2="380" y2="50" />
              {/* Mid/High zone divide */}
              <line x1="40" y1="180" x2="380" y2="180" />
              {/* Low zone divide */}
              <line x1="40" y1="310" x2="380" y2="310" />
              {/* Podium height */}
              <line x1="40" y1="365" x2="380" y2="365" />
              {/* Ground line */}
              <line x1="40" y1="430" x2="380" y2="430" />
            </g>

            {/* ELEVATION TEXT LABELS */}
            <g fill="#64748b" fontSize="8" fontFamily="monospace">
              <text x="375" y="47" textAnchor="start">∇ +72.00m (Roof)</text>
              <text x="375" y="177" textAnchor="start">∇ +48.00m (Story 12)</text>
              <text x="375" y="307" textAnchor="start">∇ +20.00m (Story 05)</text>
              <text x="375" y="362" textAnchor="start">∇ +11.00m (Podium)</text>
              <text x="375" y="427" textAnchor="start">∇ +0.00m (Lobby)</text>
            </g>

            {/* MAIN BUILDING STRUCTURES */}
            {/* Lobby Core */}
            <rect x="175" y="310" width="130" height="120" fill="url(#glassGrad)" stroke="#0284c7" strokeWidth="1" />

            {/* Spider Glass Lobby grid mullions */}
            <g stroke="#0284c7" strokeWidth="0.25" opacity="0.4">
              <line x1="175" y1="350" x2="305" y2="350" />
              <line x1="175" y1="390" x2="305" y2="390" />
              <line x1="207.5" y1="310" x2="207.5" y2="430" />
              <line x1="240" y1="310" x2="240" y2="430" />
              <line x1="272.5" y1="310" x2="272.5" y2="430" />
            </g>

            {/* Upper Glass Core */}
            <rect x="180" y="50" width="120" height="260" fill="url(#glassGrad)" stroke="#0284c7" strokeWidth="1" />

            {/* High-rise window glass divisions */}
            <g stroke="#38bdf8" strokeWidth="0.3" opacity="0.3">
              {Array.from({ length: 13 }).map((_, idx) => (
                <line key={idx} x1="180" y1={50 + idx * 20} x2="300" y2={50 + idx * 20} />
              ))}
              <line x1="210" y1="50" x2="210" y2="310" />
              <line x1="240" y1="50" x2="240" y2="310" />
              <line x1="270" y1="50" x2="270" y2="310" />
            </g>

            {/* BRONZE VERTICAL LOUVERS / PILASTERS */}
            {/* Louver 1 (Left) */}
            <rect x="180" y="40" width="6" height="390" fill="url(#copperGrad)" stroke="#92400e" strokeWidth="0.5" />
            {/* Louver 2 */}
            <rect x="215" y="40" width="6" height="390" fill="url(#copperGrad)" stroke="#92400e" strokeWidth="0.5" />
            {/* Louver 3 */}
            <rect x="255" y="40" width="6" height="390" fill="url(#copperGrad)" stroke="#92400e" strokeWidth="0.5" />
            {/* Louver 4 (Right with signage column) */}
            <rect x="294" y="40" width="6" height="390" fill="url(#copperGrad)" stroke="#92400e" strokeWidth="0.5" />

            {/* Vertical Mollik Tower Signage (Rightmost Pillar) */}
            <g fill="#f59e0b" fontSize="5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
              {["M", "O", "L", "L", "I", "K", " ", "T", "O", "W", "E", "R"].map((char, index) => (
                <text key={index} x="297" y={105 + index * 10}>
                  {char}
                </text>
              ))}
            </g>

            {/* ASYMMETRICAL RED PODIUM */}
            {/* 4-Story stepped Retail Podium left side */}
            <path
              d="M 60 430 L 60 330 L 110 330 L 110 310 L 175 310 L 175 430 Z"
              fill="url(#podiumGrad)"
              stroke="#b91c1c"
              strokeWidth="1.2"
            />
            {/* Geometric Perforations Fill Pattern overlay on podium */}
            <path
              d="M 60 430 L 60 330 L 110 330 L 110 310 L 175 310 L 175 430 Z"
              fill="url(#perforated)"
              opacity="0.25"
              pointerEvents="none"
            />

            {/* Structural details on retail podium */}
            <line x1="60" y1="365" x2="175" y2="365" stroke="#991b1b" strokeWidth="0.5" />
            <line x1="60" y1="400" x2="175" y2="400" stroke="#991b1b" strokeWidth="0.5" />

            {/* Cantilevered Glass Lobby Canopy */}
            <polygon points="160,370 160,374 240,374 240,370" fill="url(#copperGrad)" stroke="#92400e" strokeWidth="0.5" />

            {/* ROOF MEP EQUIPMENT DECK */}
            {/* Landscaped Roof platform base */}
            <rect x="180" y="44" width="120" height="6" fill="#16a34a" stroke="#15803d" strokeWidth="0.5" />
            {/* Glass Balustrade */}
            <rect x="180" y="32" width="120" height="12" fill="#38bdf8" fillOpacity="0.1" stroke="#38bdf8" strokeWidth="0.3" strokeDasharray="2 1" />
            {/* HVAC Chillers */}
            <rect x="190" y="30" width="18" height="14" fill="#64748b" stroke="#475569" strokeWidth="0.5" />
            <line x1="199" y1="30" x2="199" y2="44" stroke="#334155" strokeWidth="0.5" />
            {/* Slanted Solar PV panels */}
            <line x1="255" y1="44" x2="275" y2="34" stroke="#1e293b" strokeWidth="2.5" />
            <line x1="255" y1="44" x2="275" y2="34" stroke="#38bdf8" strokeWidth="0.5" />
            <line x1="270" y1="44" x2="290" y2="34" stroke="#1e293b" strokeWidth="2.5" />
            <line x1="270" y1="44" x2="290" y2="34" stroke="#38bdf8" strokeWidth="0.5" />

            {/* Sub-surface concrete pile foundations */}
            <g stroke="#475569" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6">
              <rect x="150" y="430" width="180" height="12" fill="#334155" fillOpacity="0.3" stroke="#475569" />
              <text x="240" y="438" fill="#94a3b8" fontSize="6" fontFamily="monospace" textAnchor="middle">2.5m RC PILE CAP</text>

              {/* Piles extending downwards */}
              <rect x="165" y="442" width="8" height="50" fill="#1e293b" />
              <rect x="200" y="442" width="8" height="50" fill="#1e293b" />
              <rect x="236" y="442" width="8" height="50" fill="#1e293b" />
              <rect x="272" y="442" width="8" height="50" fill="#1e293b" />
              <rect x="307" y="442" width="8" height="50" fill="#1e293b" />
            </g>

            {/* INTERACTIVE CALLOUT PINPOINTS */}
            {callouts.map((pt) => {
              const isActive = activeCallout === pt.id;
              return (
                <g
                  key={pt.id}
                  className="cursor-pointer group"
                  onClick={() => setActiveCallout(isActive ? null : pt.id)}
                  onMouseEnter={() => setActiveCallout(pt.id)}
                  onMouseLeave={() => setActiveCallout(null)}
                >
                  {/* Glowing halo when active */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isActive ? "10" : "6"}
                    className="fill-cyan-500/10 stroke-cyan-400/40 animate-pulse transition-all duration-300"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="3"
                    className="fill-cyan-400 stroke-slate-950 transition-all duration-300"
                    strokeWidth="1"
                  />
                  {/* Subtle target crosshair lines */}
                  {isActive && (
                    <g stroke="#22d3ee" strokeWidth="0.5" opacity="0.7">
                      <line x1={pt.x - 16} y1={pt.y} x2={pt.x + 16} y2={pt.y} />
                      <line x1={pt.x} y1={pt.y - 16} x2={pt.x} y2={pt.y + 16} />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Callout Explanations Panel */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Maximize2 className="w-4 h-4" />
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider">CAD Blueprint Inspector</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              Hover over or click the <span className="text-cyan-400 font-bold">cyan target beacons</span> on the draft sheet to reveal structural annotations and engineering specification callouts.
            </p>

            <div className="border-t border-slate-800/80 pt-3 min-h-[140px] flex flex-col justify-center">
              {activeCallout ? (
                (() => {
                  const data = callouts.find((c) => c.id === activeCallout);
                  return (
                    <div className="space-y-1.5 animate-fade-in">
                      <span className="text-[9px] font-mono bg-cyan-950/80 border border-cyan-800/50 text-cyan-300 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        METRIC SPEC CALLOUT
                      </span>
                      <h5 className="text-xs font-bold text-slate-100 font-mono">{data?.label}</h5>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-mono">{data?.text}</p>
                    </div>
                  );
                })()
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-4 space-y-1 text-slate-600 font-mono">
                  <MoveHorizontal className="w-5 h-5 text-slate-700 animate-pulse" />
                  <span className="text-[10px] uppercase">Awaiting Beacon Selection</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3 font-mono">
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Architectural Scale Index</h5>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
              <div className="bg-slate-900/40 p-2 rounded border border-slate-800/40">
                <span className="text-slate-500 block">DRAFT CODE</span>
                <span>BNBC-2020 COMPLIANT</span>
              </div>
              <div className="bg-slate-900/40 p-2 rounded border border-slate-800/40">
                <span className="text-slate-500 block">HEIGHT RATIO</span>
                <span>1 : 4.5 SLENDERNESS</span>
              </div>
              <div className="bg-slate-900/40 p-2 rounded border border-slate-800/40">
                <span className="text-slate-500 block">GRID OFFSET</span>
                <span>9.0m x 9.0m SYSTEM</span>
              </div>
              <div className="bg-slate-900/40 p-2 rounded border border-slate-800/40">
                <span className="text-slate-500 block">CAD COMPATIBLE</span>
                <span>ISO 128 MECHANICAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

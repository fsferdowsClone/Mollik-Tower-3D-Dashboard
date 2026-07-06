import { useState } from "react";
import { SpecItem, BuildingSection } from "../types";
import { BUILDING_SPECS, BUILDING_SECTIONS, BUILDING_METRICS } from "../data";
import { HardDrive, Eye, Wind, Layers, Sliders, Shield, Zap, TrendingUp, Sun, Droplets, ArrowUpRight } from "lucide-react";

interface SpecsDashboardProps {
  activeSectionId: string | null;
  onSectionClick: (id: string) => void;
  visualizationMode: "architectural" | "wireframe" | "blueprint";
  setVisualizationMode: (mode: "architectural" | "wireframe" | "blueprint") => void;
  sunAngle: number;
  setSunAngle: (angle: number) => void;
  autoRotate: boolean;
  setAutoRotate: (rotate: boolean) => void;
}

export default function SpecsDashboard({
  activeSectionId,
  onSectionClick,
  visualizationMode,
  setVisualizationMode,
  sunAngle,
  setSunAngle,
  autoRotate,
  setAutoRotate,
}: SpecsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"Structure" | "Facade" | "MEP" | "Sustainability">("Structure");

  const filteredSpecs = BUILDING_SPECS.filter((spec) => spec.category === activeTab);

  return (
    <div className="flex flex-col space-y-6">
      {/* 3D RENDER CONTROLS PANEL */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800/80 p-5 space-y-4">
        <div className="flex items-center space-x-2 text-cyan-400">
          <Sliders className="w-4 h-4" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-widest">3D Real-time Render Controls</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Shading mode select */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Visualizer Mode</span>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800/80">
              {(["architectural", "wireframe", "blueprint"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setVisualizationMode(mode)}
                  className={`text-[9px] font-mono py-1 px-1.5 rounded uppercase tracking-wider transition-all cursor-pointer ${
                    visualizationMode === mode
                      ? "bg-cyan-600/20 text-cyan-300 border border-cyan-500/30"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {mode === "architectural" ? "Photo" : mode === "wireframe" ? "Wire" : "Draft"}
                </button>
              ))}
            </div>
          </div>

          {/* Time of Day Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span className="uppercase tracking-wider">Sun Elevation Angle</span>
              <span className="text-cyan-400 font-bold">{sunAngle}° (
                {sunAngle <= 30 || sunAngle >= 330 ? "Midnight" : sunAngle <= 90 ? "Sunrise" : sunAngle <= 270 ? "Noon" : "Sunset"}
              )</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800/80 h-[34px]">
              <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <input
                type="range"
                min="0"
                max="360"
                value={sunAngle}
                onChange={(e) => setSunAngle(parseInt(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 h-1 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Auto Rotation switch */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Camera Orbit rotation</span>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`w-full h-[34px] flex items-center justify-center space-x-2 text-[10px] font-mono py-1.5 px-3 rounded-lg border uppercase tracking-wider transition-all cursor-pointer ${
                autoRotate
                  ? "bg-cyan-600/10 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-950/20"
                  : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-400"
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${autoRotate ? "animate-spin text-cyan-400" : ""}`} />
              <span>{autoRotate ? "Auto-Rotate ON" : "Auto-Rotate OFF"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TOWER METRICS HEADER CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {BUILDING_METRICS.map((metric, idx) => (
          <div key={idx} className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-3.5 space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              {metric.change}
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-100 font-mono tracking-tight">{metric.value}</span>
              <div className="flex items-center space-x-0.5 text-cyan-400/80 text-[8px] font-mono">
                <TrendingUp className="w-2.5 h-2.5 text-cyan-400" />
                <span>SPEC</span>
              </div>
            </div>
            <span className="text-[8.5px] font-mono text-cyan-500/80 tracking-widest uppercase block">
              {metric.label}
            </span>
          </div>
        ))}
      </div>

      {/* CORE SPECIFICATIONS TABS */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800/80 p-5 space-y-4">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-800/60 pb-3 overflow-x-auto space-x-1 scrollbar-none">
          {(["Structure", "Facade", "MEP", "Sustainability"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-mono font-medium tracking-wide transition-all uppercase cursor-pointer ${
                  isActive
                    ? "bg-cyan-600/10 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                {tab === "Structure" && <Layers className="w-3.5 h-3.5" />}
                {tab === "Facade" && <Eye className="w-3.5 h-3.5" />}
                {tab === "MEP" && <HardDrive className="w-3.5 h-3.5" />}
                {tab === "Sustainability" && <Sun className="w-3.5 h-3.5" />}
                <span>{tab} Specs</span>
              </button>
            );
          })}
        </div>

        {/* Tab specifications table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="border-b border-slate-800/40 text-[9px] uppercase tracking-widest text-slate-500">
                <th className="pb-2.5 font-semibold">Parameter</th>
                <th className="pb-2.5 font-semibold">Engineering Value</th>
                <th className="pb-2.5 font-semibold hidden md:table-cell">Subsystem Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredSpecs.map((spec, i) => (
                <tr key={i} className="text-xs group hover:bg-slate-950/20 transition-all">
                  <td className="py-3 font-semibold text-cyan-400/90 whitespace-nowrap pr-4">
                    {spec.parameter}
                  </td>
                  <td className="py-3 text-slate-100 pr-4 leading-relaxed max-w-sm">
                    {spec.value}
                  </td>
                  <td className="py-3 text-slate-400 hidden md:table-cell text-[11px] leading-relaxed">
                    {spec.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FLOOR ZONES SELECTION LIST */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800/80 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Layers className="w-4 h-4" />
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest">Floor Zones Blueprint</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase">Synchronized with 3D model</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {BUILDING_SECTIONS.map((section) => {
            const isHighlighted = activeSectionId === section.id;
            return (
              <div
                key={section.id}
                onClick={() => onSectionClick(section.id)}
                className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 relative group overflow-hidden ${
                  isHighlighted
                    ? "bg-cyan-950/30 border-cyan-500/70 shadow-lg shadow-cyan-950/20"
                    : "bg-slate-950/50 border-slate-800/60 hover:bg-slate-900/40 hover:border-slate-700/80"
                }`}
              >
                {/* Visual Highlight indicator banner */}
                {isHighlighted && (
                  <div className="absolute top-0 right-0 bg-cyan-500/20 text-cyan-300 border-l border-b border-cyan-500/40 px-2 py-0.5 text-[8px] font-mono uppercase tracking-widest rounded-bl-lg">
                    3D Focused
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 tracking-wider uppercase block">
                    {section.level}
                  </span>
                  <h4 className="text-xs font-bold text-slate-100 font-mono group-hover:text-cyan-400 transition-colors">
                    {section.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-3">
                    {section.description}
                  </p>
                </div>

                {/* mini metrics rows */}
                <div className="border-t border-slate-850/60 pt-2.5 space-y-1.5 font-mono text-[9px]">
                  {section.keyMetrics.map((met, mIdx) => (
                    <div key={mIdx} className="flex justify-between">
                      <span className="text-slate-500 uppercase">{met.label}</span>
                      <span className="text-slate-300 font-bold">{met.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-1">
                  <span className="text-[8px] font-mono text-cyan-500 group-hover:text-cyan-300 flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-all">
                    <span>Inspect</span>
                    <ArrowUpRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

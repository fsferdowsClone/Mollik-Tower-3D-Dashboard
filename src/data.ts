import { SpecItem, BuildingSection, TechnicalElevation } from "./types";

export const BUILDING_METRICS = [
  { label: "Height to Tip", value: "72.00 m", change: "18 Stories", trend: "up" },
  { label: "Total GFA", value: "24,500 m²", change: "Gross Floor Area", trend: "stable" },
  { label: "Structural Grid", value: "9.0m x 9.0m", change: "RC Flat Slab", trend: "up" },
  { label: "Seismic Zone", value: "Zone 3 (0.28g)", change: "BNBC Standard", trend: "up" },
  { label: "Wind Velocity", value: "150 mph", change: "Structural Limit", trend: "up" },
  { label: "Carbon Offset", value: "22% reduction", change: "LEED Gold Target", trend: "up" },
];

export const BUILDING_SPECS: SpecItem[] = [
  // Structure
  {
    parameter: "Foundation",
    value: "1.2m Deep Cast-in-situ Bored Piles with 2.5m thick Pile Cap",
    category: "Structure",
    description: "Anchored into dense sandy silt layer for settlement control."
  },
  {
    parameter: "Superstructure",
    value: "Reinforced Concrete Core Wall & Perimeter Frame with Flat Slabs",
    category: "Structure",
    description: "High-strength Grade 60 (415 MPa) reinforcing steel."
  },
  {
    parameter: "Concrete Strength",
    value: "C40/50 (6,000 psi) in columns & shear walls, C30/37 in slabs",
    category: "Structure",
    description: "Supplied via certified local batching plants with silca fume mix."
  },
  {
    parameter: "Slab Thickness",
    value: "225 mm Post-Tensioned Flat Slabs",
    category: "Structure",
    description: "Enables flexible tenant layouts with minimal structural drop."
  },

  // Facade
  {
    parameter: "Curtain Wall Glazing",
    value: "Sky-Blue Triple Silver Low-E Double Glazed Units (DGU)",
    category: "Facade",
    description: "6mm fully-tempered blue outer glass, 12mm Argon spacer, 6mm clear inner glass. SHGC: 0.28."
  },
  {
    parameter: "Vertical Pilasters",
    value: "Textured Copper-Anodized Architectural Bronze Profiles",
    category: "Facade",
    description: "Serves as structural vertical support columns and integrated sun-shading fins (louvers)."
  },
  {
    parameter: "Retail Podium Cladding",
    value: "Crimson Red Perforated Aluminum Composite Panels (ACP)",
    category: "Facade",
    description: "Asymmetrical 4-story retail envelope featuring dynamic back-lit geometric patterns."
  },
  {
    parameter: "Lobby Facade",
    value: "Point-supported Structural Glass System (Spider Glazing)",
    category: "Facade",
    description: "Low-iron ultra-clear monolithic glass with stainless steel tension rods."
  },

  // MEP
  {
    parameter: "HVAC System",
    value: "High-Efficiency Variable Refrigerant Flow (VRF) with Heat Recovery",
    category: "MEP",
    description: "Rooftop air-cooled outdoor units paired with indoor cassette units."
  },
  {
    parameter: "Power Generation",
    value: "2 x 1,250 kVA Synchronized Standby Diesel Generator Sets",
    category: "MEP",
    description: "100% full backup capacity including air conditioning, with soundproof acoustic enclosure."
  },
  {
    parameter: "Vertical Transportation",
    value: "4 x 1,600 kg high-speed gearless passenger elevators (3.0 m/s)",
    category: "MEP",
    description: "Smart destination dispatch control system and regenerative braking."
  },
  {
    parameter: "Fire Protection",
    value: "Automatic Wet Pipe Sprinkler System & Dual Fire Escape Stairs",
    category: "MEP",
    description: "Pressurized fire staircases, smoke exhaust, fire doors, and addressable smoke detection."
  },

  // Sustainability
  {
    parameter: "Solar Energy",
    value: "45 kWp Rooftop Monocrystalline Photovoltaic Array",
    category: "Sustainability",
    description: "Feeds directly into the main grid distribution board to power common area LED lighting."
  },
  {
    parameter: "Rainwater Harvesting",
    value: "120,000 Litre Sub-Surface Collection Tank with Filtration",
    category: "Sustainability",
    description: "Recycled water is used for landscape irrigation and flushing toilets."
  },
  {
    parameter: "Building Management",
    value: "Direct Digital Control (DDC) Smart BMS",
    category: "Sustainability",
    description: "Monitors energy metrics, indoor air quality, water flow, and occupancy in real-time."
  }
];

export const BUILDING_SECTIONS: BuildingSection[] = [
  {
    id: "penthouse",
    title: "Roof Garden & MEP Deck",
    level: "Story 18 / +72.00m",
    description: "A meticulously landscaped sky garden framed by custom glass balustrades. Features scenic walkways, visible mechanical chillers, PV panels, and cooling towers.",
    keyMetrics: [
      { label: "HVAC Capacity", value: "480 Tons" },
      { label: "PV Panel Area", value: "320 m²" },
      { label: "Sky Lounge Area", value: "450 m²" }
    ]
  },
  {
    id: "office-high",
    title: "High-Zone Premium Corporate Suites",
    level: "Stories 12-17 / +48.0m to +68.0m",
    description: "State-of-the-art office floors utilizing a column-free grid. Offers 360-degree panoramic views of the Dhaka skyline behind the sky-blue reflective glazing.",
    keyMetrics: [
      { label: "Floor Plate Efficiency", value: "91.5%" },
      { label: "Clear Ceiling Height", value: "2.95 m" },
      { label: "Design Live Load", value: "3.5 kN/m²" }
    ]
  },
  {
    id: "office-low",
    title: "Mid-Zone Office Floors",
    level: "Stories 5-11 / +20.0m to +44.0m",
    description: "Flexible co-working and corporate floorplans intersected by thick copper-finished vertical louvers, optimizing light levels and thermal comfort.",
    keyMetrics: [
      { label: "Occupant Density", value: "8.5 m²/person" },
      { label: "Daylight Autonomy", value: "78%" },
      { label: "Zoned VRF Outlets", value: "16 per floor" }
    ]
  },
  {
    id: "podium",
    title: "Asymmetrical Retail Podium",
    level: "Stories 1-4 / +0.00m to +16.00m",
    description: "A bold retail podium clad in crimson red composite panels with dynamic geo-perforated backlighting. Hosts cafes, upscale retail stores, and a central skylight atrium.",
    keyMetrics: [
      { label: "Retail Outlets", value: "24 units" },
      { label: "Atrium Height", value: "16.00 m" },
      { label: "Power Supply", value: "Dual Feed" }
    ]
  },
  {
    id: "lobby",
    title: "Grand Entrance & Cantilevered Lobby",
    level: "Ground Floor / +0.00m",
    description: "An 8-meter high-clearance glass lobby surrounded by ultra-clear monolithic glazing and prominent structural bronze pilasters. Features a dramatic cantilevered glass canopy.",
    keyMetrics: [
      { label: "Ceiling Height", value: "8.20 m" },
      { label: "Canopy Projection", value: "4.50 m" },
      { label: "Security Gates", value: "6 Lanes" }
    ]
  }
];

export const TECHNICAL_ELEVATIONS: TechnicalElevation[] = [
  {
    id: "front",
    name: "Front Elevation (North)",
    height: "72.00m",
    scale: "1:250",
    materials: ["Sky-Blue Reflective Double Glazing", "Copper-Anodized Louvers", "Crimson Red ACP", "Granite Paving"]
  },
  {
    id: "west",
    name: "West Elevation (Asymmetrical Podium)",
    height: "18.00m / 72.00m",
    scale: "1:200",
    materials: ["Crimson Red ACP with Perforations", "Spider Glass Canopy", "Sky Garden Glass Balustrade"]
  }
];

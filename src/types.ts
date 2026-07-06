export interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface SpecItem {
  parameter: string;
  value: string;
  category: "Structure" | "Facade" | "MEP" | "Sustainability" | "Lobby";
  description?: string;
}

export interface TechnicalElevation {
  id: string;
  name: string;
  height: string;
  scale: string;
  materials: string[];
}

export interface BuildingSection {
  id: string;
  title: string;
  level: string;
  description: string;
  keyMetrics: { label: string; value: string }[];
}

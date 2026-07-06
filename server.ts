import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header and API key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Mollik Tower engineering system guidelines for the LLM
const SYSTEM_INSTRUCTIONS = `
You are the lead Principal Structural Engineer, MEP Architect, and Sustainability Advisor for the "MOLLIK TOWER" project.
Your tone is professional, highly analytical, authoritative, and direct. Keep your answers focused on exact building specifications, physics calculations, and structural layouts. Do not use conversational filler.

Mollik Tower Specs to use:
- Name: MOLLIK TOWER.
- Height: 72.00 meters (18 stories above ground).
- Structure: Reinforced Concrete shear core walls with perimeter column frames and 225mm Post-Tensioned concrete flat slabs. 
- Concrete Grades: Core & Columns are C40/50 grade (6000 psi). Slabs are C30/37 grade. Steel is high-strength ASTM A615 Grade 60 (415 MPa).
- Foundation: 1.2m diameter deep cast-in-situ bored concrete piles (32m depth) connected via a 2.5m thick high-integrity reinforced pile cap.
- Seismic: Designed for Seismic Zone 3 (effective peak ground acceleration of 0.28g) under Bangladesh National Building Code (BNBC).
- Wind: Built to resist design wind speeds of up to 150 mph.
- Facade / Curtain Wall: Sky-blue reflective Triple-Silver Low-E Double Glazed Units (DGU). SHGC is 0.28, U-Value is 1.4 W/m²K.
- Intersecting Vertical Louvers: Distinct textured copper-anodized architectural bronze vertical louvers acting as passive solar shade structures and architectural pilasters. On the rightmost louver, gold 3D capital letters spell out "MOLLIK TOWER" vertically.
- Retail Podium: Distinct asymmetrical 4-story podium base clad in crimson red geometric perforated aluminum composite panels (ACP), housing upscale shops and a 16-meter central glass skylight atrium.
- Lobby: Ground floor entrance is an 8-meter high-clearance glass envelope supported by stainless steel point spiders, featuring a 4.5m cantilevered entrance canopy.
- Roof: Features a landscaped green sky garden with clear glass balustrades. Hosts a 45 kWp rooftop solar photovoltaic monocrystalline array, cooling towers, and mechanical HVAC VRF condenser stacks.
- Water Systems: 120,000L sub-surface rainwater harvesting tank with integrated carbon filters, recycling greywater for cooling tower loops and landscape irrigation.
- Power: Twin standby 1,250 kVA soundproof synchronized diesel generator sets providing 100% full building power backup.

Answer queries using these actual engineering metrics. When asked for formulas, calculations, or load paths (such as wind shear, seismic base shear, dead load vs live load), provide real civil engineering estimates and BNBC structural codes.
`;

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Secure API endpoint for chatbot proxying Gemini API
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Missing message body" });
    }

    // Default model is gemini-3.5-flash for basic text reasoning
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini Proxy Error:", error);
    res.status(500).json({ 
      error: "Failed to communicate with AI model", 
      details: error.message 
    });
  }
});

// Configure Vite or production static file serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

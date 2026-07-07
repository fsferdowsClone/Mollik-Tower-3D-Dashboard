import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface ThreeCanvasProps {
  activeSectionId: string | null;
  onSectionClick: (id: string) => void;
  visualizationMode: "architectural" | "wireframe" | "blueprint";
  sunAngle: number; // 0 to 360 degrees
  autoRotate: boolean;
  onHover: (info: { name: string; material: string; rating: string; x: number; y: number } | null) => void;
  onFloorSelect: (floorNum: number, floorName: string) => void;
  thermalOverlayActive: boolean;
  glassPreset?: string;
  claddingPreset?: string;
  vrModeActive?: boolean;
  constructionPhase?: "foundation" | "structure" | "facade" | "finishing";
  shadowAnalysisActive?: boolean;
  windTunnelActive?: boolean;
  isMetric?: boolean;
  seasonMode?: "summer" | "winter";
}

export default function ThreeCanvas({
  activeSectionId,
  onSectionClick,
  visualizationMode,
  sunAngle,
  autoRotate,
  onHover,
  onFloorSelect,
  thermalOverlayActive,
  glassPreset = "sky-blue",
  claddingPreset = "crimson-acp",
  vrModeActive = false,
  constructionPhase = "finishing",
  shadowAnalysisActive = false,
  windTunnelActive = false,
  isMetric = true,
  seasonMode = "summer",
}: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References for updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const buildingGroupRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const shadowAnalysisMeshRef = useRef<THREE.Mesh | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const spotLightRef = useRef<THREE.SpotLight | null>(null);
  const thermalMaterialGroupsRef = useRef<{ mats: THREE.MeshStandardMaterial[] }[]>([]);

  const [loading, setLoading] = useState(true);

  // Expose camera reset and quick camera preset tours
  useEffect(() => {
    const handleResetCamera = () => {
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 14, 0);
        controlsRef.current.object.position.set(28, 22, 40);
        controlsRef.current.update();
      }
    };
    const handleCameraTour = (e: Event) => {
      const customEvent = e as CustomEvent;
      const preset = customEvent.detail;
      if (!controlsRef.current) return;
      
      if (preset === "rooftop") {
        controlsRef.current.target.set(0, 32, 0);
        controlsRef.current.object.position.set(0, 42, 24);
      } else if (preset === "podium") {
        controlsRef.current.target.set(-4, 6, 0);
        controlsRef.current.object.position.set(-20, 10, 20);
      } else if (preset === "facade") {
        controlsRef.current.target.set(0, 18, 0);
        controlsRef.current.object.position.set(25, 18, 5);
      } else if (preset === "front") {
        controlsRef.current.target.set(0, 14, 0);
        controlsRef.current.object.position.set(0, 18, 48);
      }
      controlsRef.current.update();
    };
    window.addEventListener("reset-3d-camera", handleResetCamera);
    window.addEventListener("set-camera-tour", handleCameraTour);
    return () => {
      window.removeEventListener("reset-3d-camera", handleResetCamera);
      window.removeEventListener("set-camera-tour", handleCameraTour);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    setLoading(true);
    thermalMaterialGroupsRef.current = [];

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 550;

    // 1. SCENE CREATION
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Setup colors based on mode
    if (visualizationMode === "blueprint") {
      scene.background = new THREE.Color("#0f172a"); // Deep professional blueprint draft blue
      scene.fog = new THREE.FogExp2("#0f172a", 0.012);
    } else if (visualizationMode === "wireframe") {
      scene.background = new THREE.Color("#090d16"); // Elegant dark wireframe space
      scene.fog = new THREE.FogExp2("#090d16", 0.015);
    } else {
      if (seasonMode === "summer") {
        scene.background = new THREE.Color("#fdfaf2"); // Warm sun-glowing background
        scene.fog = new THREE.FogExp2("#fdfaf2", 0.008); // Thin soft summer heat haze
      } else {
        scene.background = new THREE.Color("#e2e8f0"); // Cool slate gray winter background
        scene.fog = new THREE.FogExp2("#e2e8f0", 0.015); // Thicker cold mist
      }
    }

    // 2. CAMERA SETUP
    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 1000);
    camera.position.set(28, 22, 40);

    // 3. RENDERER SETUP
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. ORBIT CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.03; // Don't allow camera under ground
    controls.minDistance = 12;
    controls.maxDistance = 90;
    controls.target.set(0, 14, 0);
    controlsRef.current = controls;

    // 5. LIGHTING SETUP
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(20, 25, 25);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 120;
    const d = 22;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;
    directionalLight.shadow.bias = -0.0005;
    scene.add(directionalLight);
    directionalLightRef.current = directionalLight;

    // Upward spotlight to illuminate facade and brand name at night
    const spotLight = new THREE.SpotLight(0xffb74d, 4.0, 40, Math.PI / 5, 0.5, 1);
    spotLight.position.set(5, 0.2, 10);
    spotLight.target.position.set(3, 18, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);
    spotLightRef.current = spotLight;

    // Mode-specific base lighting setup
    const updateLightingMode = () => {
      if (visualizationMode === "blueprint") {
        ambientLight.color.setHex(0x1e3a8a);
        ambientLight.intensity = 0.9;
        directionalLight.color.setHex(0x38bdf8);
        directionalLight.intensity = 1.2;
        renderer.toneMapping = THREE.NoToneMapping;
      } else if (visualizationMode === "wireframe") {
        ambientLight.color.setHex(0x0e172c);
        ambientLight.intensity = 0.65;
        directionalLight.color.setHex(0x14b8a6);
        directionalLight.intensity = 1.2;
        renderer.toneMapping = THREE.NoToneMapping;
      } else {
        if (seasonMode === "summer") {
          ambientLight.color.setHex(0xfef3c7); // Warm solar ambient
          ambientLight.intensity = 1.05; // Intense summer fill
          directionalLight.color.setHex(0xfffbeb); // Warm direct sunlight
          directionalLight.intensity = 2.4; // High summer sun
        } else {
          ambientLight.color.setHex(0xc0cbdc); // Cool grey-blue ambient
          ambientLight.intensity = 0.7; // Soft desaturated fill
          directionalLight.color.setHex(0xdbeafe); // Soft steel-blue winter sun
          directionalLight.intensity = 1.4; // Weaker winter sun
        }
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
      }
    };
    updateLightingMode();

    // 6. DETAILED BUILDING GENERATION
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);
    buildingGroupRef.current = buildingGroup;

    // Keep arrays for cleanup
    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];

    // Helper to register assets for disposal
    const track = <G extends THREE.BufferGeometry, M extends THREE.Material>(mesh: THREE.Mesh<G, M>) => {
      if (mesh.geometry) geometriesToDispose.push(mesh.geometry);
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => materialsToDispose.push(mat));
        } else {
          materialsToDispose.push(mesh.material);
        }
      }
      return mesh;
    };

    const createThermalMaterials = () => {
      const mats: THREE.MeshStandardMaterial[] = [];
      for (let i = 0; i < 6; i++) {
        const mat = new THREE.MeshStandardMaterial({
          color: 0x1e3a8a,
          roughness: 0.25,
          metalness: 0.15,
          emissive: 0x1e3a8a,
          emissiveIntensity: 0.2,
        });
        materialsToDispose.push(mat);
        mats.push(mat);
      }
      thermalMaterialGroupsRef.current.push({ mats });
      return mats;
    };

    // Material generator
    const getMaterial = (type: string, paramColor: number): any => {
      if (thermalOverlayActive) {
        if (type === "curtain-glass" || type === "podium-crimson" || type === "interior-core" || type === "roof-foliage") {
          return createThermalMaterials();
        }
        if (type === "interior-slab") {
          const mat = new THREE.MeshStandardMaterial({
            color: 0x075985,
            transparent: true,
            opacity: 0.3,
            wireframe: true,
          });
          materialsToDispose.push(mat);
          return mat;
        }
        if (type === "louver-bronze") {
          const mat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.85,
            metalness: 0.2,
          });
          materialsToDispose.push(mat);
          return mat;
        }
        if (type === "brand-gold") {
          const mat = new THREE.MeshStandardMaterial({
            color: 0xeab308,
            emissive: 0xeab308,
            emissiveIntensity: 0.15,
          });
          materialsToDispose.push(mat);
          return mat;
        }
      }

      const isWire = visualizationMode === "wireframe";
      const isBlue = visualizationMode === "blueprint";

      if (isWire) {
        const mat = new THREE.MeshBasicMaterial({
          color: paramColor,
          wireframe: true,
          transparent: true,
          opacity: 0.75,
        });
        materialsToDispose.push(mat);
        return mat;
      }

      if (isBlue) {
        const mat = new THREE.MeshBasicMaterial({
          color: 0x0ea5e9,
          wireframe: true,
          transparent: true,
          opacity: 0.5,
        });
        materialsToDispose.push(mat);
        return mat;
      }

      // Real Architectural Materials
      switch (type) {
        case "curtain-glass": {
          // Preset color mappings - Desaturated and realistic architectural tints
          let glassRoughness = 0.1;
          let glassMetalness = 0.9;
          let glassTransmission = 0.6;
          let glassOpacity = 0.85;

          if (glassPreset === "emerald") {
            glassRoughness = 0.08;
            glassMetalness = 0.94;
            glassTransmission = 0.3;
            glassOpacity = 0.9;
          } else if (glassPreset === "gold") {
            glassRoughness = 0.08;
            glassMetalness = 0.98;
            glassTransmission = 0.35;
            glassOpacity = 0.85;
          } else if (glassPreset === "dark-obsidian") {
            glassRoughness = 0.02;
            glassMetalness = 0.95;
            glassTransmission = 0.15;
            glassOpacity = 0.92;
          } else if (glassPreset === "copper") {
            glassRoughness = 0.05;
            glassMetalness = 0.97;
            glassTransmission = 0.32;
            glassOpacity = 0.86;
          }

          // Create an ultra-premium procedural gradient texture
          const canvas = document.createElement("canvas");
          canvas.width = 16;
          canvas.height = 512;
          const ctx = canvas.getContext("2d");
          let gradTex: THREE.CanvasTexture | undefined;
          
          if (ctx) {
            const gradient = ctx.createLinearGradient(0, 512, 0, 0); // Vertical gradient from bottom to top
            
            let bottomColor = "#0f172a"; // Deep navy
            let middleColor = "#1e293b"; 
            let topColor = "#38bdf8";    // Bright sky blue
            
            if (glassPreset === "emerald") {
              bottomColor = "#064e3b"; // Forest emerald
              middleColor = "#115e59";
              topColor = "#2dd4bf";    // Bright mint teal
            } else if (glassPreset === "gold") {
              bottomColor = "#451a03"; // Rich brown
              middleColor = "#78350f";
              topColor = "#fbbf24";    // Glowing amber gold
            } else if (glassPreset === "dark-obsidian") {
              bottomColor = "#020617"; // Black anthracite
              middleColor = "#0f172a";
              topColor = "#64748b";    // Cool steel grey
            } else if (glassPreset === "copper") {
              bottomColor = "#431407"; // Dark copper
              middleColor = "#7c2d12";
              topColor = "#f97316";    // Bright orange copper
            } else if (glassPreset === "sky-blue") {
              bottomColor = "#0c4a6e"; // Deep ocean blue
              middleColor = "#0369a1";
              topColor = "#7dd3fc";    // Soft electric sky
            }

            gradient.addColorStop(0.0, bottomColor);
            gradient.addColorStop(0.4, middleColor);
            gradient.addColorStop(1.0, topColor);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 16, 512);
            
            gradTex = new THREE.CanvasTexture(canvas);
            gradTex.wrapS = THREE.ClampToEdgeWrapping;
            gradTex.wrapT = THREE.ClampToEdgeWrapping;
          }

          const mat = new THREE.MeshPhysicalMaterial({
            map: gradTex || null,
            roughness: glassRoughness,
            metalness: glassMetalness,
            transmission: glassTransmission,
            ior: 1.52,
            thickness: 1.5,
            transparent: true,
            opacity: glassOpacity,
            side: THREE.DoubleSide,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
          });
          materialsToDispose.push(mat);
          return mat;
        }
        case "interior-slab": {
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xd4d6da), // Light-gray refined structural concrete
            roughness: 0.75,
            metalness: 0.1,
          });
          materialsToDispose.push(mat);
          return mat;
        }
        case "interior-core": {
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x383e48), // Dark slate reinforced concrete core
            roughness: 0.9,
            metalness: 0.1,
          });
          materialsToDispose.push(mat);
          return mat;
        }
        case "louver-bronze": {
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xb87333), // Satin/brushed metallic copper-anodized louver framing
            roughness: 0.35,
            metalness: 0.8,
          });
          materialsToDispose.push(mat);
          return mat;
        }
        case "brand-gold": {
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xc2a67a), // Elegant champagne gold brand details
            roughness: 0.15,
            metalness: 0.95,
            emissive: new THREE.Color(0x8f724d),
            emissiveIntensity: 0.25,
          });
          materialsToDispose.push(mat);
          return mat;
        }
        case "podium-crimson": {
          let claddingColor = 0x6e1f1f; // default Crimson ACM Terracotta (refined deep clay burgundy)
          let claddingRoughness = 0.4;
          let claddingMetalness = 0.55;

          if (claddingPreset.startsWith("#")) {
            claddingColor = parseInt(claddingPreset.substring(1), 16);
            claddingRoughness = 0.3;
            claddingMetalness = 0.7;
          } else if (claddingPreset === "champagne-gold") {
            claddingColor = 0xbda275; // Anodized Champagne Gold metallic cladding
            claddingRoughness = 0.18;
            claddingMetalness = 0.92;
          } else if (claddingPreset === "matte-platinum") {
            claddingColor = 0x5a6375; // Muted titanium/platinum panel
            claddingRoughness = 0.35;
            claddingMetalness = 0.8;
          } else if (claddingPreset === "emerald-copper") {
            claddingColor = 0x2e4f4a; // Oxidized copper / Patina verdigris
            claddingRoughness = 0.5;
            claddingMetalness = 0.4;
          } else if (claddingPreset === "midnight-obsidian") {
            claddingColor = 0x111622; // Obsidian anthracite carbon panel
            claddingRoughness = 0.25;
            claddingMetalness = 0.85;
          }

          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(claddingColor),
            roughness: claddingRoughness,
            metalness: claddingMetalness,
          });
          materialsToDispose.push(mat);
          return mat;
        }
        case "roof-foliage": {
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x273b2a), // Desaturated spruce green foliage
            roughness: 0.95,
          });
          materialsToDispose.push(mat);
          return mat;
        }
        case "pavement": {
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xe2e8f0), // Clean desaturated architectural concrete
            roughness: 0.8,
            metalness: 0.1,
          });
          materialsToDispose.push(mat);
          return mat;
        }
        case "road": {
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xf1f5f9), // Matches light-themed CAD site-plan canvas
            roughness: 0.9,
          });
          materialsToDispose.push(mat);
          return mat;
        }
        case "spider-lobby": {
          const mat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(0xf0f9ff),
            roughness: 0.02,
            metalness: 0.05,
            transmission: 0.92,
            transparent: true,
            opacity: 0.4,
          });
          materialsToDispose.push(mat);
          return mat;
        }
        default: {
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x334155),
            roughness: 0.7,
          });
          materialsToDispose.push(mat);
          return mat;
        }
      }
    };

    // Helper to add fine-line wire outlines to architectural blocks
    const addWireframeOverlay = (mesh: THREE.Mesh, colorHex: number) => {
      if (visualizationMode !== "architectural") return;
      const geo = new THREE.EdgesGeometry(mesh.geometry);
      const mat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.25,
      });
      const wire = new THREE.LineSegments(geo, mat);
      mesh.add(wire);
      geometriesToDispose.push(geo);
      materialsToDispose.push(mat);
    };

    // --- BUILDING CREATION ---

    // --- 1. REUSABLE GEOMETRIES POOL (Massive efficiency improvement, eliminating garbage collection lag) ---
    const baseWidth = 140;
    const baseGeo = new THREE.PlaneGeometry(baseWidth, baseWidth);
    const pavementGeo = new THREE.BoxGeometry(45, 0.15, 38);
    
    const coreHeight = 26;
    const coreHeightVal = constructionPhase === "foundation" ? 3.5 : (coreHeight + 8);
    const innerCoreGeo = new THREE.BoxGeometry(3.6, coreHeightVal, 3.6);
    const towerGeo = new THREE.BoxGeometry(8, coreHeight, 8);
    const floorPlateGeo = new THREE.BoxGeometry(7.85, 0.12, 7.85);
    
    const verticalMullionGeo = new THREE.BoxGeometry(0.04, coreHeight, 0.04);
    const horizontalMullionGeo = new THREE.BoxGeometry(8.06, 0.05, 0.04);
    const louverGeo = new THREE.BoxGeometry(0.38, coreHeight + 8, 8.4);
    
    const lobbyHeight = 8;
    const lobbyGeo = new THREE.BoxGeometry(8.15, lobbyHeight, 8.15);
    const canopyGeo = new THREE.BoxGeometry(9.4, 0.28, 4.2);
    
    // Interlocking Compact Retail Podium (Forming a unified base with the lobby)
    const podiumHeight = 11.2;
    const podiumGeo = new THREE.BoxGeometry(10.5, podiumHeight, 11);
    const storefrontGeo = new THREE.BoxGeometry(6, 4.2, 0.15);
    const decorativeSlatGeo = new THREE.BoxGeometry(0.15, podiumHeight, 0.25);
    const atriumGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.4, 16);
    
    // Roof sky garden elements
    const roofHeight = 1.0;
    const roofGeo = new THREE.BoxGeometry(7.85, roofHeight, 7.85);
    const pvGeo = new THREE.BoxGeometry(1.4, 0.08, 0.95);
    const chGeo = new THREE.BoxGeometry(1.6, 1.2, 1.6);
    const fenceGeo = new THREE.BoxGeometry(7.9, 0.95, 7.9);
    
    // Plaza landscaping and architectural details
    const planterGeo = new THREE.CylinderGeometry(0.9, 1.0, 0.5, 8);
    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 6);
    const leaveGeo1 = new THREE.ConeGeometry(0.7, 1.0, 8);
    const leaveGeo2 = new THREE.ConeGeometry(0.55, 0.8, 8);
    const leaveGeo3 = new THREE.ConeGeometry(0.4, 0.6, 8);
    const benchSeatGeo = new THREE.BoxGeometry(1.8, 0.1, 0.5);
    const benchLegGeo = new THREE.BoxGeometry(0.15, 0.45, 0.5);
    
    // Double-height Lobby realistic interior elements
    const lobbyColumnGeo = new THREE.CylinderGeometry(0.18, 0.18, lobbyHeight - 0.2, 8);
    const lobbyDeskGeo = new THREE.BoxGeometry(1.6, 0.75, 0.55);
    const lobbyDeskBackGeo = new THREE.BoxGeometry(2.8, 3.2, 0.1);
    
    // Street details
    const stripeGeo = new THREE.PlaneGeometry(3.5, 0.12);
    const crosswalkGeo = new THREE.PlaneGeometry(0.7, 3.8);
    const lampPostGeo = new THREE.CylinderGeometry(0.08, 0.08, 4.2, 6);
    const lampArmGeo = new THREE.BoxGeometry(0.8, 0.08, 0.08);
    const lampLightGeo = new THREE.BoxGeometry(0.15, 0.08, 0.15);
    
    // Vehicles
    const rickshawBodyGeo = new THREE.BoxGeometry(0.75, 0.8, 0.5);
    const rickshawHoodGeo = new THREE.BoxGeometry(0.4, 0.5, 0.48);
    const rickshawWheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.06, 8);
    const carBodyGeo = new THREE.BoxGeometry(1.8, 0.48, 0.85);
    const carCabinGeo = new THREE.BoxGeometry(1.0, 0.32, 0.78);
    const carWheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.12, 10);
    const vehicleLampGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);

    // Register all geometries to dispose array for flawless memory management
    geometriesToDispose.push(
      baseGeo, pavementGeo, innerCoreGeo, towerGeo, floorPlateGeo,
      verticalMullionGeo, horizontalMullionGeo, louverGeo, lobbyGeo, canopyGeo,
      podiumGeo, storefrontGeo, decorativeSlatGeo, atriumGeo, roofGeo, pvGeo,
      chGeo, fenceGeo, planterGeo, trunkGeo, leaveGeo1, leaveGeo2, leaveGeo3,
      benchSeatGeo, benchLegGeo, lobbyColumnGeo, lobbyDeskGeo, lobbyDeskBackGeo,
      stripeGeo, crosswalkGeo, lampPostGeo, lampArmGeo, lampLightGeo,
      rickshawBodyGeo, rickshawHoodGeo, rickshawWheelGeo, carBodyGeo, carCabinGeo,
      carWheelGeo, vehicleLampGeo
    );

    // --- 2. REUSABLE MATERIALS POOL (Zero duplication overhead) ---
    const whiteConcreteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8, metalness: 0.05 });
    const darkSlateMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.65 });
    const woodBrandMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5, metalness: 0.1 });
    const deskGlowMat = new THREE.MeshStandardMaterial({ color: 0xd97706, emissive: 0xd97706, emissiveIntensity: 0.35, roughness: 0.1 });
    
    const rickshawBodyMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.4 });
    const rickshawHoodMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.6 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
    
    const carCabinMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });
    const carWheelMat = wheelMat;
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfffeed });
    const taillightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xcbd5e1 });
    const crosswalkMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
    const ledSpotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lampPostMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
    const terraceBalustradeMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35, roughness: 0.05 });
    
    materialsToDispose.push(
      whiteConcreteMat, darkSlateMat, woodBrandMat, deskGlowMat, rickshawBodyMat,
      rickshawHoodMat, wheelMat, carCabinMat, carWheelMat, headlightMat, taillightMat, stripeMat,
      crosswalkMat, ledSpotMat, lampPostMat, terraceBalustradeMat
    );

    // Common materials from current theme setups
    const louverBronzeMat = getMaterial("louver-bronze", 0xb45309);
    const curtainGlassMat = getMaterial("curtain-glass", 0x0284c7);
    const roofFoliageMat = getMaterial("roof-foliage", 0x166534);
    const pavementMat = getMaterial("pavement", 0xe2e8f0);
    const interiorSlabMat = getMaterial("interior-slab", 0xe2e8f0);
    const interiorCoreMat = getMaterial("interior-core", 0x475569);
    const brandGoldMat = getMaterial("brand-gold", 0xf59e0b);
    const spiderLobbyMat = getMaterial("spider-lobby", 0xe0f2fe);
    const podiumCrimsonMat = getMaterial("podium-crimson", 0x991b1b);

    // --- 3. SCENE GROUND & STREET MARKINGS ---
    const baseMesh = new THREE.Mesh(baseGeo, getMaterial("road", 0x0f172a));
    baseMesh.rotation.x = -Math.PI / 2;
    baseMesh.receiveShadow = true;
    scene.add(baseMesh);

    // Architectural Plaza Pavement Overlay
    if (visualizationMode === "architectural" || visualizationMode === "blueprint") {
      const pavementMesh = new THREE.Mesh(pavementGeo, pavementMat);
      pavementMesh.position.set(-2, 0.075, 4);
      pavementMesh.receiveShadow = true;
      buildingGroup.add(pavementMesh);
      addWireframeOverlay(pavementMesh, 0x94a3b8);

      // Simple grid lines for custom plaza tiling look
      const plazaGrid = new THREE.GridHelper(36, 18, 0x94a3b8, 0xcbd5e1);
      plazaGrid.position.set(-2, 0.16, 4);
      scene.add(plazaGrid);

      // Pedestrian Zebra Crosswalk at the front plaza entrance
      for (let i = -2; i <= 2; i++) {
        const cwStrip = new THREE.Mesh(crosswalkGeo, crosswalkMat);
        cwStrip.rotation.x = -Math.PI / 2;
        cwStrip.position.set(10 + i * 1.5, 0.02, 17.5);
        scene.add(cwStrip);
      }
    }

    // --- 3B. SHADOW ANALYSIS OVERLAY PLANE ---
    const shadowGeo = new THREE.BufferGeometry();
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x1e293b, // deep dark slate representing a realistic shadow footprint
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false, // avoid z-fighting with the plaza flooring
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.visible = shadowAnalysisActive;
    scene.add(shadowMesh);
    shadowAnalysisMeshRef.current = shadowMesh;
    geometriesToDispose.push(shadowGeo);
    materialsToDispose.push(shadowMat);

    // --- 4. INTERNAL STRUCTURAL CORE SHEAR WALL ---
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, interiorCoreMat);
    innerCoreMesh.position.set(0, coreHeightVal / 2, 0);
    innerCoreMesh.castShadow = true;
    innerCoreMesh.receiveShadow = true;
    innerCoreMesh.userData = {
      name: "C40 Concrete Core Wall",
      material: "Reinforced concrete core (6000 psi) with 225mm shear layout",
      rating: "Designed for Seismic Zone 3 and up to 150 mph design wind loads under BNBC code."
    };
    buildingGroup.add(innerCoreMesh);
    addWireframeOverlay(innerCoreMesh, 0x334155);

    if (constructionPhase === "foundation") {
      const foundationGeo = new THREE.BoxGeometry(11, 1.8, 11);
      geometriesToDispose.push(foundationGeo);
      const foundationMesh = new THREE.Mesh(foundationGeo, interiorSlabMat);
      foundationMesh.position.set(0, 0.9, 0);
      foundationMesh.castShadow = true;
      foundationMesh.receiveShadow = true;
      foundationMesh.userData = {
        name: "Mass Concrete Foundation Raft",
        material: "C35/45 structural grade concrete with heavy high-yield steel reinforcement mesh",
        rating: "2.2-meter thick continuous raft slab safely transferring full gravity loads to friction piles."
      };
      buildingGroup.add(foundationMesh);
      addWireframeOverlay(foundationMesh, 0x475569);
    }

    // --- 5. MAIN GLASS TOWER BODY (Stories 5-17) ---
    const leftGlassGeo = new THREE.BoxGeometry(0.1, coreHeight, 8);
    const rightGlassGeo = new THREE.BoxGeometry(0.1, coreHeight, 8);
    const backGlassGeo = new THREE.BoxGeometry(8, coreHeight, 0.1);
    const frontGlassGeo = new THREE.BoxGeometry(8, coreHeight, 0.1);
    const frontColumnGeo = new THREE.BoxGeometry(0.8, coreHeight, 0.9);
    
    geometriesToDispose.push(leftGlassGeo, rightGlassGeo, backGlassGeo, frontGlassGeo, frontColumnGeo);

    const leftGlassMesh = new THREE.Mesh(leftGlassGeo, curtainGlassMat);
    leftGlassMesh.position.set(-4.0, 8 + coreHeight / 2, 0);
    leftGlassMesh.castShadow = true;
    leftGlassMesh.receiveShadow = true;
    leftGlassMesh.userData = {
      name: "Low-E Triple Silver Glass (West)",
      material: "Argon-insulated reflective glass facade panel",
      rating: "Protects against solar glare and structural heat gain."
    };

    const rightGlassMesh = new THREE.Mesh(rightGlassGeo, curtainGlassMat);
    rightGlassMesh.position.set(4.0, 8 + coreHeight / 2, 0);
    rightGlassMesh.castShadow = true;
    rightGlassMesh.receiveShadow = true;
    rightGlassMesh.userData = {
      name: "Low-E Triple Silver Glass (East)",
      material: "Argon-insulated reflective glass facade panel",
      rating: "Protects against solar glare and structural heat gain."
    };

    const backGlassMesh = new THREE.Mesh(backGlassGeo, curtainGlassMat);
    backGlassMesh.position.set(0, 8 + coreHeight / 2, -4.0);
    backGlassMesh.castShadow = true;
    backGlassMesh.receiveShadow = true;
    backGlassMesh.userData = {
      name: "Low-E Triple Silver Glass (North)",
      material: "Argon-insulated reflective glass facade panel",
      rating: "Protects against solar glare and structural heat gain."
    };

    const frontGlassMesh = new THREE.Mesh(frontGlassGeo, curtainGlassMat);
    frontGlassMesh.position.set(0, 8 + coreHeight / 2, 3.2); // Recessed by 0.8m!
    frontGlassMesh.castShadow = true;
    frontGlassMesh.receiveShadow = true;
    frontGlassMesh.userData = {
      name: "Low-E Triple Silver Glass (Recessed Front)",
      material: "Premium recessed high-performance monolithic glazing envelope",
      rating: "Elegant architectural recess, providing solar shading and unique shadow detail."
    };

    const leftColMesh = new THREE.Mesh(frontColumnGeo, podiumCrimsonMat);
    leftColMesh.position.set(-3.6, 8 + coreHeight / 2, 3.65);
    leftColMesh.castShadow = true;
    leftColMesh.receiveShadow = true;
    leftColMesh.userData = {
      name: "Left Cladded Front Column Pilaster",
      material: "Solid core composite metal cladding panel",
      rating: "Ties structural framing to the outer podium envelope seamlessly."
    };

    const rightColMesh = new THREE.Mesh(frontColumnGeo, podiumCrimsonMat);
    rightColMesh.position.set(3.6, 8 + coreHeight / 2, 3.65);
    rightColMesh.castShadow = true;
    rightColMesh.receiveShadow = true;
    rightColMesh.userData = {
      name: "Right Cladded Front Column Pilaster",
      material: "Solid core composite metal cladding panel",
      rating: "Ties structural framing to the outer podium envelope seamlessly."
    };

    if (constructionPhase === "facade" || constructionPhase === "finishing") {
      buildingGroup.add(leftGlassMesh);
      buildingGroup.add(rightGlassMesh);
      buildingGroup.add(backGlassMesh);
      buildingGroup.add(frontGlassMesh);
      buildingGroup.add(leftColMesh);
      buildingGroup.add(rightColMesh);
      
      addWireframeOverlay(leftGlassMesh, 0x0ea5e9);
      addWireframeOverlay(rightGlassMesh, 0x0ea5e9);
      addWireframeOverlay(backGlassMesh, 0x0ea5e9);
      addWireframeOverlay(frontGlassMesh, 0x0ea5e9);
      addWireframeOverlay(leftColMesh, 0xbae6fd);
      addWireframeOverlay(rightColMesh, 0xbae6fd);
    }

    // --- 6. TOWER FLOOR SLABS (Visible inside transparent glass) ---
    const floorCount = 13;
    if (constructionPhase !== "foundation") {
      for (let f = 0; f < floorCount; f++) {
        const slabMesh = new THREE.Mesh(floorPlateGeo, interiorSlabMat);
        const slabY = 8.1 + (f * coreHeight) / floorCount;
        slabMesh.position.set(0, slabY, 0);
        slabMesh.userData = {
          name: `Slab Plate - Level ${5 + f}`,
          material: "C30/37 Grade concrete flat plate floor with Post-Tensioned (PT) cabling",
          rating: "Structural thickness: 225mm. Optimizes ceiling heights and material economy."
        };
        buildingGroup.add(slabMesh);
        addWireframeOverlay(slabMesh, 0x94a3b8);

        // Add low-intensity warm point lights inside the tower windows to simulate indoor office activity
        if (visualizationMode === "architectural" && f % 3 === 0 && constructionPhase === "finishing") {
          const interiorLight = new THREE.PointLight(0xfff3e0, 0.35, 6);
          interiorLight.position.set(0, slabY + 0.8, 0);
          buildingGroup.add(interiorLight);
        }
      }
    }

    // --- 7. EXTERIOR WINDOW MULLION GRID ---
    if (visualizationMode === "architectural" && (constructionPhase === "facade" || constructionPhase === "finishing")) {
      const mullionGroup = new THREE.Group();
      mullionGroup.position.set(0, 8, 0);

      const mullionMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.6,
      });
      materialsToDispose.push(mullionMat);

      // Create vertical grids
      for (let m = 0; m <= 8; m++) {
        const xOffset = -4 + (m * 8) / 8;
        // Front face mullions (only if inside recessed glazed area)
        if (xOffset > -3.8 && xOffset < 3.8) {
          const vMullF = new THREE.Mesh(verticalMullionGeo, mullionMat);
          vMullF.position.set(xOffset, coreHeight / 2, 3.22);
          mullionGroup.add(vMullF);
        }

        // Back face mullions
        const vMullB = new THREE.Mesh(verticalMullionGeo, mullionMat);
        vMullB.position.set(xOffset, coreHeight / 2, -4.02);
        mullionGroup.add(vMullB);

        // Left face mullions
        const vMullL = new THREE.Mesh(verticalMullionGeo, mullionMat);
        vMullL.position.set(-4.02, coreHeight / 2, xOffset);
        vMullL.rotation.y = Math.PI / 2;
        mullionGroup.add(vMullL);

        // Right face mullions
        const vMullR = new THREE.Mesh(verticalMullionGeo, mullionMat);
        vMullR.position.set(4.02, coreHeight / 2, xOffset);
        vMullR.rotation.y = Math.PI / 2;
        mullionGroup.add(vMullR);
      }

      // Create horizontal bands
      const frontHorizontalMullionGeo = new THREE.BoxGeometry(7.18, 0.05, 0.04);
      geometriesToDispose.push(frontHorizontalMullionGeo);

      for (let h = 0; h <= floorCount; h++) {
        const hOffset = (h * coreHeight) / floorCount;
        
        // Front (recessed and sized to prevent overlapping front corner columns)
        const hMullF = new THREE.Mesh(frontHorizontalMullionGeo, mullionMat);
        hMullF.position.set(0, hOffset, 3.22);
        mullionGroup.add(hMullF);

        // Back
        const hMullB = new THREE.Mesh(horizontalMullionGeo, mullionMat);
        hMullB.position.set(0, hOffset, -4.02);
        mullionGroup.add(hMullB);

        // Left (rotate)
        const hMullL = new THREE.Mesh(horizontalMullionGeo, mullionMat);
        hMullL.position.set(-4.02, hOffset, 0);
        hMullL.rotation.y = Math.PI / 2;
        mullionGroup.add(hMullL);

        // Right (rotate)
        const hMullR = new THREE.Mesh(horizontalMullionGeo, mullionMat);
        hMullR.position.set(4.02, hOffset, 0);
        hMullR.rotation.y = Math.PI / 2;
        mullionGroup.add(hMullR);
      }

      buildingGroup.add(mullionGroup);
    }

    // --- 8. VERTICAL COPPER/BRONZE LOUVERS (PILASTERS) ---
    if (constructionPhase === "facade" || constructionPhase === "finishing") {
      const pilasterCount = 4;
      for (let i = 0; i < pilasterCount; i++) {
        const pilMesh = new THREE.Mesh(louverGeo, louverBronzeMat);
        const xOffset = -3.85 + (i * 7.7) / (pilasterCount - 1);
        pilMesh.position.set(xOffset, (coreHeight + 8) / 2, 0);
        pilMesh.castShadow = true;
        pilMesh.receiveShadow = true;
        pilMesh.userData = {
          name: i === pilasterCount - 1 ? "Branded Bronze Louver Column" : "Copper-Anodized Shading Fins",
          material: "400mm deep anodized architectural bronze casings with internal steel columns",
          rating: "Provides passive solar shade structures, reducing peak solar gain in summer by 18%."
        };
        buildingGroup.add(pilMesh);
        addWireframeOverlay(pilMesh, 0x92400e);
      }
    }

    // --- 8B. RIGHT FACADE GRAY LOUVER SLAT ARRAY & NEW LOGO BRANDING ---
    if ((visualizationMode === "architectural" || visualizationMode === "blueprint") && (constructionPhase === "facade" || constructionPhase === "finishing")) {
      const rightSlatGeo = new THREE.BoxGeometry(0.08, 0.08, 8.04);
      geometriesToDispose.push(rightSlatGeo);
      const rightSlatMat = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a, // louver_gray color from the master plan!
        roughness: 0.5,
        metalness: 0.2,
      });
      materialsToDispose.push(rightSlatMat);

      const rightSlatGroup = new THREE.Group();
      rightSlatGroup.position.set(4.04, 8, 0);

      const slatCount = 48;
      for (let s = 0; s < slatCount; s++) {
        const yLoc = (s * coreHeight) / slatCount;
        const slat = new THREE.Mesh(rightSlatGeo, rightSlatMat);
        slat.position.set(0, yLoc, 0);
        slat.castShadow = true;
        rightSlatGroup.add(slat);
      }
      buildingGroup.add(rightSlatGroup);

      // VERTICAL GLOWING LOGO BRANDING (Centered over right-side horizontal louvers)
      const brandGroup = new THREE.Group();
      brandGroup.position.set(4.12, 18.0, 0); // centered over the 26m tower right face

      const characters = ["M", "O", "L", "L", "I", "K", " ", "T", "O", "W", "E", "R"];
      const charSpacing = 0.75;
      const totalHeight = (characters.length - 1) * charSpacing;
      const startY = totalHeight / 2;

      characters.forEach((char, idx) => {
        if (char === " ") return;
        const glyphMesh = new THREE.Mesh(vehicleLampGeo, brandGoldMat);
        glyphMesh.scale.set(1.0, 5.625, 4.375); // 0.08, 0.45, 0.35
        glyphMesh.position.set(0, startY - idx * charSpacing, 0);
        glyphMesh.castShadow = true;
        glyphMesh.userData = {
          name: `Gold Capital Letter '${char}'`,
          material: "Custom 3D molded structural aluminum with 24k gold-leaf anodized plating",
          rating: "Fitted with high-efficiency solid-state 2.4W amber LED matrices for midnight illumination."
        };
        brandGroup.add(glyphMesh);

        const glowPoint = new THREE.PointLight(0xffb74d, 0.35, 2.0);
        glowPoint.position.set(0.06, startY - idx * charSpacing, 0);
        brandGroup.add(glowPoint);
      });
      buildingGroup.add(brandGroup);
    }

    // --- 9. GRAND GLASS LOBBY (Ground Floor) & INTERIOR DETAILS ---
    if (constructionPhase === "facade" || constructionPhase === "finishing") {
      const leftLobbyGlassGeo = new THREE.BoxGeometry(0.1, lobbyHeight, 8.15);
      const rightLobbyGlassGeo = new THREE.BoxGeometry(0.1, lobbyHeight, 8.15);
      const backLobbyGlassGeo = new THREE.BoxGeometry(8.15, lobbyHeight, 0.1);
      const frontLobbyGlassGeo = new THREE.BoxGeometry(8.15, lobbyHeight, 0.1);
      const lobbyColGeo = new THREE.BoxGeometry(0.8, lobbyHeight, 0.9);
      
      geometriesToDispose.push(leftLobbyGlassGeo, rightLobbyGlassGeo, backLobbyGlassGeo, frontLobbyGlassGeo, lobbyColGeo);
      
      const leftLobbyGlass = new THREE.Mesh(leftLobbyGlassGeo, spiderLobbyMat);
      leftLobbyGlass.position.set(-4.075, lobbyHeight / 2, 0);
      leftLobbyGlass.castShadow = true;
      leftLobbyGlass.receiveShadow = true;
      
      const rightLobbyGlass = new THREE.Mesh(rightLobbyGlassGeo, spiderLobbyMat);
      rightLobbyGlass.position.set(4.075, lobbyHeight / 2, 0);
      rightLobbyGlass.castShadow = true;
      rightLobbyGlass.receiveShadow = true;
      
      const backLobbyGlass = new THREE.Mesh(backLobbyGlassGeo, spiderLobbyMat);
      backLobbyGlass.position.set(0, lobbyHeight / 2, -4.075);
      backLobbyGlass.castShadow = true;
      backLobbyGlass.receiveShadow = true;
      
      const frontLobbyGlass = new THREE.Mesh(frontLobbyGlassGeo, spiderLobbyMat);
      frontLobbyGlass.position.set(0, lobbyHeight / 2, 3.275); // Recessed to match tower above!
      frontLobbyGlass.castShadow = true;
      frontLobbyGlass.receiveShadow = true;
      frontLobbyGlass.userData = {
        name: "Lobby Front Glazing Envelope",
        material: "Point spider-supported clear glass structural facade",
        rating: "8.2m clear vertical height layout. Recessed facade protects lobby from direct glare."
      };
      
      const leftLobbyCol = new THREE.Mesh(lobbyColGeo, podiumCrimsonMat);
      leftLobbyCol.position.set(-3.675, lobbyHeight / 2, 3.725);
      leftLobbyCol.castShadow = true;
      leftLobbyCol.receiveShadow = true;
      
      const rightLobbyCol = new THREE.Mesh(lobbyColGeo, podiumCrimsonMat);
      rightLobbyCol.position.set(3.675, lobbyHeight / 2, 3.725);
      rightLobbyCol.castShadow = true;
      rightLobbyCol.receiveShadow = true;
      
      buildingGroup.add(leftLobbyGlass);
      buildingGroup.add(rightLobbyGlass);
      buildingGroup.add(backLobbyGlass);
      buildingGroup.add(frontLobbyGlass);
      buildingGroup.add(leftLobbyCol);
      buildingGroup.add(rightLobbyCol);
      
      addWireframeOverlay(leftLobbyGlass, 0xbae6fd);
      addWireframeOverlay(rightLobbyGlass, 0xbae6fd);
      addWireframeOverlay(backLobbyGlass, 0xbae6fd);
      addWireframeOverlay(frontLobbyGlass, 0xbae6fd);
      addWireframeOverlay(leftLobbyCol, 0xbae6fd);
      addWireframeOverlay(rightLobbyCol, 0xbae6fd);

      // Realistic Lobby Interior details visible through the glass
      if (visualizationMode === "architectural") {
        // 4 Internal structural concrete columns
        const colOffs = [-3.1, 3.1];
        colOffs.forEach((cx) => {
          colOffs.forEach((cz) => {
            const lCol = new THREE.Mesh(lobbyColumnGeo, whiteConcreteMat);
            lCol.position.set(cx, lobbyHeight / 2, cz);
            lCol.castShadow = true;
            lCol.receiveShadow = true;
            buildingGroup.add(lCol);
          });
        });

        // Sleek reception desk
        if (constructionPhase === "finishing") {
          const rDesk = new THREE.Mesh(lobbyDeskGeo, darkSlateMat);
          rDesk.position.set(0, 0.375, 2.0);
          rDesk.castShadow = true;
          buildingGroup.add(rDesk);

          // Glowing marble branding backdrop wall behind desk
          const rDeskBack = new THREE.Mesh(lobbyDeskBackGeo, woodBrandMat);
          rDeskBack.position.set(0, 1.6, 1.3);
          rDeskBack.receiveShadow = true;
          buildingGroup.add(rDeskBack);
          
          const rDeskGlow = new THREE.PointLight(0xf59e0b, 0.8, 4.0);
          rDeskGlow.position.set(0, 1.2, 1.6);
          buildingGroup.add(rDeskGlow);
        }
      }
    }

    // Cantilevered Glass-and-Steel Canopy projecting forward on plaza supported by double-height pillars
    if ((visualizationMode === "architectural" || visualizationMode === "blueprint") && (constructionPhase === "facade" || constructionPhase === "finishing")) {
      const canopyMesh = new THREE.Mesh(canopyGeo, curtainGlassMat); // Glass canopy pane
      canopyMesh.position.set(0, 5.2, 5.8); // projects in front
      canopyMesh.castShadow = true;
      canopyMesh.userData = {
        name: "Lobby Prominent Entrance Canopy",
        material: "Structural steel-framed tempered safety laminated glass panel system supported by double-height pillars",
        rating: "Provides elegant architectural sheltering, with integrated rainwater drainage and micro-LED lighting."
      };
      buildingGroup.add(canopyMesh);
      addWireframeOverlay(canopyMesh, 0x475569); // slate-steel color overlay

      // Steel framing around the canopy edge
      const frameGeo = new THREE.BoxGeometry(9.5, 0.15, 4.3);
      geometriesToDispose.push(frameGeo);
      const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
      materialsToDispose.push(steelMat);
      const canopyFrame = new THREE.Mesh(frameGeo, steelMat);
      canopyFrame.position.set(0, 5.2, 5.8);
      buildingGroup.add(canopyFrame);

      // Double-height columns (pillars) supporting the canopy
      const canopyPillarGeo = new THREE.CylinderGeometry(0.12, 0.12, 5.2, 12);
      geometriesToDispose.push(canopyPillarGeo);
      
      const leftPillar = new THREE.Mesh(canopyPillarGeo, steelMat);
      leftPillar.position.set(-4.4, 2.6, 7.5);
      leftPillar.castShadow = true;
      leftPillar.receiveShadow = true;
      leftPillar.userData = {
        name: "Canopy Support Pillar (Left)",
        material: "Grade S355 structural steel circular hollow section column with protective epoxy coating",
        rating: "Supports structural canopy gravity loads while withstanding ground floor seismic movements."
      };
      buildingGroup.add(leftPillar);

      const rightPillar = new THREE.Mesh(canopyPillarGeo, steelMat);
      rightPillar.position.set(4.4, 2.6, 7.5);
      rightPillar.castShadow = true;
      rightPillar.receiveShadow = true;
      rightPillar.userData = {
        name: "Canopy Support Pillar (Right)",
        material: "Grade S355 structural steel circular hollow section column with protective epoxy coating",
        rating: "Supports structural canopy gravity loads while withstanding ground floor seismic movements."
      };
      buildingGroup.add(rightPillar);

      // Micro LED spotlights under canopy (mounted to the frame)
      for (let k = -3; k <= 3; k += 2) {
        const ledMesh = new THREE.Mesh(vehicleLampGeo, ledSpotMat);
        ledMesh.scale.set(1.875, 0.625, 1.875); // scale box into downlight frame
        ledMesh.position.set(k, -0.07, 1.2);
        canopyFrame.add(ledMesh);

        const downLight = new THREE.PointLight(0xfff3e0, 0.35, 6);
        downLight.position.set(k, -0.15, 1.2);
        canopyFrame.add(downLight);
      }
    }

    // --- 10. COMPACT INTERLOCKING RED RETAIL PODIUM & SKY TERRACE ---
    // The podium is positioned and sized to cleanly lock into the tower, creating a highly integrated structure
    if (constructionPhase !== "foundation") {
      const podiumMat = (constructionPhase === "structure") ? interiorSlabMat : darkSlateMat;
      const podiumMesh = new THREE.Mesh(podiumGeo, podiumMat); // Slate dark concrete core backing or raw concrete
      podiumMesh.position.set(-8.4, podiumHeight / 2, -1.2);
      podiumMesh.castShadow = true;
      podiumMesh.receiveShadow = true;
      podiumMesh.userData = {
        name: "Asymmetrical 4-Story Retail Podium Base",
        material: "Terracotta architectural louver grid mesh over a slate-grey reinforced concrete core",
        rating: "Louver slats reduce peak heat loads on retail glass, providing a detailed passive shade grid structure."
      };
      buildingGroup.add(podiumMesh);
      addWireframeOverlay(podiumMesh, 0x1e293b);

      if ((visualizationMode === "architectural" || visualizationMode === "blueprint") && (constructionPhase === "facade" || constructionPhase === "finishing")) {
        // 10A. PROCEDURAL TERRACOTTA LOUVER GRID OVERLAY (On front, left, and back faces)
      const pW = 10.5;
      const pH = podiumHeight;
      const pD = 11;

      // Vertical framing mullions (using podiumCrimsonMat!)
      const vertMullGeo = new THREE.BoxGeometry(0.12, pH, 0.15);
      geometriesToDispose.push(vertMullGeo);

      // Front face vertical mullions (at z = pD/2 = 5.5)
      for (let m = 0; m <= 6; m++) {
        const xLoc = -pW/2 + (m * pW) / 6;
        const vm = new THREE.Mesh(vertMullGeo, podiumCrimsonMat);
        vm.position.set(xLoc, 0, pD / 2 + 0.05);
        vm.castShadow = true;
        podiumMesh.add(vm);
      }

      // Left face vertical mullions (at x = -pW/2 = -5.25)
      for (let m = 0; m <= 6; m++) {
        const zLoc = -pD/2 + (m * pD) / 6;
        const vm = new THREE.Mesh(vertMullGeo, podiumCrimsonMat);
        vm.position.set(-pW / 2 - 0.05, 0, zLoc);
        vm.rotation.y = Math.PI / 2;
        vm.castShadow = true;
        podiumMesh.add(vm);
      }

      // Back face vertical mullions (at z = -pD/2 = -5.5)
      for (let m = 0; m <= 6; m++) {
        const xLoc = -pW/2 + (m * pW) / 6;
        const vm = new THREE.Mesh(vertMullGeo, podiumCrimsonMat);
        vm.position.set(xLoc, 0, -pD / 2 - 0.05);
        vm.castShadow = true;
        podiumMesh.add(vm);
      }

      // Horizontal louver slats (using podiumCrimsonMat!)
      // Front slats
      const horizSlatGeoF = new THREE.BoxGeometry(pW + 0.1, 0.08, 0.1);
      geometriesToDispose.push(horizSlatGeoF);
      const slatDensity = 16;
      for (let s = 0; s < slatDensity; s++) {
        const yLoc = -pH / 2 + (s * pH) / slatDensity;
        const hs = new THREE.Mesh(horizSlatGeoF, podiumCrimsonMat);
        hs.position.set(0, yLoc, pD / 2 + 0.08);
        hs.castShadow = true;
        podiumMesh.add(hs);
      }

      // Left slats
      const horizSlatGeoL = new THREE.BoxGeometry(pD + 0.1, 0.08, 0.1);
      geometriesToDispose.push(horizSlatGeoL);
      for (let s = 0; s < slatDensity; s++) {
        const yLoc = -pH / 2 + (s * pH) / slatDensity;
        const hs = new THREE.Mesh(horizSlatGeoL, podiumCrimsonMat);
        hs.position.set(-pW / 2 - 0.08, yLoc, 0);
        hs.rotation.y = Math.PI / 2;
        hs.castShadow = true;
        podiumMesh.add(hs);
      }

      // Back slats
      for (let s = 0; s < slatDensity; s++) {
        const yLoc = -pH / 2 + (s * pH) / slatDensity;
        const hs = new THREE.Mesh(horizSlatGeoF, podiumCrimsonMat);
        hs.position.set(0, yLoc, -pD / 2 - 0.08);
        hs.castShadow = true;
        podiumMesh.add(hs);
      }

      // Dynamic glass storefront windows cutout representations
      const storeF = new THREE.Mesh(storefrontGeo, curtainGlassMat);
      storeF.position.set(-1.5, -2, 4.81); // Recessed from 5.51
      storeF.userData = {
        name: "Ground Retail Storefront Glass",
        material: "12mm monolithic safety structural glass panels with clear weatherproofing joints",
        rating: "Designed to resist crowd surge and high atmospheric street vibrations."
      };
      podiumMesh.add(storeF);

      const storeF2 = new THREE.Mesh(storefrontGeo, curtainGlassMat);
      storeF2.position.set(-1.5, 2.5, 4.81); // Recessed from 5.51
      storeF2.userData = {
        name: "Upper Retail Atrium Glass Wall",
        material: "Argon-filled Low-E double glazing unit matching the main tower facade spec",
        rating: "High-level daylight integration for internal walkways."
      };
      podiumMesh.add(storeF2);

      // Backlit geometric louvers/slats
      for (let s = 0; s < 4; s++) {
        const slat = new THREE.Mesh(decorativeSlatGeo, louverBronzeMat);
        slat.position.set(-4.8 + s * 1.5, 0, 4.92); // Realigned to match recessed glass
        podiumMesh.add(slat);
      }

      // Retail Entrance Skylight Atrium Dome
      const atriumMesh = new THREE.Mesh(atriumGeo, curtainGlassMat);
      atriumMesh.position.set(-1.5, podiumHeight / 2 + 0.2, 0);
      atriumMesh.userData = {
        name: "16-Meter Atrium Glass Skylight",
        material: "Tempered laminated security clear glass structural roof frame",
        rating: "Diffuses natural overhead daylight to internal multi-level atrium voids, cutting light bills by 35%."
      };
      podiumMesh.add(atriumMesh);

      // COMPACT SKY TERRACE (On the flat roof of the retail podium!)
      // This fills the setback area adjacent to the tower, making the design look active and premium
      const skyGardenLawn = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.1, 9.0), roofFoliageMat);
      skyGardenLawn.position.set(-7.5, podiumHeight + 0.05, -1.2);
      skyGardenLawn.receiveShadow = true;
      skyGardenLawn.userData = {
        name: "Podium Roof Sky Terrace Patio",
        material: "Lightweight extensive modular green-roof system with seating and local flora",
        rating: "Reduces rainwater runoff and local temperature by 3 degrees. Accessible to retail visitors."
      };
      buildingGroup.add(skyGardenLawn);
      addWireframeOverlay(skyGardenLawn, 0x22c55e);

      // Add elegant protective glass balustrade surrounding the sky terrace edges
      const terraceBalustradeGeo = new THREE.BoxGeometry(7.5, 0.9, 10.0);
      const terraceBalustrade = new THREE.Mesh(terraceBalustradeGeo, terraceBalustradeMat);
      terraceBalustrade.position.set(-8.4, podiumHeight + 0.45, -1.2);
      buildingGroup.add(terraceBalustrade);
      geometriesToDispose.push(terraceBalustradeGeo);

      // Sleek low-poly modern umbrella tables on the terrace
      const seatMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });
      materialsToDispose.push(seatMat);
      const umbrellaMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
      materialsToDispose.push(umbrellaMat);

      const tableOffsets = [
        { x: -6.5, z: -3.5 },
        { x: -8.5, z: 1.5 }
      ];
      tableOffsets.forEach((to) => {
        const tableGroup = new THREE.Group();
        tableGroup.position.set(to.x, podiumHeight + 0.1, to.z);

        // Table base
        const tBase = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.75, 6), seatMat);
        tBase.position.y = 0.375;
        tBase.castShadow = true;
        tableGroup.add(tBase);

        // Umbrella pole
        const uPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 4), lampPostMat);
        uPole.position.y = 1.0;
        tableGroup.add(uPole);

        // Umbrella cone fabric
        const uCone = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.4, 8), umbrellaMat);
        uCone.position.y = 2.0;
        uCone.castShadow = true;
        tableGroup.add(uCone);

        // 3 tiny chairs
        for (let s = 0; s < 3; s++) {
          const sAngle = (s * Math.PI * 2) / 3;
          const chair = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), seatMat);
          chair.position.set(Math.cos(sAngle) * 0.7, 0.175, Math.sin(sAngle) * 0.7);
          chair.castShadow = true;
          tableGroup.add(chair);
        }

        buildingGroup.add(tableGroup);
      });
    }
  }

    // --- 11. ROOF DECK & SKY GARDEN (+34m level) ---
    if (constructionPhase !== "foundation") {
      const roofMat = (constructionPhase === "structure") ? interiorSlabMat : roofFoliageMat;
      const roofMesh = new THREE.Mesh(roofGeo, roofMat);
      roofMesh.position.set(0, 34 + roofHeight / 2, 0);
      roofMesh.castShadow = true;
      roofMesh.receiveShadow = true;
      roofMesh.userData = {
        name: "Landscaped Rooftop Sky Garden",
        material: "Lush green roof layers featuring 150mm engineered lightweight soil substrate and native micro-shrubs",
        rating: "Lowers rooftop solar heat-island index by up to 4.2°C, capturing stormwater runoffs."
      };
      buildingGroup.add(roofMesh);
      addWireframeOverlay(roofMesh, 0x22c55e);

      // Solar panels, chillers and steel balustrades on roof
      if ((visualizationMode === "architectural" || visualizationMode === "blueprint") && (constructionPhase === "facade" || constructionPhase === "finishing")) {
        // Tilted PV Monocrystalline Panels
        const solarPanelGroup = new THREE.Group();
        solarPanelGroup.position.set(1.5, 34 + roofHeight, 0.5);

        const pvMat = new THREE.MeshStandardMaterial({
          color: 0x0f172c,
          metalness: 0.92,
          roughness: 0.08,
        });
        materialsToDispose.push(pvMat);

        for (let s = 0; s < 4; s++) {
          const pvMesh = new THREE.Mesh(pvGeo, pvMat);
          pvMesh.rotation.x = -Math.PI / 6;
          pvMesh.position.set(0, 0.35, -1.8 + s * 1.3);
          pvMesh.castShadow = true;
          pvMesh.userData = {
            name: "45 kWp Monocrystalline PV Solar Array",
            material: "High-efficiency tier-1 monocrystalline cells tilted at optimal 22-degrees",
            rating: "Feeds building common area LED arrays directly. Zero emission renewable energy."
          };
          solarPanelGroup.add(pvMesh);
        }
        buildingGroup.add(solarPanelGroup);

        // Technical HVAC Chillers
        const chiller1 = new THREE.Mesh(chGeo, interiorCoreMat);
        chiller1.position.set(-1.8, 34 + 0.6 + roofHeight, -1.8);
        chiller1.castShadow = true;
        chiller1.userData = {
          name: "Mechanical HVAC VRF Condenser Stack",
          material: "Industrial high-efficiency scroll chillers on anti-vibration mount springs",
          rating: "Eco-friendly R410A refrigerant with full smart-meter variable flow speed controls."
        };
        buildingGroup.add(chiller1);

        const chiller2 = new THREE.Mesh(chGeo, interiorCoreMat);
        chiller2.position.set(-1.8, 34 + 0.6 + roofHeight, 1.8);
        chiller2.castShadow = true;
        chiller2.userData = {
          name: "HVAC cooling towers & recycled loop system",
          material: "Dual condenser units operating on sub-surface recycled greywater cooling tanks",
          rating: "Zero municipal potable water wasted in mechanical conditioning cycles."
        };
        buildingGroup.add(chiller2);

        // Glass protective balustrade
        const fenceMesh = new THREE.Mesh(fenceGeo, terraceBalustradeMat);
        fenceMesh.position.set(0, 34 + roofHeight + 0.48, 0);
        fenceMesh.userData = {
          name: "Structural Glass Balustrades",
          material: "15mm tempered safety glass with stainless steel top trims",
          rating: "Withstands wind forces of up to 150 mph."
        };
        buildingGroup.add(fenceMesh);
      }
    }

    // --- 12. PLAZA LANDSCAPING (Layered Physical-Model Style Trees & Benches) ---
    if (visualizationMode === "architectural" && constructionPhase === "finishing") {
      const plazaTrees = [
        { x: -16, z: 12 },
        { x: -13, z: 16 },
        { x: 14, z: 8 },
        { x: 12, z: 14 },
        { x: 8, z: 18 }
      ];

      plazaTrees.forEach((t) => {
        const planterMesh = new THREE.Mesh(planterGeo, darkSlateMat);
        planterMesh.position.set(t.x, 0.25, t.z);
        planterMesh.castShadow = true;
        planterMesh.userData = {
          name: "Plaza Concrete Planters",
          material: "Precast decorative concrete ring with integrated subsurface drainage grids",
          rating: "Nourishes local flora in natural eco-pavements."
        };
        buildingGroup.add(planterMesh);
        addWireframeOverlay(planterMesh, 0x475569);

        // Trunk
        const trunkMesh = new THREE.Mesh(trunkGeo, louverBronzeMat);
        trunkMesh.position.y = 0.6;
        planterMesh.add(trunkMesh);

        // LAYERED GEOMETRIC ARCHITECTURAL MODEL TREES (3 nested cones creating rich volume)
        const leaveMesh1 = new THREE.Mesh(leaveGeo1, roofFoliageMat);
        leaveMesh1.position.y = 1.3;
        leaveMesh1.castShadow = true;
        planterMesh.add(leaveMesh1);

        const leaveMesh2 = new THREE.Mesh(leaveGeo2, roofFoliageMat);
        leaveMesh2.position.y = 1.8;
        leaveMesh2.rotation.y = Math.PI / 4;
        leaveMesh2.castShadow = true;
        planterMesh.add(leaveMesh2);

        const leaveMesh3 = new THREE.Mesh(leaveGeo3, roofFoliageMat);
        leaveMesh3.position.y = 2.2;
        leaveMesh3.rotation.y = -Math.PI / 8;
        leaveMesh3.castShadow = true;
        planterMesh.add(leaveMesh3);
      });

      // Add high-end low-poly park benches on the plaza
      const benchPositions = [
        { x: -10, z: 12, rot: Math.PI / 4 },
        { x: 6, z: 14, rot: -Math.PI / 6 }
      ];
      benchPositions.forEach((bp) => {
        const bench = new THREE.Group();
        bench.position.set(bp.x, 0.16, bp.z);
        bench.rotation.y = bp.rot;

        const seat = new THREE.Mesh(benchSeatGeo, woodBrandMat);
        seat.position.y = 0.35;
        seat.castShadow = true;
        bench.add(seat);

        const legL = new THREE.Mesh(benchLegGeo, darkSlateMat);
        legL.position.set(-0.75, 0.175, 0);
        legL.castShadow = true;
        bench.add(legL);

        const legR = new THREE.Mesh(benchLegGeo, darkSlateMat);
        legR.position.set(0.75, 0.175, 0);
        legR.castShadow = true;
        bench.add(legR);

        scene.add(bench);
      });

      // Elegant LED Streetlamp posts along pavement boundary
      const lampPositions = [
        { x: -20, z: 15 },
        { x: -3, z: 15 },
        { x: 14, z: 15 }
      ];
      lampPositions.forEach((lp) => {
        const lamp = new THREE.Group();
        lamp.position.set(lp.x, 0.15, lp.z);

        const post = new THREE.Mesh(lampPostGeo, lampPostMat);
        post.position.y = 2.1;
        post.castShadow = true;
        lamp.add(post);

        const arm = new THREE.Mesh(lampArmGeo, lampPostMat);
        arm.position.set(0.3, 4.15, 0);
        lamp.add(arm);

        const head = new THREE.Mesh(lampLightGeo, headlightMat);
        head.position.set(0.65, 4.11, 0);
        lamp.add(head);

        // Night downward spot projection onto pavement
        const pointLight = new THREE.PointLight(0xfff3e0, 1.2, 10);
        pointLight.position.set(0.65, 3.9, 0);
        pointLight.castShadow = true;
        pointLight.shadow.bias = -0.002;
        lamp.add(pointLight);

        scene.add(lamp);
      });
    }

    // --- 13. STREET VEHICLE DYNAMICS (Optimized generation) ---
    const vehiclesGroup = new THREE.Group();
    scene.add(vehiclesGroup);

    const activeVehicles: { mesh: THREE.Group; speed: number; rangeX: number; direction: number }[] = [];

    if ((visualizationMode === "architectural" || visualizationMode === "blueprint") && constructionPhase === "finishing") {
      // Reusable street lane markings (Stripes)
      const stripeCount = 10;
      for (let s = 0; s < stripeCount; s++) {
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(-50 + s * 11, 0.02, 21.5);
        scene.add(stripe);
      }

      // Optimized vehicle spawner (Reuses geometries and materials)
      const spawnVehicle = (isRickshaw: boolean, direction: number, laneZ: number, startX: number) => {
        const vehicle = new THREE.Group();
        vehicle.position.set(startX, 0.05, laneZ);

        if (isRickshaw) {
          const rBody = new THREE.Mesh(rickshawBodyGeo, rickshawBodyMat);
          rBody.position.y = 0.45;
          rBody.castShadow = true;
          vehicle.add(rBody);

          const rHood = new THREE.Mesh(rickshawHoodGeo, rickshawHoodMat);
          rHood.position.set(-0.15, 0.75, 0);
          rHood.castShadow = true;
          vehicle.add(rHood);

          const frontWheel = new THREE.Mesh(rickshawWheelGeo, wheelMat);
          frontWheel.rotation.x = Math.PI / 2;
          frontWheel.position.set(0.28, 0.18, 0);
          frontWheel.castShadow = true;
          vehicle.add(frontWheel);

          const bWheelL = new THREE.Mesh(rickshawWheelGeo, wheelMat);
          bWheelL.rotation.x = Math.PI / 2;
          bWheelL.position.set(-0.2, 0.18, 0.23);
          vehicle.add(bWheelL);

          const bWheelR = new THREE.Mesh(rickshawWheelGeo, wheelMat);
          bWheelR.rotation.x = Math.PI / 2;
          bWheelR.position.set(-0.2, 0.18, -0.23);
          vehicle.add(bWheelR);

        } else {
          const carColor = direction > 0 ? 0xe2e8f0 : 0x94a3b8;
          const carBodyMat = new THREE.MeshStandardMaterial({ color: carColor, roughness: 0.2 });
          materialsToDispose.push(carBodyMat);

          const carBody = new THREE.Mesh(carBodyGeo, carBodyMat);
          carBody.position.y = 0.3;
          carBody.castShadow = true;
          vehicle.add(carBody);

          const cabin = new THREE.Mesh(carCabinGeo, carCabinMat);
          cabin.position.set(-0.1, 0.65, 0);
          cabin.castShadow = true;
          vehicle.add(cabin);

          const wFL = new THREE.Mesh(carWheelGeo, carWheelMat);
          wFL.rotation.x = Math.PI / 2;
          wFL.position.set(0.5, 0.2, 0.4);
          vehicle.add(wFL);

          const wFR = new THREE.Mesh(carWheelGeo, carWheelMat);
          wFR.rotation.x = Math.PI / 2;
          wFR.position.set(0.5, 0.2, -0.4);
          vehicle.add(wFR);

          const wRL = new THREE.Mesh(carWheelGeo, carWheelMat);
          wRL.rotation.x = Math.PI / 2;
          wRL.position.set(-0.5, 0.2, 0.4);
          vehicle.add(wRL);

          const wRR = new THREE.Mesh(carWheelGeo, carWheelMat);
          wRR.rotation.x = Math.PI / 2;
          wRR.position.set(-0.5, 0.2, -0.4);
          vehicle.add(wRR);
        }

        // Dual headlights & Taillights
        const headlightL = new THREE.Mesh(vehicleLampGeo, headlightMat);
        const headlightR = new THREE.Mesh(vehicleLampGeo, headlightMat);
        const tailL = new THREE.Mesh(vehicleLampGeo, taillightMat);
        const tailR = new THREE.Mesh(vehicleLampGeo, taillightMat);

        if (direction > 0) {
          headlightL.position.set(0.9, 0.35, 0.28);
          headlightR.position.set(0.9, 0.35, -0.28);
          tailL.position.set(-0.9, 0.35, 0.28);
          tailR.position.set(-0.9, 0.35, -0.28);
        } else {
          headlightL.position.set(-0.9, 0.35, 0.28);
          headlightR.position.set(-0.9, 0.35, -0.28);
          tailL.position.set(0.9, 0.35, 0.28);
          tailR.position.set(0.9, 0.35, -0.28);
        }

        vehicle.add(headlightL);
        vehicle.add(headlightR);
        vehicle.add(tailL);
        vehicle.add(tailR);

        vehiclesGroup.add(vehicle);
        activeVehicles.push({
          mesh: vehicle,
          speed: isRickshaw ? 0.05 + Math.random() * 0.02 : 0.15 + Math.random() * 0.06,
          rangeX: 60,
          direction: direction,
        });
      };

      spawnVehicle(true, 1, 18.5, -25);
      spawnVehicle(false, 1, 20.0, 10);
      spawnVehicle(true, -1, 23.5, 30);
      spawnVehicle(false, -1, 25.0, -15);
    }

    // --- 13B. DHAKA CITYSCAPE BACKGROUND (Stripped away as requested to focus entirely on Mollik Tower) ---

    // --- 14. PHYSICS WIND FLOW VECTORS & STREAMLINES (For Wireframe Mode) ---
    const windLines: THREE.Line[] = [];
    const windData: { startX: number; targetX: number; speed: number; y: number; z: number; lineGeo: THREE.BufferGeometry }[] = [];
    
    if (visualizationMode === "wireframe" || visualizationMode === "blueprint" || windTunnelActive) {
      const windFlowGroup = new THREE.Group();
      scene.add(windFlowGroup);

      const windCount = 28;

      for (let w = 0; w < windCount; w++) {
        // Sample points across vertical tower heights 8m to 34m
        const yVal = 8.5 + Math.random() * 25;
        // Target lateral grid columns
        const targetX = -12 + Math.random() * 24;
        const zStart = -20;
        const speed = 0.22 + Math.random() * 0.12;

        // Draw streamline path vectors
        const lineGeo = new THREE.BufferGeometry();
        // Segment consisting of 12 vertices to draw a clean curved arrow path
        const positions = new Float32Array(12 * 3);
        lineGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const windLineMat = new THREE.LineBasicMaterial({
          color: windTunnelActive ? 0x10b981 : (visualizationMode === "wireframe" ? 0x06b6d4 : 0x0ea5e9), // emerald green when wind tunnel toggle is active
          transparent: true,
          opacity: 0.85,
          linewidth: 2.0,
        });
        materialsToDispose.push(windLineMat);

        const line = new THREE.Line(lineGeo, windLineMat);
        windFlowGroup.add(line);
        windLines.push(line);

        windData.push({
          startX: targetX,
          targetX: targetX,
          speed: speed,
          y: yVal,
          z: zStart,
          lineGeo: lineGeo,
        });
      }
    }

    setLoading(false);

    // 13. MOUSE EVENTS AND INTERACTION (Raycasting for Hover Tooltips and Clicks)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(buildingGroup.children, true);

      if (intersects.length > 0) {
        // Find first parent with meaningful userData
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData.name) {
          obj = obj.parent;
        }

        if (obj && obj.userData.name) {
          // Adjust coordinates to render perfectly next to cursor
          onHover({
            name: obj.userData.name,
            material: obj.userData.material,
            rating: obj.userData.rating,
            x: event.clientX,
            y: event.clientY,
          });
          return;
        }
      }
      onHover(null);
    };

    const handleMouseClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(buildingGroup.children, true);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        const hitY = point.y;
        
        let floorNum = 1;
        let floorName = "Ground Floor Lobby";

        if (hitY < 8) {
          floorNum = 1;
          floorName = "Ground Floor Lobby";
        } else if (hitY >= 34) {
          floorNum = 18;
          floorName = "Rooftop Sky Garden";
        } else if (hitY >= 8 && hitY < 11.2 && point.x < -3) {
          // Inside podium block
          floorNum = Math.min(4, Math.max(2, Math.floor(2 + (hitY - 8) / 1.6)));
          floorName = `Podium Retail - Level ${floorNum}`;
        } else {
          // Tower commercial zones
          const relativeY = hitY - 8;
          const floorIdx = Math.floor((relativeY / 26) * 13) + 5;
          floorNum = Math.min(17, Math.max(5, floorIdx));
          floorName = `Commercial Suite - Floor ${floorNum}`;
        }

        onFloorSelect(floorNum, floorName);
      }
    };

    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("click", handleMouseClick);

    // 14. RUNTIME ANIMATION LOOP
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Gentle scale-up entry transition on construction phase change
      if (buildingGroupRef.current) {
        const duration = 1.0; // 1 second smooth animation
        if (elapsed < duration) {
          const t = elapsed / duration;
          const easeCubic = 1 - Math.pow(1 - t, 3); // cubic ease-out
          const currentScale = 0.6 + 0.4 * easeCubic;
          buildingGroupRef.current.scale.set(currentScale, currentScale, currentScale);
        } else {
          buildingGroupRef.current.scale.set(1, 1, 1);
        }
      }

      // Gentle auto-rotation
      if (buildingGroupRef.current && autoRotate) {
        buildingGroupRef.current.rotation.y += 0.0018;
      }

      // Drive vehicles
      activeVehicles.forEach((v) => {
        v.mesh.position.x += v.speed * v.direction;
        if (v.direction === 1 && v.mesh.position.x > v.rangeX) {
          v.mesh.position.x = -v.rangeX;
        } else if (v.direction === -1 && v.mesh.position.x < -v.rangeX) {
          v.mesh.position.x = v.rangeX;
        }
      });

      // PHYSICS SIMULATION: Potential Wind Flow streamlines wrapping around building
      if (visualizationMode === "wireframe" || visualizationMode === "blueprint" || windTunnelActive) {
        const cylRad = 4.2;

        windData.forEach((w, idx) => {
          // Update Z stream flow position
          w.z += w.speed;
          if (w.z > 20) {
            w.z = -20;
          }

          // Render a trail of points backwards to make beautiful flowing lines
          const positionAttr = w.lineGeo.getAttribute("position") as THREE.BufferAttribute;
          const trailLength = 12;

          for (let p = 0; p < trailLength; p++) {
            // Draw previous coordinates of the stream vector
            const tempZ = w.z - p * 0.45;
            
            // Potential flow around cylinder formula
            // x = x0 * (1 + R^2 / (x0^2 + z^2))
            const r2 = cylRad * cylRad;
            const distSq = w.startX * w.startX + tempZ * tempZ;
            let tempX = w.startX;
            
            if (distSq < r2 + 0.5) {
              // streamline splits nicely around the core obstruction
              const scale = 1.0 + r2 / (distSq + 0.1);
              tempX = w.startX * scale;
            }

            positionAttr.setXYZ(p, tempX, w.y, tempZ);
          }
          positionAttr.needsUpdate = true;
        });
      }

      controls.update();

      if (vrModeActive) {
        const width = containerRef.current?.clientWidth || window.innerWidth;
        const height = containerRef.current?.clientHeight || 550;

        // Slow camera glide tour when in VR to make the user feel like they are moving
        if (autoRotate) {
          // Slow dynamic camera oscillation to simulate a walking tour
          const time = elapsed * 0.4;
          camera.position.x += Math.sin(time) * 0.008;
          camera.position.z += Math.cos(time) * 0.008;
        }

        const originalPos = camera.position.clone();
        const eyeSep = 0.45; // Stereo eye separation

        renderer.setScissorTest(true);

        // LEFT EYE VIEWPORT
        renderer.setViewport(0, 0, width / 2, height);
        renderer.setScissor(0, 0, width / 2, height);
        camera.position.copy(originalPos).addScaledVector(new THREE.Vector3(-1, 0, 0).applyQuaternion(camera.quaternion), eyeSep / 2);
        camera.updateMatrixWorld();
        renderer.render(scene, camera);

        // RIGHT EYE VIEWPORT
        renderer.setViewport(width / 2, 0, width / 2, height);
        renderer.setScissor(width / 2, 0, width / 2, height);
        camera.position.copy(originalPos).addScaledVector(new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion), eyeSep / 2);
        camera.updateMatrixWorld();
        renderer.render(scene, camera);

        // RESET STATE FOR CONTROLS
        camera.position.copy(originalPos);
        camera.updateMatrixWorld();
        renderer.setScissorTest(false);
        renderer.setViewport(0, 0, width, height);
      } else {
        renderer.render(scene, camera);
      }
    };
    animate();

    // 15. DYNAMIC CONTAINER RESIZE HANDLER
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const w = entry.contentRect.width;
      const h = entry.contentRect.height || 550;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(containerRef.current);

    // 15.5 SCREEN-SPACE SNAPSHOT CAPTURE HANDLER
    const handleCaptureSnapshot = () => {
      renderer.render(scene, camera);
      const dataUrl = renderer.domElement.toDataURL("image/jpeg", 0.95);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
      link.download = `Mollik_Tower_Snapshot_${timestamp}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    window.addEventListener("capture-3d-snapshot", handleCaptureSnapshot);

    // 16. CLEANUP ON UNMOUNT
    return () => {
      window.removeEventListener("capture-3d-snapshot", handleCaptureSnapshot);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener("mousemove", handleMouseMove);
        renderer.domElement.removeEventListener("click", handleMouseClick);
      }
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();

      geometriesToDispose.forEach((geo) => geo.dispose());
      materialsToDispose.forEach((mat) => mat.dispose());
      scene.clear();
    };
  }, [visualizationMode, thermalOverlayActive, glassPreset, claddingPreset, vrModeActive, constructionPhase, shadowAnalysisActive, windTunnelActive, seasonMode]);

  // Handle Sun Position & Lighting adjustments
  useEffect(() => {
    if (!directionalLightRef.current) return;

    const rad = (sunAngle * Math.PI) / 180;
    const radius = 30;
    const x = Math.cos(rad) * radius;
    const z = Math.sin(rad) * radius;
    const y = Math.sin(rad) * 16 + 8;

    directionalLightRef.current.position.set(x, y, z);

    // Calculate projected shadow footprint for Shadow Analysis Mode
    if (shadowAnalysisMeshRef.current) {
      const mesh = shadowAnalysisMeshRef.current;
      mesh.visible = !!shadowAnalysisActive && y > 0.5;

      if (mesh.visible) {
        const H_tower = constructionPhase === "foundation" ? 1.8 : 34;
        const H_podium = (constructionPhase === "foundation") ? 0 : 11.2;

        // Base points of the tower
        const basePoints = [
          new THREE.Vector3(-4, 0, -4),
          new THREE.Vector3(4, 0, -4),
          new THREE.Vector3(4, 0, 4),
          new THREE.Vector3(-4, 0, 4),
        ];

        // Top points of the tower
        const topPoints = [
          new THREE.Vector3(-4, H_tower, -4),
          new THREE.Vector3(4, H_tower, -4),
          new THREE.Vector3(4, H_tower, 4),
          new THREE.Vector3(-4, H_tower, 4),
        ];

        // Also if podium exists, we can add podium points!
        if (H_podium > 0) {
          // Podium boundaries: centered at x = -8.4, z = -1.2, dimensions: 10.5 wide (X), 11 deep (Z)
          const pxMin = -8.4 - 10.5/2;
          const pxMax = -8.4 + 10.5/2;
          const pzMin = -1.2 - 11/2;
          const pzMax = -1.2 + 11/2;

          basePoints.push(new THREE.Vector3(pxMin, 0, pzMin));
          basePoints.push(new THREE.Vector3(pxMax, 0, pzMin));
          basePoints.push(new THREE.Vector3(pxMax, 0, pzMax));
          basePoints.push(new THREE.Vector3(pxMin, 0, pzMax));

          topPoints.push(new THREE.Vector3(pxMin, H_podium, pzMin));
          topPoints.push(new THREE.Vector3(pxMax, H_podium, pzMin));
          topPoints.push(new THREE.Vector3(pxMax, H_podium, pzMax));
          topPoints.push(new THREE.Vector3(pxMin, H_podium, pzMax));
        }

        // Project all points onto ground plane y = 0.035
        const sunDir = new THREE.Vector3(x, y, z).normalize();
        const sy = sunDir.y > 0.01 ? sunDir.y : 0.01;
        const ratioX = sunDir.x / sy;
        const ratioZ = sunDir.z / sy;

        const projectedPoints: THREE.Vector3[] = [];
        const allPoints = [...basePoints, ...topPoints];

        allPoints.forEach(p => {
          const px = p.x - p.y * ratioX;
          const pz = p.z - p.y * ratioZ;
          projectedPoints.push(new THREE.Vector3(px, 0.035, pz));
        });

        // Compute convex hull of 2D projected points to draw a clean shadow outline!
        projectedPoints.sort((a, b) => a.x !== b.x ? a.x - b.x : a.z - b.z);
        
        const lower: THREE.Vector3[] = [];
        for (let i = 0; i < projectedPoints.length; i++) {
          while (lower.length >= 2) {
            const p1 = lower[lower.length - 2];
            const p2 = lower[lower.length - 1];
            const p3 = projectedPoints[i];
            const cross = (p2.x - p1.x) * (p3.z - p1.z) - (p2.z - p1.z) * (p3.x - p1.x);
            if (cross <= 0) lower.pop();
            else break;
          }
          lower.push(projectedPoints[i]);
        }

        const upper: THREE.Vector3[] = [];
        for (let i = projectedPoints.length - 1; i >= 0; i--) {
          while (upper.length >= 2) {
            const p1 = upper[upper.length - 2];
            const p2 = upper[upper.length - 1];
            const p3 = projectedPoints[i];
            const cross = (p2.x - p1.x) * (p3.z - p1.z) - (p2.z - p1.z) * (p3.x - p1.x);
            if (cross <= 0) upper.pop();
            else break;
          }
          upper.push(projectedPoints[i]);
        }

        upper.pop();
        lower.pop();
        const hull = lower.concat(upper);

        // Create triangles from the hull (fan triangulation around first point)
        const vertices: number[] = [];
        for (let i = 1; i < hull.length - 1; i++) {
          vertices.push(hull[0].x, hull[0].y, hull[0].z);
          vertices.push(hull[i].x, hull[i].y, hull[i].z);
          vertices.push(hull[i+1].x, hull[i+1].y, hull[i+1].z);
        }

        mesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        mesh.geometry.computeVertexNormals();
        mesh.geometry.attributes.position.needsUpdate = true;
      }
    }

    // Dynamic scene background and fog transitions
    if (sceneRef.current) {
      if (visualizationMode === "blueprint") {
        sceneRef.current.background = new THREE.Color("#0f172a");
        if (sceneRef.current.fog instanceof THREE.FogExp2) {
          sceneRef.current.fog.color.setHex(0x0f172a);
        }
      } else if (visualizationMode === "wireframe") {
        sceneRef.current.background = new THREE.Color("#090d16");
        if (sceneRef.current.fog instanceof THREE.FogExp2) {
          sceneRef.current.fog.color.setHex(0x090d16);
        }
      } else {
        const sinVal = Math.sin(rad);
        if (sinVal < 0.12) {
          // Night background
          sceneRef.current.background = new THREE.Color("#0a0f1d");
          if (sceneRef.current.fog instanceof THREE.FogExp2) {
            sceneRef.current.fog.color.setHex(0x0a0f1d);
          }
        } else if (sinVal < 0.45) {
          // Sunrise/Sunset Golden Hour
          sceneRef.current.background = new THREE.Color("#f8fafc");
          if (sceneRef.current.fog instanceof THREE.FogExp2) {
            sceneRef.current.fog.color.setHex(0xf8fafc);
          }
        } else {
          // Crisp Daylight
          sceneRef.current.background = new THREE.Color("#f1f5f9");
          if (sceneRef.current.fog instanceof THREE.FogExp2) {
            sceneRef.current.fog.color.setHex(0xf1f5f9);
          }
        }
      }
    }

    // Dynamic Thermodynamic Facade Heat Gain Calculations
    if (thermalOverlayActive && thermalMaterialGroupsRef.current.length > 0) {
      const faceNormals = [
        new THREE.Vector3(1, 0, 0),   // Right (+X)
        new THREE.Vector3(-1, 0, 0),  // Left (-X)
        new THREE.Vector3(0, 1, 0),   // Top (+Y)
        new THREE.Vector3(0, -1, 0),  // Bottom (-Y)
        new THREE.Vector3(0, 0, 1),   // Front (+Z)
        new THREE.Vector3(0, 0, -1)   // Back (-Z)
      ];

      const sunDir = new THREE.Vector3(x, y, z).normalize();
      const sinVal = Math.max(0.1, Math.sin(rad)); // Peak altitude intensity multiplier

      thermalMaterialGroupsRef.current.forEach((group) => {
        group.mats.forEach((mat, faceIdx) => {
          const normal = faceNormals[faceIdx];
          const dot = normal.dot(sunDir);

          // Calculate heat exposure (shaded sides get a minimum ambient heat baseline)
          const exposure = Math.max(0, dot);
          const heatGain = 0.15 + 0.85 * exposure * sinVal;

          const color = new THREE.Color();
          if (heatGain < 0.35) {
            // Low Heat: Deep Blue to Cyan
            const t = (heatGain - 0.15) / 0.20;
            color.lerpColors(new THREE.Color(0x0a2540), new THREE.Color(0x06b6d4), Math.max(0, Math.min(1, t)));
          } else if (heatGain < 0.68) {
            // Medium Heat: Cyan to Warm Amber-Yellow
            const t = (heatGain - 0.35) / 0.33;
            color.lerpColors(new THREE.Color(0x06b6d4), new THREE.Color(0xeab308), Math.max(0, Math.min(1, t)));
          } else {
            // High Heat: Amber-Yellow to Radiant Red
            const t = (heatGain - 0.68) / 0.32;
            color.lerpColors(new THREE.Color(0xeab308), new THREE.Color(0xef4444), Math.max(0, Math.min(1, t)));
          }

          mat.color.copy(color);
          mat.emissive.copy(color);
          mat.emissiveIntensity = 0.52 * heatGain; // Emit stronger light for hot faces
        });
      });
    }

    if (visualizationMode === "architectural" && !thermalOverlayActive) {
      const sinVal = Math.sin(rad); // Altitude ratio
      if (sinVal < 0.12) {
        // Night / Moonlight
        directionalLightRef.current.color.setHex(0x94a3b8); // Moonlight silver-slate
        directionalLightRef.current.intensity = 0.22;
        if (ambientLightRef.current) {
          ambientLightRef.current.color.setHex(0x0a0f1d); // Deep slate midnight
          ambientLightRef.current.intensity = 0.35;
        }
        if (spotLightRef.current) {
          spotLightRef.current.intensity = 4.5;
        }
      } else if (sinVal < 0.45) {
        // Sunrise/Sunset - Golden hour
        directionalLightRef.current.color.setHex(0xfdba74); // Warm desaturated golden amber
        directionalLightRef.current.intensity = 1.8;
        if (ambientLightRef.current) {
          ambientLightRef.current.color.setHex(0x1e293b); // Muted sky ambient
          ambientLightRef.current.intensity = 0.5;
        }
        if (spotLightRef.current) {
          spotLightRef.current.intensity = 1.5;
        }
      } else {
        // Full Daylight
        directionalLightRef.current.color.setHex(0xfffbeb); // Ivory warm sunlight
        directionalLightRef.current.intensity = 1.85;
        if (ambientLightRef.current) {
          ambientLightRef.current.color.setHex(0xf1f5f9); // Crisp neutral desaturated sky ambient
          ambientLightRef.current.intensity = 0.6;
        }
        if (spotLightRef.current) {
          spotLightRef.current.intensity = 0.1;
        }
      }
    }
  }, [sunAngle, visualizationMode, thermalOverlayActive, constructionPhase, shadowAnalysisActive]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[520px] bg-[#f1f5f9] overflow-hidden rounded-2xl border border-slate-200 shadow-md">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/95 z-20 space-y-3 rounded-2xl">
          <div className="w-10 h-10 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-cyan-700 font-mono text-xs tracking-widest uppercase">Rendering CAD Subsystem...</span>
        </div>
      )}

      {/* Actual canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* Ambient help guide */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-md px-2.5 py-1 pointer-events-none text-[9px] font-mono text-slate-600 shadow-sm">
        Left-click+drag to orbit | Right-click to pan | Scroll to zoom
      </div>
    </div>
  );
}

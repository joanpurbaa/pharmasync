"use client";

import * as React from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import { Package, X } from "lucide-react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

// ─── Types ───────────────────────────────────────────────────────────────────

type RackId = "leftRack" | "middleRack" | "rightRack";
type SlotId = string;

interface ItemData {
  id: string;
  rackId: RackId;
  slotId: SlotId;
  itemName: string;
  stock: number;
  category: string;
  description: string;
}

interface RackCameraPreset {
  camera: [number, number, number];
  target: [number, number, number];
}

interface RackMetadata {
  rows: number;
  columns: number;
  levels: number;
  origin: [number, number, number];
  spacing: [number, number, number];
}

// ─── Rack slot metadata and slot generator ────────────────────────────────

const RACK_METADATA: Record<RackId, RackMetadata> = {
  leftRack: {
    rows: 4,
    columns: 5,
    levels: 3,
    origin: [15, 30, 75],
    spacing: [10, 4, 10],
  },
  middleRack: {
    rows: 4,
    columns: 5,
    levels: 3,
    origin: [60, 30, 100],
    spacing: [10, 4, 10],
  },
  rightRack: {
    rows: 4,
    columns: 5,
    levels: 3,
    origin: [105, 30, 110],
    spacing: [10, 4, 10],
  },
};

function getSlotPosition(rackId: RackId, slotId: SlotId): [number, number, number] {
  const metadata = RACK_METADATA[rackId];
  const [rowText, columnText, levelText] = slotId.split("-");
  const row = Number.parseInt(rowText ?? "0", 10);
  const column = Number.parseInt(columnText ?? "0", 10);
  const level = Number.parseInt(levelText ?? "0", 10);

  if (
    Number.isNaN(row) ||
    Number.isNaN(column) ||
    Number.isNaN(level) ||
    row < 0 ||
    row >= metadata.rows ||
    column < 0 ||
    column >= metadata.columns ||
    level < 0 ||
    level >= metadata.levels
  ) {
    return metadata.origin;
  }

  return [
    metadata.origin[0] + column * metadata.spacing[0],
    metadata.origin[1] + level * metadata.spacing[1],
    metadata.origin[2] + row * metadata.spacing[2],
  ];
}

function getItemColor(item: ItemData) {
  if (item.category.toLowerCase().includes("tablet")) return "#ef4444";
  if (item.category.toLowerCase().includes("antibi")) return "#38bdf8";
  return "#22c55e";
}

// ─── Initial item definitions (slot-based, database-friendly) ───────────

const INITIAL_ITEMS: ItemData[] = [
  {
    id: "paracetamol",
    rackId: "leftRack",
    slotId: "0-0-0",
    itemName: "Paracetamol",
    stock: 18,
    category: "Tablet",
    description:
      "Stok kritis di bawah ambang batas minimum. Butuh restock segera.",
  },
  {
    id: "amoxicillin",
    rackId: "middleRack",
    slotId: "1-1-0",
    itemName: "Amoxicillin",
    stock: 56,
    category: "Antibiotik",
    description: "Stok dalam batas aman untuk operasional bulanan.",
  },
  {
    id: "sirup",
    rackId: "rightRack",
    slotId: "0-2-1",
    itemName: "Sirup Paracetamol",
    stock: 34,
    category: "Cair",
    description: "Penyimpanan suhu ruangan optimal. Stok stabil.",
  },
];

// ─── Camera presets for each rack ───────────────────────────────────────────

const RACK_CAMERA_PRESETS: Record<RackId, RackCameraPreset> = {
  leftRack: {
    camera: [25, 45, 130],
    target: [15, 30, 75],
  },
  middleRack: {
    camera: [70, 55, 155],
    target: [60, 35, 100],
  },
  rightRack: {
    camera: [115, 50, 140],
    target: [105, 35, 110],
  },
};

const OVERVIEW_CAMERA: [number, number, number] = [90, 110, 180];
const OVERVIEW_TARGET: [number, number, number] = [40, 45, 75];

// ─── Animation constants ────────────────────────────────────────────────────

const LERP_FACTOR = 0.06;
const ANIMATION_THRESHOLD = 0.1;
const MAX_ANIMATION_FRAMES = 240;

// ─── Names of the dummy boxes inside the GLB to be hidden ───────────────────

const DUMMY_BOX_NAMES = ["Material2_10", "Material2_11", "Material2_12"];

// ─── Camera controller (unchanged) ──────────────────────────────────────────

function CameraController({
  selectedId,
  controlsRef,
  items,
}: {
  selectedId: string | null;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
  items: ItemData[];
}) {
  const isAnimating = React.useRef(false);
  const frameCount = React.useRef(0);
  const targetCameraPos = React.useRef(new THREE.Vector3());
  const targetLookAt = React.useRef(new THREE.Vector3());

  // Stop animation on any user interaction with OrbitControls
  React.useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const stop = () => {
      isAnimating.current = false;
      frameCount.current = 0;
    };
    controls.addEventListener("start", stop);
    return () => controls.removeEventListener("start", stop);
  }, [controlsRef]);

  // Restart animation when selectedId changes
  React.useEffect(() => {
    isAnimating.current = true;
    frameCount.current = 0;
  }, [selectedId]);

  useFrame(({ camera }) => {
    const controls = controlsRef.current;
    if (!controls || !isAnimating.current) return;

    frameCount.current++;
    if (frameCount.current > MAX_ANIMATION_FRAMES) {
      isAnimating.current = false;
      frameCount.current = 0;
      return;
    }

    if (selectedId) {
      const item = items.find((i) => i.id === selectedId);
      if (item) {
        const preset = RACK_CAMERA_PRESETS[item.rackId];
        targetCameraPos.current.set(...preset.camera);
        targetLookAt.current.set(...preset.target);
      }
    } else {
      targetCameraPos.current.set(...OVERVIEW_CAMERA);
      targetLookAt.current.set(...OVERVIEW_TARGET);
    }

    camera.position.lerp(targetCameraPos.current, LERP_FACTOR);
    controls.target.lerp(targetLookAt.current, LERP_FACTOR);
    controls.update();

    const posDist = camera.position.distanceTo(targetCameraPos.current);
    const tgtDist = controls.target.distanceTo(targetLookAt.current);
    if (posDist < ANIMATION_THRESHOLD && tgtDist < ANIMATION_THRESHOLD) {
      isAnimating.current = false;
      frameCount.current = 0;
    }
  });

  return null;
}

// ─── Warehouse 3D scene ─────────────────────────────────────────────────────

function WarehouseScene({
  selectedId,
  setSelectedId,
  items,
}: {
  selectedId: string | null;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  items: ItemData[];
}) {
  const controlsRef = React.useRef<OrbitControlsImpl>(null);
  const { scene } = useGLTF("/models/warehousecompres.glb") as { scene: THREE.Group };
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  // ── 1. Hide the dummy placeholder boxes – once, when the scene is loaded ──
  React.useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && DUMMY_BOX_NAMES.includes(child.name)) {
        child.visible = false;
      }
    });
  }, [scene]);

  // ── 2. Generate materials for each item (reactive to selection) ──────────
  const materials = React.useMemo(() => {
    const map: Record<string, THREE.MeshStandardMaterial> = {};
    items.forEach((item) => {
      const color = getItemColor(item);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.1,
        roughness: 0.3,
      });
      map[item.id] = mat;
    });
    return map;
  }, [items]);

  // Update emissive intensity when selection changes
  React.useEffect(() => {
    items.forEach((item) => {
      const mat = materials[item.id];
      if (mat) {
        mat.emissiveIntensity = selectedId === item.id ? 0.65 : 0.1;
      }
    });
  }, [selectedId, items, materials]);

  // ── 3. Interaction handlers ─────────────────────────────────────────────
  const handleItemClick = React.useCallback(
    (e: ThreeEvent<PointerEvent>, id: string) => {
      e.stopPropagation();
      setSelectedId((prev) => (prev === id ? null : id));
    },
    [setSelectedId],
  );

  const handlePointerOver = React.useCallback(
    (e: ThreeEvent<PointerEvent>, id: string) => {
      e.stopPropagation();
      setHoveredId(id);
    },
    [],
  );

  const handlePointerOut = React.useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHoveredId(null);
    },
    [],
  );

  // Update canvas cursor
  React.useEffect(() => {
    const el = document.querySelector<HTMLDivElement>(".warehouse-canvas");
    if (el) el.style.cursor = hoveredId ? "pointer" : "grab";
  }, [hoveredId]);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[50, 90, 90]} intensity={1.3} castShadow />

      {/* Warehouse environment (dummy boxes are invisible) */}
      <primitive object={scene} />

      {/* React‑generated item meshes – positioned from rack metadata + slot ids */}
      <group>
        {items.map((item) => (
          <mesh
            key={item.id}
            position={getSlotPosition(item.rackId, item.slotId)}
            material={materials[item.id]}
            onPointerDown={(e) => handleItemClick(e, item.id)}
            onPointerOver={(e) => handlePointerOver(e, item.id)}
            onPointerOut={handlePointerOut}
          >
            <boxGeometry args={[1.4, 1.4, 1.4]} />
          </mesh>
        ))}
      </group>

      {/* Camera animation controller */}
      <CameraController
        selectedId={selectedId}
        controlsRef={controlsRef}
        items={items}
      />

      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        maxDistance={280}
        minDistance={15}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
    </>
  );
}

// ─── Top-level component ────────────────────────────────────────────────────

export function WarehouseView() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [items] = React.useState<ItemData[]>(INITIAL_ITEMS); // will later be replaced by API fetch

  const selectedItem = selectedId
    ? items.find((i) => i.id === selectedId) ?? null
    : null;

  const handleClosePanel = React.useCallback(() => {
    setSelectedId(null);
  }, []);

  return (
    <div className="warehouse-canvas relative h-[calc(100vh-4rem)] w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-md">
      {/* 3D viewport */}
      <Canvas camera={{ position: OVERVIEW_CAMERA, fov: 35 }}>
        <React.Suspense
          fallback={
            <Html center>
              <div className="text-sm font-medium text-slate-400">
                Memuat Aset 3D...
              </div>
            </Html>
          }
        >
          <WarehouseScene
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            items={items}
          />
        </React.Suspense>
      </Canvas>

      {/* Fixed overlay panel (right side) */}
      {selectedItem && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40 pointer-events-auto w-[320px] rounded-2xl border border-slate-700 bg-slate-950/90 backdrop-blur-lg p-6 shadow-2xl text-slate-50 animate-in slide-in-from-right-4">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-400" />
              {selectedItem.itemName}
            </h3>
            <button
              onClick={handleClosePanel}
              className="rounded-full p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Kategori
              </div>
              <div className="text-sm font-medium">{selectedItem.category}</div>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Stok Tersedia
              </div>
              <div
                className={`text-xl font-bold ${
                  selectedItem.stock < 20 ? "text-red-500" : "text-slate-200"
                }`}
              >
                {selectedItem.stock} Box
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Deskripsi
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedItem.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Left top informational badge */}
      <div className="absolute left-6 top-6 max-w-[280px] rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-md p-5 shadow-lg text-slate-50 pointer-events-none select-none">
        <h2 className="text-sm font-semibold tracking-tight text-white mb-1">
          Live Warehouse 3D
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Klik item di rak untuk melihat detail stok.
          Warna merah menandakan stok kritis.
        </p>
      </div>
    </div>
  );
}
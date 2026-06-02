/**
 * WardrobeModel.tsx  —  Premium photorealistic wardrobe for React Three Fiber
 *
 * Door styles:
 *  cairo        — 3-panel routed (ToMeasure signature style)
 *  shaker       — single recessed panel with raised border frame
 *  slab         — completely flat / ultra modern
 *  contemporary — thin horizontal routing grooves
 *  panel-eclipse — split wood-veneer capsule inset (legacy)
 *  estoril      — gold-framed glass showcase
 *  santana      — black-framed dark-glass showcase
 *
 * Material rules:  ALL materials are inline JSX <mesh*Material />.
 * Never use <primitive object={mat} attach="material"> — that causes R3F
 * reconciler to detach the material from all but the last mesh rendered.
 */

import React, { useMemo, useRef } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ColorOption, InternalStorageType, DoorStyle, StoragePosition } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface WardrobeModelProps {
  modelType: number;
  handleType?: 'none' | 'straight' | 'fancy' | 'spherical';
  isActive?: boolean;
  height: number;
  color?: ColorOption;
  handleColor?: ColorOption;
  handlePosition?: 'left' | 'right';
  cabinetOption?: 'none' | 'cabinet-layout' | 'with-storage';
  internalStorage?: InternalStorageType;
  wallPosition: 'leftWall' | 'rightWall' | 'backWall';
  internalStorageColor?: ColorOption;
  storagePosition?: StoragePosition;
  doorStyle?: DoorStyle;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pub = (p: string) =>
  (process.env.PUBLIC_URL || '') + (p.startsWith('/') ? p : '/' + p);

const wallRot = (wp?: string): [number, number, number] => {
  if (wp === 'leftWall')  return [0,  Math.PI / 2, 0];
  if (wp === 'rightWall') return [0, -Math.PI / 2, 0];
  return [0, 0, 0];
};

// ─── Physical constants (metres) ──────────────────────────────────────────────
const W  = 1.00;   // outer width
const H  = 2.40;   // outer height
const D  = 0.60;   // outer depth
const P  = 0.022;  // panel thickness (22 mm)
const IW = W - P * 2;
const IH = H - P * 2;
const ID = D - P;
const DOOR_Z = D / 2 + P * 0.55;  // door face Z

// ─── Palette ──────────────────────────────────────────────────────────────────
const OAK    = '#c49a6c';
const GOLD   = '#c9a84c';
const CHROME = '#d0d0d0';
const BLACK  = '#121212';

// ─────────────────────────────────────────────────────────────────────────────
// Primitive sub-components — all use inline JSX material elements
// ─────────────────────────────────────────────────────────────────────────────
const Shelf: React.FC<{
  y: number; w?: number; d?: number; color?: string; woodMap?: THREE.Texture | null;
}> = ({ y, w = IW, d = ID - P * 2, color = OAK, woodMap }) => (
  <mesh position={[0, y, 0]} receiveShadow castShadow>
    <boxGeometry args={[w, P, d]} />
    <meshStandardMaterial color={color} roughness={0.72} metalness={0.04} map={woodMap ?? undefined} />
  </mesh>
);

const HangingRail: React.FC<{ y: number; w?: number }> = ({ y, w = IW * 0.92 }) => (
  <group>
    <mesh position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.009, 0.009, w, 20]} />
      <meshStandardMaterial color={CHROME} metalness={0.95} roughness={0.06} />
    </mesh>
    {([-1, 1] as const).map(side => (
      <mesh key={side} position={[side * w * 0.48, y, 0.018]} castShadow>
        <boxGeometry args={[0.012, 0.055, 0.035]} />
        <meshStandardMaterial color={CHROME} metalness={0.95} roughness={0.06} />
      </mesh>
    ))}
  </group>
);

const DrawerRow: React.FC<{
  y: number; w?: number; woodMap?: THREE.Texture | null; goldColor?: string;
}> = ({ y, w = IW * 0.94, woodMap, goldColor = GOLD }) => (
  <group>
    <mesh position={[0, y, -P * 0.5]} receiveShadow castShadow>
      <boxGeometry args={[w, 0.17, ID * 0.80]} />
      <meshStandardMaterial color={OAK} roughness={0.75} metalness={0.04} map={woodMap ?? undefined} />
    </mesh>
    <mesh position={[0, y, ID * 0.40 + 0.003]} castShadow>
      <boxGeometry args={[w - 0.006, 0.16, P * 1.4]} />
      <meshStandardMaterial color={OAK} roughness={0.65} metalness={0.04} map={woodMap ?? undefined} />
    </mesh>
    <mesh position={[0, y, ID * 0.40 + 0.022]} castShadow>
      <cylinderGeometry args={[0.017, 0.017, 0.008, 24]} />
      <meshStandardMaterial color={goldColor} metalness={0.92} roughness={0.10} />
    </mesh>
  </group>
);

const LEDStrip: React.FC<{ y: number; w?: number }> = ({ y, w = IW * 0.88 }) => (
  <mesh position={[0, y, -P * 2]}>
    <boxGeometry args={[w, 0.007, 0.007]} />
    <meshStandardMaterial color="#ffcc66" emissive="#ffaa22" emissiveIntensity={3.0} roughness={1} metalness={0} />
  </mesh>
);

const FrameRect: React.FC<{
  w: number; h: number; fw: number; fd: number; color: string;
  metalness?: number; roughness?: number;
}> = ({ w, h, fw, fd, color, metalness = 0.88, roughness = 0.14 }) => (
  <group>
    <mesh position={[0,  h/2 - fw/2, 0]} castShadow><boxGeometry args={[w, fw, fd]} /><meshStandardMaterial color={color} metalness={metalness} roughness={roughness} /></mesh>
    <mesh position={[0, -h/2 + fw/2, 0]} castShadow><boxGeometry args={[w, fw, fd]} /><meshStandardMaterial color={color} metalness={metalness} roughness={roughness} /></mesh>
    <mesh position={[-w/2 + fw/2, 0, 0]} castShadow><boxGeometry args={[fw,  h, fd]} /><meshStandardMaterial color={color} metalness={metalness} roughness={roughness} /></mesh>
    <mesh position={[ w/2 - fw/2, 0, 0]} castShadow><boxGeometry args={[fw,  h, fd]} /><meshStandardMaterial color={color} metalness={metalness} roughness={roughness} /></mesh>
  </group>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
const WardrobeModel: React.FC<WardrobeModelProps> = ({
  modelType,
  handleType    = 'straight',
  isActive      = false,
  height,
  color,
  handleColor,
  handlePosition = 'right',
  cabinetOption  = 'none',
  internalStorage = 'full-hanging',
  wallPosition,
  internalStorageColor,
  doorStyle = 'cairo',
}) => {
  // ── Textures ──────────────────────────────────────────────────────────────
  const woodMap  = useLoader(TextureLoader, pub('/textures/wood.jpg'));
  const metalMap = useLoader(TextureLoader, pub('/textures/metal.jpg'));
  const colorMap = useLoader(TextureLoader, pub(color?.texture ?? '/textures/wood.jpg'));

  useMemo(() => {
    [woodMap, colorMap].forEach(t => { if (!t) return; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1.4, 2.8); });
  }, [woodMap, colorMap]);
  useMemo(() => { if (metalMap) { metalMap.wrapS = metalMap.wrapT = THREE.RepeatWrapping; metalMap.repeat.set(2, 2); } }, [metalMap]);

  // ── Colour params ─────────────────────────────────────────────────────────
  const bodyColor   = color?.color  ?? '#374b40';   // Heritage Green default
  const hColor      = handleColor?.color ?? CHROME;
  const isMetallic  = !!color?.isMetallic;
  const hIsMetallic = !!handleColor?.isMetallic;
  const intColor    = internalStorageColor?.color ?? '#f8f8f8';
  const bodyRough   = isMetallic ? 0.20 : 0.68;
  const bodyMetal   = isMetallic ? 0.80 : 0.06;
  const useColorMap = !!color?.texture && !!colorMap;

  // ── Selection pulse ───────────────────────────────────────────────────────
  const wireRef = useRef<THREE.MeshBasicMaterial>(null!);
  useFrame(({ clock }) => {
    if (wireRef.current && isActive) wireRef.current.opacity = 0.35 + 0.22 * Math.sin(clock.elapsedTime * 3);
  });

  // ── Interior visibility ───────────────────────────────────────────────────
  const showInterior = cabinetOption === 'cabinet-layout' || doorStyle === 'estoril' || doorStyle === 'santana';

  // ─────────────────────────────────────────────────────────────────────────
  // Shared body material — inlined per mesh to avoid R3F reconciler detach bug
  // ─────────────────────────────────────────────────────────────────────────
  const BM = () => (
    <meshStandardMaterial
      color={bodyColor}
      roughness={bodyRough}
      metalness={bodyMetal}
      map={useColorMap ? colorMap : undefined}
      bumpMap={!useColorMap && woodMap ? woodMap : undefined}
      bumpScale={0.0010}
      side={THREE.FrontSide}
    />
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Carcass — shared structural box for every model variant
  // ─────────────────────────────────────────────────────────────────────────
  const Carcass: React.FC<{ w?: number }> = ({ w = W }) => (
    <group>
      <mesh position={[0, P/2, 0]} receiveShadow castShadow><boxGeometry args={[w, P, D]} /><BM /></mesh>
      <mesh position={[0, H - P/2, 0]} receiveShadow castShadow><boxGeometry args={[w, P, D]} /><BM /></mesh>
      <mesh position={[0, H/2, -D/2 + P/2]} receiveShadow><boxGeometry args={[w, H, P]} /><BM /></mesh>
      <mesh position={[-w/2 + P/2, H/2, 0]} receiveShadow castShadow><boxGeometry args={[P, H, D]} /><BM /></mesh>
      <mesh position={[ w/2 - P/2, H/2, 0]} receiveShadow castShadow><boxGeometry args={[P, H, D]} /><BM /></mesh>
      {/* plinth */}
      <mesh position={[0, P * 1.8, D/2 - P * 0.2]} receiveShadow castShadow><boxGeometry args={[w + 0.002, P * 3.5, P * 1.8]} /><BM /></mesh>
      {/* crown moulding */}
      <mesh position={[0, H + P * 0.9, 0]} castShadow><boxGeometry args={[w + P * 0.5, P * 1.8, D + P * 0.3]} /><BM /></mesh>
    </group>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // DOOR PANELS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * CAIRO — ToMeasure signature: 3-panel routed door
   * Two raised vertical stiles + top/bottom rail + horizontal mid-rail
   * Creates an upper panel (shorter) and lower panel (taller), both recessed
   */
  const CairoDoor: React.FC<{ pos: [number,number,number]; w: number; h: number }> = ({ pos, w, h }) => {
    const stileW   = 0.068;  // vertical stile width
    const railH    = 0.058;  // top/bottom/mid rail height
    const raisedZ  = P * 0.45; // stile/rail protrusion above door face
    const recessZ  = P * 0.15; // panel recess depth below door face
    const midY     = h * 0.38 - h/2; // mid-rail centre (60% from bottom = 40% from top)

    // Inner panel dimensions
    const panelW = w - stileW * 2;

    // Upper panel height: from mid-rail top to top rail bottom
    const upperH = (h/2 - railH/2) - (midY + railH/2) - 0.004;
    const upperY = midY + railH/2 + upperH/2 + 0.002;

    // Lower panel height: from bottom rail top to mid-rail bottom
    const lowerH = (midY - railH/2) - (-h/2 + railH/2) - 0.004;
    const lowerY = -h/2 + railH/2 + lowerH/2 + 0.002;

    return (
      <group position={pos}>
        {/* Door backing slab */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h, P]} /><BM />
        </mesh>

        {/* Raised left stile */}
        <mesh position={[-w/2 + stileW/2, 0, P/2 + raisedZ/2]} castShadow>
          <boxGeometry args={[stileW, h, raisedZ]} /><BM />
        </mesh>
        {/* Raised right stile */}
        <mesh position={[ w/2 - stileW/2, 0, P/2 + raisedZ/2]} castShadow>
          <boxGeometry args={[stileW, h, raisedZ]} /><BM />
        </mesh>
        {/* Raised top rail */}
        <mesh position={[0,  h/2 - railH/2, P/2 + raisedZ/2]} castShadow>
          <boxGeometry args={[w, railH, raisedZ]} /><BM />
        </mesh>
        {/* Raised bottom rail */}
        <mesh position={[0, -h/2 + railH/2, P/2 + raisedZ/2]} castShadow>
          <boxGeometry args={[w, railH, raisedZ]} /><BM />
        </mesh>
        {/* Raised mid horizontal rail */}
        <mesh position={[0, midY, P/2 + raisedZ/2]} castShadow>
          <boxGeometry args={[w, railH, raisedZ]} /><BM />
        </mesh>

        {/* Upper recessed panel */}
        <mesh position={[0, upperY, P/2 - recessZ/2]} receiveShadow>
          <boxGeometry args={[panelW - 0.004, upperH, recessZ]} />
          <meshStandardMaterial color={bodyColor} roughness={bodyRough + 0.05} metalness={bodyMetal} />
        </mesh>

        {/* Lower recessed panel */}
        <mesh position={[0, lowerY, P/2 - recessZ/2]} receiveShadow>
          <boxGeometry args={[panelW - 0.004, lowerH, recessZ]} />
          <meshStandardMaterial color={bodyColor} roughness={bodyRough + 0.05} metalness={bodyMetal} />
        </mesh>

        {/* Routing shadow lines — thin dark inset strips for depth */}
        {[
          [-w/2 + stileW, 0, P/2 + 0.001] as [number,number,number],   // left stile inner edge
          [ w/2 - stileW, 0, P/2 + 0.001] as [number,number,number],   // right stile inner edge
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]}>
            <boxGeometry args={[0.003, h - railH * 2, 0.002]} />
            <meshStandardMaterial color="#00000022" transparent opacity={0.4} />
          </mesh>
        ))}
      </group>
    );
  };

  /**
   * SHAKER — single recessed rectangular inset panel
   */
  const ShakerDoor: React.FC<{ pos: [number,number,number]; w: number; h: number }> = ({ pos, w, h }) => {
    const bw = 0.062;
    const bz = P * 0.52;
    const SEGS = 18;
    const archR = Math.min(w * 0.30, 0.12);

    return (
      <group position={pos}>
        <mesh castShadow receiveShadow><boxGeometry args={[w, h, P]} /><BM /></mesh>
        {/* raised border left */}
        <mesh position={[-w/2 + bw/2, 0, P/2 + bz/2]} castShadow><boxGeometry args={[bw, h, bz]} /><BM /></mesh>
        {/* raised border right */}
        <mesh position={[ w/2 - bw/2, 0, P/2 + bz/2]} castShadow><boxGeometry args={[bw, h, bz]} /><BM /></mesh>
        {/* raised border top */}
        <mesh position={[0,  h/2 - bw/2, P/2 + bz/2]} castShadow><boxGeometry args={[w, bw, bz]} /><BM /></mesh>
        {/* raised border bottom */}
        <mesh position={[0, -h/2 + bw/2, P/2 + bz/2]} castShadow><boxGeometry args={[w, bw, bz]} /><BM /></mesh>
        {/* arch verticals */}
        <mesh position={[-archR + 0.008, -h * 0.08, P/2 + bz * 0.8]} castShadow>
          <boxGeometry args={[0.013, h * 0.52, 0.005]} /><BM />
        </mesh>
        <mesh position={[ archR - 0.008, -h * 0.08, P/2 + bz * 0.8]} castShadow>
          <boxGeometry args={[0.013, h * 0.52, 0.005]} /><BM />
        </mesh>
        {/* arch bottom */}
        <mesh position={[0, -h/2 + bw + h * 0.06, P/2 + bz * 0.8]} castShadow>
          <boxGeometry args={[archR * 2 - 0.018, 0.012, 0.005]} /><BM />
        </mesh>
        {/* semicircle arc */}
        {Array.from({ length: SEGS }, (_, i) => {
          const a0 = (Math.PI * i) / SEGS, a1 = (Math.PI * (i + 1)) / SEGS, a = (a0 + a1) / 2;
          return (
            <mesh key={i} position={[Math.cos(a) * (archR - 0.008), h/2 - bw - archR * 0.72 + Math.sin(a) * (archR - 0.008) * 0.72, P/2 + bz * 0.8]} rotation={[0, 0, -(a - Math.PI/2)]}>
              <boxGeometry args={[0.013, (Math.PI * archR) / SEGS + 0.003, 0.005]} />
              <meshStandardMaterial color={bodyColor} roughness={bodyRough} metalness={bodyMetal} />
            </mesh>
          );
        })}
      </group>
    );
  };

  /**
   * SLAB — completely flat, ultra-modern
   */
  const SlabDoor: React.FC<{ pos: [number,number,number]; w: number; h: number }> = ({ pos, w, h }) => (
    <group position={pos}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, P * 1.3]} /><BM />
      </mesh>
      {/* 1mm shadow gap reveal on all 4 edges */}
      {[
        { p: [-w/2 + 0.001, 0, 0] as [number,number,number], s: [0.002, h, P * 1.32] as [number,number,number] },
        { p: [ w/2 - 0.001, 0, 0] as [number,number,number], s: [0.002, h, P * 1.32] as [number,number,number] },
      ].map(({ p, s }, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={s} />
          <meshStandardMaterial color="#00000015" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );

  /**
   * CONTEMPORARY — thin horizontal routing grooves across the full door
   */
  const ContemporaryDoor: React.FC<{ pos: [number,number,number]; w: number; h: number }> = ({ pos, w, h }) => {
    const grooveCount = 8;
    const grooveH = 0.006;
    const grooveDepth = 0.005;
    return (
      <group position={pos}>
        <mesh castShadow receiveShadow><boxGeometry args={[w, h, P]} /><BM /></mesh>
        {Array.from({ length: grooveCount }, (_, i) => {
          const y = -h/2 + h * (i + 1) / (grooveCount + 1);
          return (
            <mesh key={i} position={[0, y, P/2 - grooveDepth/2]}>
              <boxGeometry args={[w - 0.01, grooveH, grooveDepth]} />
              <meshStandardMaterial color="#00000030" transparent opacity={0.35} />
            </mesh>
          );
        })}
      </group>
    );
  };

  /**
   * PANEL-ECLIPSE — split oak capsule inset (legacy)
   */
  const EclipseDoor: React.FC<{ pos: [number,number,number]; w: number; h: number; isRight?: boolean }> = ({ pos, w, h, isRight }) => {
    const cW = w * 0.44, cH = h * 0.62, capR = cW * 0.5, SEGS = 12;
    return (
      <group position={pos}>
        <mesh castShadow receiveShadow><boxGeometry args={[w, h, P]} /><BM /></mesh>
        <mesh position={[0, 0, P/2 + 0.005]} castShadow>
          <boxGeometry args={[cW, cH, 0.009]} />
          <meshStandardMaterial color={OAK} roughness={0.68} metalness={0.04} map={woodMap ?? undefined} />
        </mesh>
        {Array.from({ length: SEGS }, (_, i) => {
          const a = (Math.PI * (i + 0.5)) / SEGS;
          return (
            <mesh key={`tc-${i}`} position={[Math.cos(a) * capR * 0.95, cH/2 + Math.sin(a) * capR * 0.52, P/2 + 0.005]} rotation={[0, 0, -(a - Math.PI/2)]}>
              <boxGeometry args={[0.018, (Math.PI * capR) / SEGS + 0.004, 0.009]} />
              <meshStandardMaterial color={OAK} roughness={0.68} metalness={0.04} map={woodMap ?? undefined} />
            </mesh>
          );
        })}
        {Array.from({ length: SEGS }, (_, i) => {
          const a = (Math.PI * (i + SEGS + 0.5)) / SEGS;
          return (
            <mesh key={`bc-${i}`} position={[Math.cos(a) * capR * 0.95, -cH/2 - Math.sin(a) * capR * 0.52, P/2 + 0.005]} rotation={[0, 0, -(a - Math.PI/2)]}>
              <boxGeometry args={[0.018, (Math.PI * capR) / SEGS + 0.004, 0.009]} />
              <meshStandardMaterial color={OAK} roughness={0.68} metalness={0.04} map={woodMap ?? undefined} />
            </mesh>
          );
        })}
        <mesh position={[isRight ? -0.05 : 0.05, 0, P/2 + 0.024]} rotation={[Math.PI/2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.048, 0.048, 0.011, 32]} />
          <meshStandardMaterial color={hColor} metalness={0.93} roughness={0.09} />
        </mesh>
      </group>
    );
  };

  /**
   * ESTORIL — gold-framed glass showcase
   */
  const EstorilDoor: React.FC<{ pos: [number,number,number]; w: number; h: number }> = ({ pos, w, h }) => (
    <group position={pos}>
      <FrameRect w={w} h={h} fw={0.028} fd={0.036} color={hColor} metalness={0.92} roughness={0.10} />
      <mesh position={[0, 0, -0.007]}>
        <boxGeometry args={[w - 0.056, h - 0.056, 0.005]} />
        <meshPhysicalMaterial color="#ddeeff" transparent opacity={0.14} roughness={0} metalness={0} transmission={0.92} reflectivity={0.88} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.032]} castShadow>
        <boxGeometry args={[0.011, 0.20, 0.011]} />
        <meshStandardMaterial color={hColor} metalness={0.93} roughness={0.09} />
      </mesh>
    </group>
  );

  /**
   * SANTANA — black-framed dark-glass
   */
  const SantanaDoor: React.FC<{ pos: [number,number,number]; w: number; h: number }> = ({ pos, w, h }) => (
    <group position={pos}>
      <FrameRect w={w} h={h} fw={0.020} fd={0.030} color={BLACK} metalness={0.72} roughness={0.22} />
      <mesh position={[0, 0, -0.006]}>
        <boxGeometry args={[w - 0.040, h - 0.040, 0.005]} />
        <meshPhysicalMaterial color="#182030" transparent opacity={0.32} roughness={0.02} metalness={0.06} reflectivity={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.025]} castShadow>
        <boxGeometry args={[0.11, 0.013, 0.013]} />
        <meshStandardMaterial color={BLACK} metalness={0.70} roughness={0.20} />
      </mesh>
    </group>
  );

  // ── Door dispatcher ────────────────────────────────────────────────────────
  const Door: React.FC<{ pos: [number,number,number]; w: number; h: number; isRight?: boolean }> = ({ pos, w, h, isRight }) => {
    switch (doorStyle) {
      case 'cairo':         return <CairoDoor        pos={pos} w={w} h={h} />;
      case 'shaker':
      case 'panel-shaker':  return <ShakerDoor       pos={pos} w={w} h={h} />;
      case 'slab':          return <SlabDoor         pos={pos} w={w} h={h} />;
      case 'contemporary':  return <ContemporaryDoor pos={pos} w={w} h={h} />;
      case 'panel-eclipse': return <EclipseDoor      pos={pos} w={w} h={h} isRight={isRight} />;
      case 'estoril':       return <EstorilDoor      pos={pos} w={w} h={h} />;
      case 'santana':       return <SantanaDoor      pos={pos} w={w} h={h} />;
      default:              return <CairoDoor        pos={pos} w={w} h={h} />;
    }
  };

  // ── Block handle (ToMeasure default) ─────────────────────────────────────
  const BlockHandle: React.FC<{ pos: [number,number,number] }> = ({ pos }) => {
    const hMet = hIsMetallic ? 0.90 : 0.35;
    const hRuf = hIsMetallic ? 0.08 : 0.55;
    return (
      <group position={pos}>
        {/* Main bar */}
        <mesh castShadow>
          <boxGeometry args={[0.130, 0.016, 0.016]} />
          <meshStandardMaterial color={hColor} metalness={hMet} roughness={hRuf} map={metalMap ?? undefined} />
        </mesh>
        {/* Left mount */}
        <mesh position={[-0.058, 0, -0.018]} castShadow>
          <boxGeometry args={[0.014, 0.014, 0.040]} />
          <meshStandardMaterial color={hColor} metalness={hMet} roughness={hRuf} />
        </mesh>
        {/* Right mount */}
        <mesh position={[0.058, 0, -0.018]} castShadow>
          <boxGeometry args={[0.014, 0.014, 0.040]} />
          <meshStandardMaterial color={hColor} metalness={hMet} roughness={hRuf} />
        </mesh>
      </group>
    );
  };

  // ── Legacy handles (kept for backward compat) ─────────────────────────────
  const Handle: React.FC<{ pos: [number,number,number] }> = ({ pos }) => {
    if (handleType === 'none') return null;
    const hMet = hIsMetallic ? 0.90 : 0.12;
    const hRuf = hIsMetallic ? 0.10 : 0.60;
    if (handleType === 'spherical') return (
      <group position={pos}>
        <mesh castShadow><sphereGeometry args={[0.036, 28, 28]} /><meshStandardMaterial color={hColor} metalness={hMet} roughness={hRuf} /></mesh>
        <mesh position={[0, 0, -0.022]} rotation={[Math.PI/2, 0, 0]} castShadow><cylinderGeometry args={[0.026, 0.026, 0.010, 28]} /><meshStandardMaterial color={hColor} metalness={hMet} roughness={hRuf} /></mesh>
      </group>
    );
    if (handleType === 'fancy') return (
      <group position={pos}>
        <mesh rotation={[Math.PI/2, 0, 0]} castShadow><cylinderGeometry args={[0.009, 0.009, 0.22, 20]} /><meshStandardMaterial color={hColor} metalness={hMet} roughness={hRuf} /></mesh>
        {([0.11, -0.11] as const).map(y => <mesh key={y} position={[0, y, 0]} castShadow><sphereGeometry args={[0.016, 18, 18]} /><meshStandardMaterial color={hColor} metalness={hMet} roughness={hRuf} /></mesh>)}
      </group>
    );
    return (
      <group position={pos}>
        <mesh castShadow><boxGeometry args={[0.011, 0.22, 0.011]} /><meshStandardMaterial color={hColor} metalness={hMet} roughness={hRuf} map={metalMap ?? undefined} /></mesh>
        {([0.107, -0.107] as const).map(y => <mesh key={y} position={[0, y, -0.012]} castShadow><boxGeometry args={[0.018, 0.018, 0.026]} /><meshStandardMaterial color={hColor} metalness={hMet} roughness={hRuf} /></mesh>)}
      </group>
    );
  };

  // ── Interior ──────────────────────────────────────────────────────────────
  const renderInterior = (xOff: number = 0, panelW: number = IW) => {
    if (!showInterior) return null;
    const Sh = (y: number) => <Shelf key={`sh${y}`} y={y} w={panelW * 0.96} woodMap={woodMap} color={intColor} />;
    const Rail = (y: number) => <HangingRail key={`rl${y}`} y={y} w={panelW * 0.88} />;
    const Dr = (y: number) => <DrawerRow key={`dr${y}`} y={y} w={panelW * 0.92} woodMap={woodMap} goldColor={hColor} />;
    const backPanel = (
      <mesh key="bp" position={[xOff, IH/2 + P, -D/2 + P * 0.6]} receiveShadow>
        <boxGeometry args={[panelW, IH + P, P]} />
        <meshStandardMaterial color={intColor} roughness={0.74} metalness={0.04} />
      </mesh>
    );
    let items: React.ReactNode[] = [backPanel];
    switch (internalStorage) {
      case 'full-hanging':
      case 'long-hanging':
        items.push(Rail(IH - 0.32 + P), Sh(P));
        break;
      case 'double-hanging-rail':
        items.push(Sh(IH/2 + P), Rail(IH - 0.30 + P), Rail(IH/2 + 0.28), Sh(P));
        break;
      case 'hanging-rail-double-shelf':
        items.push(Rail(IH - 0.30 + P), Sh(IH * 0.52 + P), Sh(IH * 0.28 + P), Sh(P));
        break;
      case 'drawers-hanging':
      case 'rail-shelf-1-drawer':
        items.push(Rail(IH - 0.30 + P), Sh(IH * 0.48 + P), Dr(P + 0.025));
        break;
      case 'six-shelves':
        for (let i = 0; i < 6; i++) items.push(Sh(P + (IH / 6) * i));
        break;
      case 'drawers-shelves':
      case 'rail-shelf-2-drawer':
        items.push(Rail(IH - 0.30 + P), Sh(IH * 0.48 + P),
          (doorStyle === 'estoril' || doorStyle === 'santana') && <LEDStrip key="led" y={IH * 0.49 + P + 0.04} />,
          Dr(P + 0.21), Dr(P + 0.025));
        break;
      case 'rail-shelf-3-drawer':
        items.push(Rail(IH - 0.30 + P), Sh(IH * 0.48 + P),
          Dr(P + 0.40), Dr(P + 0.21), Dr(P + 0.025));
        break;
      default:
        items.push(Rail(IH - 0.35 + P), Sh(P));
    }
    return <group position={[xOff, 0, 0]}>{items}</group>;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Model variants
  // ─────────────────────────────────────────────────────────────────────────
  const renderModel = () => {
    const dz = DOOR_Z;
    const dH = IH + P * 0.4;   // door height (slightly proud of carcass)

    switch (modelType) {
      case 1: // Single door
        return (
          <group>
            <Carcass />
            {renderInterior(0, IW)}
            <Door pos={[0, H/2, dz]} w={IW + P * 0.4} h={dH} />
            {handleType !== 'none'
              ? <Handle pos={[handlePosition === 'right' ? W/2 - 0.07 : -W/2 + 0.07, H/2, dz + 0.024]} />
              : <BlockHandle pos={[handlePosition === 'right' ? 0.28 : -0.28, H/2, dz + 0.024]} />}
          </group>
        );

      case 2: // Open shelf block
        return (
          <group>
            <Carcass />
            <mesh position={[0, IH/2 + P, -D/2 + P * 0.8]} receiveShadow>
              <boxGeometry args={[IW, IH, P]} />
              <meshStandardMaterial color={intColor} roughness={0.74} metalness={0.04} />
            </mesh>
            {[0.28, 0.52, 0.72, 0.88].map((f, i) => (
              <mesh key={i} position={[0, f * H, 0]} receiveShadow castShadow>
                <boxGeometry args={[IW, P, ID]} />
                <meshStandardMaterial color={intColor} roughness={0.72} metalness={0.04} />
              </mesh>
            ))}
          </group>
        );

      case 3: // Double door (default)
      default: {
        const halfW = (W - P * 3) / 2;
        return (
          <group>
            <Carcass />
            {/* Centre divider */}
            <mesh position={[0, H/2, 0]} receiveShadow castShadow>
              <boxGeometry args={[P, H - P, D - P]} /><BM />
            </mesh>
            {renderInterior(-W/4, W/2 - P * 1.5)}
            {renderInterior( W/4, W/2 - P * 1.5)}
            <Door pos={[-W/4, H/2, dz]} w={halfW} h={dH} />
            <Door pos={[ W/4, H/2, dz]} w={halfW} h={dH} isRight />
            {/* Block handles — horizontal, mounted centrally on each door */}
            <BlockHandle pos={[-0.052, H * 0.50, dz + 0.022]} />
            <BlockHandle pos={[ 0.052, H * 0.50, dz + 0.022]} />
          </group>
        );
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Root
  // ─────────────────────────────────────────────────────────────────────────
  const rotation = wallRot(wallPosition);
  const scale    = height / H;

  return (
    <group rotation={rotation} scale={[1, scale, 1]}>
      {/* Contact shadow plane */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[W + 0.1, D + 0.1]} />
        <shadowMaterial opacity={0.22} />
      </mesh>
      {renderModel()}
      {/* Selection wireframe */}
      {isActive && (
        <mesh position={[0, H/2, 0]}>
          <boxGeometry args={[W + 0.015, H + 0.015, D + 0.015]} />
          <meshBasicMaterial ref={wireRef} color="#4299e1" wireframe transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};

export default WardrobeModel;

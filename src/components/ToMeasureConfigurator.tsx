/**
 * ToMeasureConfigurator.tsx
 *
 * Full replica of the ToMeasure.co.uk wardrobe configurator.
 * Layout: dark green header | left 65% live 3D canvas | right 35% 4-step sidebar
 *
 * Steps:
 *  1. Door Style  — Cairo / Shaker / Slab / Contemporary
 *  2. Colours     — 6 exterior swatches + 3 interior swatches (circles)
 *  3. Interior    — 6 layout diagrams
 *  4. Size        — width / height / depth in mm with sliders
 */

import React, { useState, useMemo, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import WardrobeModel from './WardrobeModel';
import SaveDesignModal from './SaveDesignModal';
import { LAYOUT_OPTIONS } from './InteriorLayoutDiagrams';
import { ColorOption, DoorStyle, InternalStorageType, TMConfig } from '../types';
import './ToMeasureConfigurator.css';

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────
const EXTERIOR_COLORS: ColorOption[] = [
  { id: 'heritageGreen',  name: 'Heritage Green',  color: '#374b40' },
  { id: 'dustyPink',      name: 'Dusty Pink',       color: '#c9a5a5' },
  { id: 'navy',           name: 'Navy',             color: '#1a2744' },
  { id: 'pureWhite',      name: 'Pure White',       color: '#f8f8f8' },
  { id: 'clay',           name: 'Clay',             color: '#b8a090' },
  { id: 'mushroom',       name: 'Mushroom',         color: '#c8b8a8' },
  { id: 'anthracite',     name: 'Anthracite',       color: '#3a3a3a' },
  { id: 'sage',           name: 'Sage',             color: '#7a9e7e' },
  { id: 'cashmere',       name: 'Cashmere',         color: '#ddd0c0' },
];

const INTERIOR_COLORS: ColorOption[] = [
  { id: 'premiumWhite',  name: 'Premium White',  color: '#f8f8f8' },
  { id: 'cashmere',      name: 'Cashmere',        color: '#e8d8c8' },
  { id: 'lightGrey',     name: 'Light Grey',      color: '#d8d8d8' },
];

interface DoorStyleOption {
  id: DoorStyle;
  label: string;
  description: string;
}

const DOOR_STYLES: DoorStyleOption[] = [
  { id: 'cairo',        label: 'Cairo',         description: '3-panel routed' },
  { id: 'shaker',       label: 'Shaker',        description: 'Classic recessed' },
  { id: 'slab',         label: 'Slab',          description: 'Ultra modern flat' },
  { id: 'contemporary', label: 'Contemporary',  description: 'Horizontal grooves' },
];

// Base price formula: (widthMm / 1000) * (heightMm / 1000) * rate
const BASE_RATE = 680;  // £/m²

const calcPrice = (cfg: TMConfig): number => {
  const area = (cfg.widthMm / 1000) * (cfg.heightMm / 1000);
  let price = Math.round(area * BASE_RATE);
  if (cfg.doorStyle === 'cairo') price += 80;
  if (cfg.doorStyle === 'shaker') price += 40;
  const layoutExtra = LAYOUT_OPTIONS.find(o => o.key === cfg.internalLayout)?.price ?? 0;
  price += layoutExtra;
  return price;
};

// ─────────────────────────────────────────────────────────────────────────────
// Door SVG thumbnail previews  (miniature line art of each door style)
// ─────────────────────────────────────────────────────────────────────────────
const DoorPreviewSVG: React.FC<{ style: DoorStyle; color: string }> = ({ style, color }) => {
  const s = { stroke: color, strokeWidth: 1.5, fill: 'none', strokeLinecap: 'round' as const };
  switch (style) {
    case 'cairo':
      return (
        <svg viewBox="0 0 60 80" className="tm-door-svg">
          <rect x="3" y="3" width="54" height="74" rx="1" {...s} />
          {/* left stile */} <line x1="10" y1="3" x2="10" y2="77" {...s} />
          {/* right stile */} <line x1="50" y1="3" x2="50" y2="77" {...s} />
          {/* top rail */} <line x1="3" y1="10" x2="57" y2="10" {...s} />
          {/* bottom rail */} <line x1="3" y1="70" x2="57" y2="70" {...s} />
          {/* mid rail (40% from top) */} <line x1="3" y1="34" x2="57" y2="34" {...s} />
        </svg>
      );
    case 'shaker':
    case 'panel-shaker':
      return (
        <svg viewBox="0 0 60 80" className="tm-door-svg">
          <rect x="3" y="3" width="54" height="74" rx="1" {...s} />
          <rect x="10" y="10" width="40" height="60" rx="1" {...s} />
        </svg>
      );
    case 'slab':
      return (
        <svg viewBox="0 0 60 80" className="tm-door-svg">
          <rect x="3" y="3" width="54" height="74" rx="1" {...s} fill={color} fillOpacity={0.06} />
        </svg>
      );
    case 'contemporary':
      return (
        <svg viewBox="0 0 60 80" className="tm-door-svg">
          <rect x="3" y="3" width="54" height="74" rx="1" {...s} />
          {[18, 28, 38, 48, 58].map(y => <line key={y} x1="8" y1={y} x2="52" y2={y} {...s} strokeWidth={1} />)}
        </svg>
      );
    default:
      return <svg viewBox="0 0 60 80" className="tm-door-svg"><rect x="3" y="3" width="54" height="74" rx="1" {...s} /></svg>;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Slider helper — computes CSS custom property for gradient fill
// ─────────────────────────────────────────────────────────────────────────────
const SizeSlider: React.FC<{
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step = 10, onChange }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="tm-size-row">
      <div className="tm-size-row-header">
        <span className="tm-size-name">{label}</span>
        <div className="tm-size-value">
          <input
            type="number"
            className="tm-size-input"
            value={value}
            min={min} max={max} step={step}
            onChange={e => {
              const v = Math.max(min, Math.min(max, Number(e.target.value)));
              onChange(v);
            }}
          />
          <span className="tm-size-unit">mm</span>
        </div>
      </div>
      <input
        type="range"
        className="tm-slider"
        style={{ '--pct': `${pct}%` } as React.CSSProperties}
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
      <div className="tm-size-range"><span>{min}mm</span><span>{max}mm</span></div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3D Scene — wardrobe in a clean white showroom environment
// ─────────────────────────────────────────────────────────────────────────────
const WardrobeScene: React.FC<{ cfg: TMConfig }> = ({ cfg }) => {
  const wardrobeColor: ColorOption = cfg.exteriorColor;
  const interiorColor: ColorOption = cfg.interiorColor;

  return (
    <>
      {/* Bright near-white studio background — matches ToMeasure exactly */}
      <color attach="background" args={['#f2f0ed']} />

      {/* Studio IBL — neutral, flat, perfect for matte finishes */}
      <Environment preset="studio" />

      {/* Key light — soft warm from upper left (product photography style) */}
      <directionalLight
        position={[-3, 8, 6]} intensity={2.2} color="#fffdf8" castShadow
        shadow-mapSize-width={4096} shadow-mapSize-height={4096}
        shadow-camera-far={20} shadow-camera-left={-5} shadow-camera-right={5}
        shadow-camera-top={6} shadow-camera-bottom={-2}
        shadow-bias={-0.0002} shadow-normalBias={0.03}
      />
      {/* Fill light — cool from right, eliminates harsh shadows */}
      <directionalLight position={[5, 5, 3]} intensity={1.4} color="#f0f4ff" />
      {/* Top overhead soft box */}
      <directionalLight position={[0, 10, 0]} intensity={0.9} color="#ffffff" />
      {/* Front fill — ensures routing shadows are visible */}
      <directionalLight position={[0, 2, 8]} intensity={0.7} color="#fff8f5" />
      {/* Ambient — bright white, no tint */}
      <ambientLight intensity={0.65} color="#ffffff" />
      <hemisphereLight color="#ffffff" groundColor="#e8e4de" intensity={0.5} />

      {/* Very soft contact shadow */}
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.28} scale={6} blur={3.5} far={3}
        color="#1a1008"
      />

      {/* Floor — light oak wood tone like ToMeasure */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#d8cfc4" roughness={0.85} metalness={0} />
      </mesh>

      {/* Back wall — near white */}
      <mesh position={[0, 1.5, -2]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#f8f7f5" roughness={0.95} metalness={0} />
      </mesh>

      {/* Wardrobe */}
      <Suspense fallback={null}>
        <WardrobeModel
          modelType={3}
          handleType="none"
          isActive={false}
          height={cfg.heightMm / 1000}
          color={wardrobeColor}
          handleColor={{ id: 'chrome', name: 'Chrome', color: '#c8c8c8', isMetallic: true }}
          handlePosition="right"
          cabinetOption="cabinet-layout"
          internalStorage={cfg.internalLayout}
          wallPosition="backWall"
          internalStorageColor={interiorColor}
          doorStyle={cfg.doorStyle}
        />
      </Suspense>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ToMeasureConfigurator — main component
// ─────────────────────────────────────────────────────────────────────────────
interface ToMeasureConfiguratorProps {
  onBack?: () => void;
}

const STEPS = ['Door Style', 'Colours', 'Interior', 'Size'] as const;
type Step = 0 | 1 | 2 | 3;

const DEFAULT_CONFIG: TMConfig = {
  doorStyle: 'cairo',
  exteriorColor: EXTERIOR_COLORS[0],  // Heritage Green
  interiorColor:  INTERIOR_COLORS[0], // Premium White
  handleStyle: 'block',
  handleColor: { id: 'chrome', name: 'Chrome', color: '#c8c8c8', isMetallic: true },
  internalLayout: 'hanging-rail-double-shelf',
  widthMm:  1500,
  heightMm: 2200,
  depthMm:  580,
};

const ToMeasureConfigurator: React.FC<ToMeasureConfiguratorProps> = ({ onBack }) => {
  const [step, setStep] = useState<Step>(0);
  const [cfg, setCfg] = useState<TMConfig>(DEFAULT_CONFIG);
  const [saveOpen, setSaveOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const price = useMemo(() => calcPrice(cfg), [cfg]);

  const update = useCallback(<K extends keyof TMConfig>(key: K, val: TMConfig[K]) => {
    setCfg(prev => ({ ...prev, [key]: val }));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleSave = (name: string) => {
    const saved = { name, config: cfg, date: new Date().toISOString() };
    localStorage.setItem(`tm-design-${Date.now()}`, JSON.stringify(saved));
    showToast(`"${name}" saved to your designs`);
  };

  // ── Step content ──────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      // ── Step 1: Door Style ──────────────────────────────────────────────
      case 0:
        return (
          <div>
            <p className="tm-section-label">Choose Door Profile</p>
            <div className="tm-door-grid">
              {DOOR_STYLES.map(ds => (
                <button
                  key={ds.id}
                  id={`door-style-${ds.id}`}
                  className={`tm-door-card ${cfg.doorStyle === ds.id ? 'selected' : ''}`}
                  onClick={() => update('doorStyle', ds.id)}
                >
                  <div className="tm-door-preview">
                    <DoorPreviewSVG
                      style={ds.id}
                      color={cfg.doorStyle === ds.id ? '#374b40' : '#888'}
                    />
                  </div>
                  <span>{ds.label}</span>
                  <span style={{ fontSize: 9.5, color: '#999', fontWeight: 400 }}>{ds.description}</span>
                </button>
              ))}
            </div>
          </div>
        );

      // ── Step 2: Colours ─────────────────────────────────────────────────
      case 1:
        return (
          <div>
            <p className="tm-section-label">Select Carcass &amp; Door Colour</p>
            <div className="tm-swatch-grid">
              {EXTERIOR_COLORS.map(c => (
                <button
                  key={c.id}
                  id={`ext-color-${c.id}`}
                  className={`tm-swatch ${cfg.exteriorColor.id === c.id ? 'selected' : ''}`}
                  onClick={() => update('exteriorColor', c)}
                  title={c.name}
                >
                  <div
                    className="tm-swatch-circle"
                    style={{ background: c.color, borderColor: c.id === 'pureWhite' ? '#ccc' : 'transparent' }}
                  />
                  <span className="tm-swatch-label">{c.name}</span>
                </button>
              ))}
            </div>

            <div className="tm-divider" />

            <p className="tm-section-label">Interior Colour</p>
            <div className="tm-swatch-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {INTERIOR_COLORS.map(c => (
                <button
                  key={c.id}
                  id={`int-color-${c.id}`}
                  className={`tm-swatch ${cfg.interiorColor.id === c.id ? 'selected' : ''}`}
                  onClick={() => update('interiorColor', c)}
                  title={c.name}
                >
                  <div
                    className="tm-swatch-circle"
                    style={{ background: c.color, borderColor: '#ddd' }}
                  />
                  <span className="tm-swatch-label">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        );

      // ── Step 3: Interior layout ─────────────────────────────────────────
      case 2:
        return (
          <div>
            <p className="tm-section-label">Internal Layout</p>
            <div className="tm-layout-grid">
              {LAYOUT_OPTIONS.map(opt => {
                const { Diagram } = opt;
                const isSelected = cfg.internalLayout === opt.key;
                return (
                  <button
                    key={opt.key}
                    id={`layout-${opt.key}`}
                    className={`tm-layout-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => update('internalLayout', opt.key as InternalStorageType)}
                  >
                    <Diagram size={52} color={isSelected ? '#374b40' : '#888'} />
                    <span className="tm-layout-label">{opt.label}</span>
                    {opt.price
                      ? <span className="tm-layout-price">+ £{opt.price}</span>
                      : <span className="tm-layout-price" style={{ color: '#3a8a4a' }}>Included</span>
                    }
                  </button>
                );
              })}
            </div>

            <div className="tm-divider" />

            <p style={{ fontSize: 11, color: '#888', lineHeight: 1.6, margin: 0 }}>
              All configurations include soft-close hinges and drawer slides as standard.
              Shelves are adjustable on 32mm pitch.
            </p>
          </div>
        );

      // ── Step 4: Size ────────────────────────────────────────────────────
      case 3:
        return (
          <div>
            <p className="tm-section-label">Enter Your Dimensions</p>

            <SizeSlider
              label="Width"
              value={cfg.widthMm}
              min={900} max={3600} step={10}
              onChange={v => update('widthMm', v)}
            />
            <SizeSlider
              label="Height"
              value={cfg.heightMm}
              min={1800} max={2800} step={10}
              onChange={v => update('heightMm', v)}
            />
            <SizeSlider
              label="Depth"
              value={cfg.depthMm}
              min={560} max={660} step={5}
              onChange={v => update('depthMm', v)}
            />

            <div style={{ background: '#f5f8f5', borderRadius: 8, padding: '12px 14px', fontSize: 11, color: '#555', lineHeight: 1.7 }}>
              <strong style={{ color: '#374b40' }}>Measuring tips</strong><br />
              Measure the width of your alcove or wall space at 3 points (top, middle, bottom) and use the smallest measurement. Allow 3–5mm clearance on each side for installation.
            </div>
          </div>
        );
    }
  };

  // ── Door style label ────────────────────────────────────────────────────────
  const doorLabel = DOOR_STYLES.find(d => d.id === cfg.doorStyle)?.label ?? 'Cairo';

  return (
    <div className="tm-root">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="tm-header">
        <button className="tm-header-back" onClick={onBack} id="tm-back-btn">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        <div className="tm-header-logo">
          Wardrobe <span>Configurator</span>
        </div>

        <div className="tm-header-actions">
          <button className="tm-header-btn" id="tm-save-btn" onClick={() => setSaveOpen(true)}>
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save Design
          </button>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="tm-body">
        {/* Left: 3D Canvas */}
        <div className="tm-canvas-wrap">
          <Canvas
            camera={{ position: [0, 1.1, 3.2], fov: 42 }}
            shadows="soft"
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 0.95,
              outputColorSpace: THREE.SRGBColorSpace,
            }}
            dpr={[1, Math.min(window.devicePixelRatio, 2)]}
          >
            <WardrobeScene cfg={cfg} />
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={1.8}
              maxDistance={6}
              minPolarAngle={Math.PI * 0.15}
              maxPolarAngle={Math.PI * 0.72}
              target={[0, 1.2, 0]}
              makeDefault
            />
          </Canvas>

          {/* Overlay labels */}
          <div className="tm-canvas-badge">{doorLabel} Door — {cfg.exteriorColor.name}</div>
          <div className="tm-canvas-hint">Drag to rotate · Scroll to zoom</div>
        </div>

        {/* Right: Sidebar */}
        <aside className="tm-sidebar">
          <div className="tm-sidebar-scroll">
            <p className="tm-sidebar-heading">Configure Your Wardrobe</p>

            {/* Step dots */}
            <div className="tm-steps">
              {STEPS.map((label, i) => (
                <button
                  key={i}
                  id={`tm-step-${i}`}
                  className={`tm-step ${i === step ? 'active' : i < step ? 'done' : ''}`}
                  onClick={() => setStep(i as Step)}
                >
                  <div className="tm-step-num">
                    {i < step
                      ? <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="20 6 9 17 4 12" /></svg>
                      : i + 1
                    }
                  </div>
                  <span className="tm-step-label">{label}</span>
                </button>
              ))}
            </div>

            {/* Active step content */}
            {renderStep()}

            {/* Step navigation */}
            <div className="tm-step-nav">
              <button
                id="tm-prev-step"
                className="tm-nav-btn tm-nav-back"
                onClick={() => setStep(prev => Math.max(0, prev - 1) as Step)}
                disabled={step === 0}
                style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
              >
                ← Back
              </button>
              <button
                id="tm-next-step"
                className="tm-nav-btn tm-nav-next"
                onClick={() => {
                  if (step < 3) setStep(prev => (prev + 1) as Step);
                }}
                disabled={step === 3}
              >
                {step === 3 ? 'Done' : 'Next →'}
              </button>
            </div>
          </div>

          {/* Footer — price + CTA */}
          <div className="tm-footer">
            <div className="tm-price-row">
              <span className="tm-price-label">Total Price</span>
              <span className="tm-price-value">
                £{price.toLocaleString('en-GB')}
                <span className="tm-price-vat">inc. VAT</span>
              </span>
            </div>
            <button
              id="tm-add-to-cart"
              className="tm-cta-btn"
              onClick={() => showToast('Added to cart — proceeding to checkout')}
            >
              Add to Cart
            </button>
          </div>
        </aside>
      </div>

      {/* Save Modal */}
      <SaveDesignModal
        isOpen={saveOpen}
        onClose={() => setSaveOpen(false)}
        onSave={handleSave}
      />

      {/* Toast */}
      {toast && <div className="tm-toast">{toast}</div>}
    </div>
  );
};

export default ToMeasureConfigurator;

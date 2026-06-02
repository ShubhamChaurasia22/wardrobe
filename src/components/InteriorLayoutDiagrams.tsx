import React from 'react';
import { InternalStorageType } from '../types';

interface DiagramProps {
  size?: number;
  color?: string;
  bg?: string;
}

const S = { stroke: 'currentColor', strokeWidth: 1.5, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

// Full Hanging — single tall hanging space with rail
export const FullHangingDiagram: React.FC<DiagramProps> = ({ size = 56, color = '#374b40', bg = '#f5f5f0' }) => (
  <svg width={size} height={size} viewBox="0 0 56 72" style={{ color }}>
    <rect x="3" y="3" width="50" height="66" rx="1" {...S} />
    {/* hanging rail */}
    <line x1="8" y1="16" x2="48" y2="16" {...S} />
    {/* rail hooks (hangers suggestion) */}
    <line x1="16" y1="16" x2="16" y2="22" {...S} />
    <line x1="28" y1="16" x2="28" y2="22" {...S} />
    <line x1="40" y1="16" x2="40" y2="22" {...S} />
    {/* floor shelf */}
    <line x1="3" y1="62" x2="53" y2="62" {...S} />
  </svg>
);

// Double Hanging Rail — two rails stacked
export const DoubleHangingDiagram: React.FC<DiagramProps> = ({ size = 56, color = '#374b40' }) => (
  <svg width={size} height={size} viewBox="0 0 56 72" style={{ color }}>
    <rect x="3" y="3" width="50" height="66" rx="1" {...S} />
    {/* top rail */}
    <line x1="8" y1="14" x2="48" y2="14" {...S} />
    <line x1="16" y1="14" x2="16" y2="20" {...S} />
    <line x1="36" y1="14" x2="36" y2="20" {...S} />
    {/* mid shelf */}
    <line x1="3" y1="38" x2="53" y2="38" {...S} />
    {/* bottom rail */}
    <line x1="8" y1="44" x2="48" y2="44" {...S} />
    <line x1="20" y1="44" x2="20" y2="50" {...S} />
    <line x1="36" y1="44" x2="36" y2="50" {...S} />
    {/* floor shelf */}
    <line x1="3" y1="62" x2="53" y2="62" {...S} />
  </svg>
);

// 1/3 Hanging + shelves (hanging top, shelves bottom)
export const HangingShelfDiagram: React.FC<DiagramProps> = ({ size = 56, color = '#374b40' }) => (
  <svg width={size} height={size} viewBox="0 0 56 72" style={{ color }}>
    <rect x="3" y="3" width="50" height="66" rx="1" {...S} />
    {/* hanging rail */}
    <line x1="8" y1="14" x2="48" y2="14" {...S} />
    <line x1="22" y1="14" x2="22" y2="22" {...S} />
    <line x1="36" y1="14" x2="36" y2="22" {...S} />
    {/* divider shelf */}
    <line x1="3" y1="38" x2="53" y2="38" {...S} />
    {/* shelves below */}
    <line x1="3" y1="50" x2="53" y2="50" {...S} />
    <line x1="3" y1="62" x2="53" y2="62" {...S} />
  </svg>
);

// Six shelves
export const SixShelvesDiagram: React.FC<DiagramProps> = ({ size = 56, color = '#374b40' }) => (
  <svg width={size} height={size} viewBox="0 0 56 72" style={{ color }}>
    <rect x="3" y="3" width="50" height="66" rx="1" {...S} />
    {[14, 24, 34, 44, 54, 62].map((y, i) => (
      <line key={i} x1="3" y1={y} x2="53" y2={y} {...S} />
    ))}
  </svg>
);

// Drawers + Hanging
export const DrawersHangingDiagram: React.FC<DiagramProps> = ({ size = 56, color = '#374b40' }) => (
  <svg width={size} height={size} viewBox="0 0 56 72" style={{ color }}>
    <rect x="3" y="3" width="50" height="66" rx="1" {...S} />
    {/* hanging rail */}
    <line x1="8" y1="14" x2="48" y2="14" {...S} />
    <line x1="24" y1="14" x2="24" y2="20" {...S} />
    {/* drawers at bottom */}
    <line x1="3" y1="44" x2="53" y2="44" {...S} />
    {/* drawer 1 */}
    <rect x="7" y="47" width="42" height="6" rx="0.5" {...S} />
    <circle cx="28" cy="50" r="1.2" fill="currentColor" />
    {/* drawer 2 */}
    <rect x="7" y="56" width="42" height="6" rx="0.5" {...S} />
    <circle cx="28" cy="59" r="1.2" fill="currentColor" />
  </svg>
);

// Drawers + Shelves
export const DrawersShelfDiagram: React.FC<DiagramProps> = ({ size = 56, color = '#374b40' }) => (
  <svg width={size} height={size} viewBox="0 0 56 72" style={{ color }}>
    <rect x="3" y="3" width="50" height="66" rx="1" {...S} />
    {/* shelves top */}
    <line x1="3" y1="18" x2="53" y2="18" {...S} />
    <line x1="3" y1="30" x2="53" y2="30" {...S} />
    <line x1="3" y1="42" x2="53" y2="42" {...S} />
    {/* drawers bottom */}
    <rect x="7" y="45" width="42" height="6" rx="0.5" {...S} />
    <circle cx="28" cy="48" r="1.2" fill="currentColor" />
    <rect x="7" y="54" width="42" height="6" rx="0.5" {...S} />
    <circle cx="28" cy="57" r="1.2" fill="currentColor" />
    <rect x="7" y="63" width="42" height="5" rx="0.5" {...S} />
    <circle cx="28" cy="65.5" r="1.2" fill="currentColor" />
  </svg>
);

// Map from InternalStorageType to diagram component
export const LAYOUT_DIAGRAMS: Record<string, { label: string; Diagram: React.FC<DiagramProps>; price?: number }> = {
  'full-hanging': { label: 'Full Hanging', Diagram: FullHangingDiagram },
  'long-hanging': { label: 'Full Hanging', Diagram: FullHangingDiagram },
  'double-hanging-rail': { label: 'Double Hanging', Diagram: DoubleHangingDiagram },
  'hanging-rail-double-shelf': { label: 'Hanging + Shelves', Diagram: HangingShelfDiagram },
  'six-shelves': { label: 'Full Shelves', Diagram: SixShelvesDiagram },
  'drawers-hanging': { label: 'Drawers + Hanging', Diagram: DrawersHangingDiagram, price: 89 },
  'rail-shelf-1-drawer': { label: 'Drawers + Hanging', Diagram: DrawersHangingDiagram, price: 89 },
  'drawers-shelves': { label: 'Drawers + Shelves', Diagram: DrawersShelfDiagram, price: 119 },
  'rail-shelf-2-drawer': { label: 'Drawers + Shelves', Diagram: DrawersShelfDiagram, price: 119 },
  'rail-shelf-3-drawer': { label: '3 Drawers + Shelves', Diagram: DrawersShelfDiagram, price: 149 },
};

export const LAYOUT_OPTIONS: Array<{ key: InternalStorageType; label: string; Diagram: React.FC<DiagramProps>; price?: number }> = [
  { key: 'full-hanging',             label: 'Full Hanging',         Diagram: FullHangingDiagram },
  { key: 'double-hanging-rail',      label: 'Double Hanging',       Diagram: DoubleHangingDiagram },
  { key: 'hanging-rail-double-shelf',label: 'Hanging + Shelves',    Diagram: HangingShelfDiagram },
  { key: 'six-shelves',              label: 'Full Shelves',          Diagram: SixShelvesDiagram },
  { key: 'drawers-hanging',          label: 'Drawers + Hanging',    Diagram: DrawersHangingDiagram, price: 89 },
  { key: 'drawers-shelves',          label: 'Drawers + Shelves',    Diagram: DrawersShelfDiagram,   price: 119 },
];

export interface ColorOption {
    id: string;
    name: string;
    color: string;
    texture?: string;
    isMetallic?: boolean;
}

export type InternalStorageType =
    | 'full-hanging'
    | 'long-hanging'
    | 'double-hanging-rail'
    | 'hanging-rail-double-shelf'
    | 'six-shelves'
    | 'rail-shelf-1-drawer'
    | 'rail-shelf-2-drawer'
    | 'rail-shelf-3-drawer'
    | 'drawers-shelves'
    | 'drawers-hanging';

export type StoragePosition = 'top' | 'bottom' | 'middle';

// cairo = 3-panel routed (ToMeasure signature)
// shaker = single recessed panel
// slab = completely flat
// contemporary = thin horizontal routing lines
// panel-eclipse / estoril / santana = legacy styles kept for compatibility
export type DoorStyle =
    | 'cairo'
    | 'shaker'
    | 'slab'
    | 'contemporary'
    | 'panel-shaker'
    | 'panel-eclipse'
    | 'estoril'
    | 'santana';

export type HandleStyle = 'block' | 'bar' | 'knob' | 'none' | 'straight' | 'fancy' | 'spherical';

export type WallSection = {
    width: number;
    type: 'free-space' | 'button' | 'wardrobe' | 'occupied';
    occupiedBy?: {
        wall: string;
        index: number;
    };
    modelType?: number;
    handleType?: 'none' | 'straight' | 'fancy' | 'spherical';
    color?: ColorOption;
    handleColor?: ColorOption;
    handlePosition?: 'left' | 'right';
    cabinetOption?: 'none' | 'cabinet-layout';
    internalStorage?: InternalStorageType;
    internalStorageColor?: ColorOption;
    storagePosition?: StoragePosition;
    doorStyle?: DoorStyle;
    isDoubleDoor?: boolean;
}

export interface LayoutConfig {
    roomDetails: {
        width: number;
        length: number;
        height: number;
    };
    leftWall: WallSection[];
    rightWall: WallSection[];
    backWall: WallSection[];
}

// ToMeasure configurator state
export interface TMConfig {
    doorStyle: DoorStyle;
    exteriorColor: ColorOption;
    interiorColor: ColorOption;
    handleStyle: HandleStyle;
    handleColor: ColorOption;
    internalLayout: InternalStorageType;
    widthMm: number;   // 900–3600
    heightMm: number;  // 1800–2800
    depthMm: number;   // 560–660
}
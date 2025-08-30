export interface ColorOption {
    id: string;
    name: string;
    color: string;
    texture?: string;
    isMetallic?: boolean;
}

export type InternalStorageType = 
    'long-hanging' | 
    'double-hanging-rail' | 
    'hanging-rail-double-shelf' | 
    'six-shelves' | 
    'rail-shelf-1-drawer' | 
    'rail-shelf-2-drawer' | 
    'rail-shelf-3-drawer';

export type StoragePosition = 'top' | 'bottom' | 'middle';

export type DoorStyle = 'panel-shaker' | 'panel-eclipse' | 'estoril' | 'santana';

export type WallSection = {
    width: number;
    type: "free-space" | "button" | "wardrobe" | "occupied";
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
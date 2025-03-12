export interface ColorOption {
    id: string;
    name: string;
    color?: string;
    texture?: string;
    isMetallic?: boolean;
}

export type InternalStorageType = 
    | 'long-hanging'
    | 'hanging-rail-double-shelf'
    | 'double-hanging-rail'
    | 'six-shelves'
    | 'rail-shelf-1-drawer'
    | 'rail-shelf-2-drawer'
    | 'rail-shelf-3-drawer';

export type StoragePosition = 'bottom' | 'middle' | 'top';

export type DoorStyle = 
    | 'panel-shaker'
    | 'panel-eclipse'
    | 'cairo'
    | 'contemporary-shaker'
    | 'estoril'
    | 'mfc-slab'
    | 'santana';

export type WallSection = {
    type: "free-space" | "wardrobe" | "wardrobe-extension";
    width: number;
    modelType?: number;
    handleType?: 'none' | 'straight' | 'fancy' | 'spherical';
    height?: number;
    color?: ColorOption;
    handleColor?: ColorOption;
    handlePosition?: 'left' | 'right'; // Make sure this is defined correctly
    cabinetOption?: 'none' | 'cabinet-layout';
    internalStorage?: InternalStorageType;
    internalStorageColor?: ColorOption;
    parentIndex?: number;
    storagePosition?: StoragePosition;
    doorStyle?: DoorStyle;
};

export interface LayoutConfig {
    roomDetails: {
        length: number;
        width: number;
        height: number;
    };
    leftWall: WallSection[];
    backWall: WallSection[];
    rightWall: WallSection[];
}
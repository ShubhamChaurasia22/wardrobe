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

export interface WallSection {
    width: number;
    type: string;
    modelType?: number;
    handleType?: 'none' | 'straight' | 'fancy' | 'spherical';
    height?: number;
    color?: ColorOption;
    handleColor?: ColorOption;
    handlePosition?: 'left' | 'right';
    cabinetOption?: 'none' | 'cabinet-layout';
    internalStorage?: InternalStorageType;
    internalStorageColor?: ColorOption;
}

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
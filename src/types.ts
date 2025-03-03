export interface ColorOption {
    id: string;
    name: string;
    color?: string;
    texture?: string;
    isMetallic?: boolean;
}

export interface WallSection {
    width: number;
    type: string;
    modelType?: number;
    handleType?: 'none' | 'straight' | 'fancy' | 'spherical';
    height?: number;
    color?: ColorOption;
    handleColor?: ColorOption;
    handlePosition?: 'left' | 'right';  // Add this line
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
import React, { useMemo } from "react";  // Add useEffect import
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import { ColorOption, InternalStorageType, DoorStyle } from '../types';

interface WardrobeModelProps {
    modelType: number;
    handleType?: 'none' | 'straight' | 'fancy' | 'spherical';
    isActive?: boolean;
    height?: number;
    color?: ColorOption;
    handleColor?: ColorOption;
    handlePosition?: 'left' | 'right';
    cabinetOption?: 'none' | 'cabinet-layout';
    internalStorage?: InternalStorageType;
    wallPosition: 'leftWall' | 'rightWall' | 'backWall'; // Add this new prop
    internalStorageColor?: ColorOption;
    storagePosition?: 'bottom' | 'top' | 'middle'; // Add this new prop
    doorStyle?: DoorStyle; // Add door style prop
}

const WardrobeModel = ({ 
    modelType, 
    handleType = 'straight', 
    isActive = false, 
    height = 2.4, 
    color, 
    handleColor, 
    handlePosition = 'right', 
    cabinetOption = 'none', 
    internalStorage = 'long-hanging',
    wallPosition, // Add this parameter
    internalStorageColor,
    storagePosition = 'middle', // Add this parameter
    doorStyle = 'panel-shaker', // Default to panel-shaker
}: WardrobeModelProps) => {

    // Load all textures unconditionally at the top level
    const woodTexture = useLoader(TextureLoader, '/textures/wood.jpg');
    const metalTexture = useLoader(TextureLoader, '/textures/metal.jpg');
    const colorTexture = useLoader(TextureLoader, color?.texture || '/textures/wood.jpg');
    const handleColorTexture = useLoader(TextureLoader, handleColor?.texture || '/textures/metal.jpg');
    const internalStorageTexture = useLoader(TextureLoader, internalStorageColor?.texture || '/textures/wood.jpg');

    // Create materials using useMemo
    const woodMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        map: woodTexture,
        metalness: 0.2,
        roughness: 0.8,
        color: 0xA0522D  // Add a base color to make wood more visible
    }), [woodTexture]);

    const handleMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        map: metalTexture,
        metalness: 0.8,
        roughness: 2.2,
        color: 0x888888
    }), [metalTexture]);

    const outlineMaterial = useMemo(() => new THREE.MeshBasicMaterial({
        color: '#e38c6e',
        wireframe: true
    }), []);

    // Create wardrobe material based on props
    const wardrobeMaterial = useMemo(() => {
        if (color) {
            if (color.texture) {
                return new THREE.MeshStandardMaterial({
                    map: colorTexture,
                    metalness: color.isMetallic ? 0.8 : 0.2,
                    roughness: color.isMetallic ? 0.2 : 0.8
                });
            }
            return new THREE.MeshStandardMaterial({
                color: color.color,
                metalness: color.isMetallic ? 0.8 : 0.2,
                roughness: color.isMetallic ? 0.2 : 0.8
            });
        }
        return woodMaterial;
    }, [color, colorTexture, woodMaterial]);

    // Create handle material based on props
    const currentHandleMaterial = useMemo(() => {
        if (handleColor) {
            if (handleColor.texture) {
                return new THREE.MeshStandardMaterial({
                    map: handleColorTexture,
                    metalness: handleColor.isMetallic ? 0.8 : 0.2,
                    roughness: handleColor.isMetallic ? 0.2 : 0.8
                });
            }
            return new THREE.MeshStandardMaterial({
                color: handleColor.color,
                metalness: handleColor.isMetallic ? 0.8 : 0.2,
                roughness: handleColor.isMetallic ? 0.2 : 0.8
            });
        }
        return handleMaterial;
    }, [handleColor, handleColorTexture, handleMaterial]);

    // Create internal storage material
    const internalStorageMaterial = useMemo(() => {
        if (internalStorageColor) {
            if (internalStorageColor.texture) {
                return new THREE.MeshStandardMaterial({
                    map: internalStorageTexture,
                    metalness: internalStorageColor.isMetallic ? 0.8 : 0.2,
                    roughness: internalStorageColor.isMetallic ? 0.2 : 0.8
                });
            }
            return new THREE.MeshStandardMaterial({
                color: internalStorageColor.color,
                metalness: internalStorageColor.isMetallic ? 0.8 : 0.2,
                roughness: internalStorageColor.isMetallic ? 0.2 : 0.8
            });
        }
        return woodMaterial;
    }, [internalStorageColor, internalStorageTexture, woodMaterial]);

    // Create base material for the door
    const doorMaterial = useMemo(() => {
        if (!color) return new THREE.MeshStandardMaterial({ color: '#B76E79' });
        const material = new THREE.MeshStandardMaterial({
            map: color.texture ? colorTexture : null,
            color: color.texture ? undefined : color.color,
            metalness: color.isMetallic ? 0.3 : 0.1,
            roughness: color.isMetallic ? 0.5 : 0.8,
            envMapIntensity: 1.2,
            side: THREE.DoubleSide
        });
        return material;
    }, [color, colorTexture]);

    // Create shadow material with slightly darker color
    const doorShadowMaterial = useMemo(() => {
        if (!color) return new THREE.MeshStandardMaterial({ color: '#8B4F57' });
        const material = new THREE.MeshStandardMaterial({
            map: color.texture ? colorTexture : null,
            metalness: color.isMetallic ? 0.3 : 0.1,
            roughness: color.isMetallic ? 0.5 : 0.8,
            envMapIntensity: 1.2,
            side: THREE.DoubleSide
        });
        if (color.texture) {
            material.color = new THREE.Color(0.7, 0.7, 0.7);  // Darken the texture
        } else {
            const baseColor = new THREE.Color(color.color);
            material.color = new THREE.Color(baseColor.r * 0.7, baseColor.g * 0.7, baseColor.b * 0.7);
        }
        return material;
    }, [color, colorTexture]);

    // Function to render door panel according to the selected style
    const renderDoorPanel = (position: [number, number, number], size: [number, number, number], isFrontDoor: boolean = true) => {
        const [width, height, depth] = size;
        const baseDepth = 0.04;  // Increased base door thickness
        const panelDepth = 0.02;  // Panel inset depth
        const frameWidth = 0.08;  // Width of the frame around panels
        const panelGap = 0.02;   // Gap between panels

        switch (doorStyle) {
            case 'panel-shaker':
                return (
                    <group position={position}>
                        {/* Base door */}
                        <mesh position={[0, 0, 0]} material={doorMaterial}>
                            <boxGeometry args={[width, height, baseDepth]} />
                        </mesh>

                        {/* Single center panel */}
                        <group position={[0, 0, baseDepth/2]}>
                            {/* Panel frame */}
                            <mesh material={doorShadowMaterial}>
                                <boxGeometry args={[width - frameWidth*2, height - frameWidth*2, panelDepth]} />
                            </mesh>
                            {/* Panel center */}
                            <mesh position={[0, 0, panelDepth/2]} material={doorMaterial}>
                                <boxGeometry args={[width - frameWidth*3, height - frameWidth*3, panelDepth/2]} />
                            </mesh>
                        </group>
                    </group>
                );

            case 'panel-eclipse':
                return (
                    <group position={position}>
                        {/* Base door */}
                        <mesh position={[0, 0, 0]} material={doorMaterial}>
                            <boxGeometry args={[width, height, baseDepth]} />
                        </mesh>

                        {/* Four panels in 2x2 grid */}
                        {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, y], i) => (
                            <group key={i} position={[x * (width/4 - frameWidth/2), y * (height/4 - frameWidth/2), baseDepth/2]}>
                                {/* Panel frame */}
                                <mesh material={doorShadowMaterial}>
                                    <boxGeometry args={[width/2 - frameWidth, height/2 - frameWidth, panelDepth]} />
                                </mesh>
                                {/* Panel center */}
                                <mesh position={[0, 0, panelDepth/2]} material={doorMaterial}>
                                    <boxGeometry args={[width/2 - frameWidth*2, height/2 - frameWidth*2, panelDepth/2]} />
                                </mesh>
                            </group>
                        ))}
                    </group>
                );

            case 'santana':
                return (
                    <group position={position}>
                        {/* Base door */}
                        <mesh position={[0, 0, 0]} material={doorMaterial}>
                            <boxGeometry args={[width, height, baseDepth]} />
                        </mesh>

                        {/* Vertical grooves */}
                        {[-2, -1, 0, 1, 2].map((i) => (
                            <group key={i} position={[(i * width/5), 0, baseDepth/2]}>
                                <mesh material={doorShadowMaterial}>
                                    <boxGeometry args={[frameWidth/2, height - frameWidth, panelDepth]} />
                                </mesh>
                            </group>
                        ))}
                    </group>
                );

            case 'estoril':
                return (
                    <group position={position}>
                        {/* Base door */}
                        <mesh position={[0, 0, 0]} material={doorMaterial}>
                            <boxGeometry args={[width, height, baseDepth]} />
                        </mesh>

                        {/* Outer frame */}
                        <mesh position={[0, 0, baseDepth/2]} material={doorShadowMaterial}>
                            <boxGeometry args={[width - frameWidth, height - frameWidth, panelDepth]} />
                        </mesh>

                        {/* Cross pattern */}
                        <group position={[0, 0, baseDepth/2 + panelDepth]}>
                            {/* Horizontal line */}
                            <mesh material={doorMaterial}>
                                <boxGeometry args={[width - frameWidth*2, frameWidth/2, panelDepth/2]} />
                            </mesh>
                            {/* Vertical line */}
                            <mesh material={doorMaterial}>
                                <boxGeometry args={[frameWidth/2, height - frameWidth*2, panelDepth/2]} />
                            </mesh>
                        </group>
                    </group>
                );

            case 'mfc-slab':
                return (
                    <group position={position}>
                        {/* Base door with increased depth */}
                        <mesh position={[0, 0, 0]} material={doorMaterial}>
                            <boxGeometry args={[width, height, baseDepth * 1.5]} />
                        </mesh>
                        {/* Add more prominent vertical lines for texture */}
                        {Array.from({ length: 7 }).map((_, i) => (
                            <mesh 
                                key={i} 
                                position={[(i - 3) * width/7, 0, baseDepth/2]} 
                                material={doorShadowMaterial}
                            >
                                <boxGeometry args={[0.01, height, panelDepth]} />
                            </mesh>
                        ))}
                        {/* Add horizontal lines for a grid pattern */}
                        {Array.from({ length: 9 }).map((_, i) => (
                            <mesh 
                                key={i} 
                                position={[0, (i - 4) * height/9, baseDepth/2]} 
                                material={doorShadowMaterial}
                            >
                                <boxGeometry args={[width, 0.01, panelDepth]} />
                            </mesh>
                        ))}
                    </group>
                );

            case 'cairo':
                return (
                    <group position={position}>
                        {/* Base door */}
                        <mesh position={[0, 0, 0]} material={doorMaterial}>
                            <boxGeometry args={[width, height, baseDepth]} />
                        </mesh>
                        {/* Diamond pattern */}
                        <group position={[0, 0, baseDepth/2]}>
                            {Array.from({ length: 3 }).map((_, rowIndex) => (
                                <group key={rowIndex} position={[0, (rowIndex - 1) * height/3, 0]}>        
                                    {Array.from({ length: 2 }).map((_, colIndex) => (
                                        <mesh 
                                            key={colIndex}
                                            position={[(colIndex - 0.5) * width/2, 0, 0]}
                                            material={doorShadowMaterial}
                                        >
                                            <boxGeometry args={[width * 0.4, width * 0.4, panelDepth]} />
                                        </mesh>
                                    ))}
                                </group>
                            ))}
                        </group>
                    </group>
                );

            // case 'contemporary-shaker':
            //     return (
            //         <group position={position}>
            //             {/* Base door */}
            //             <mesh position={[0, 0, 0]} material={doorMaterial}>
            //                 <boxGeometry args={[width, height, baseDepth]} />
            //             </mesh>
            //             {/* Modern frame pattern */}
            //             <group position={[0, 0, baseDepth]}>
            //                 {/* Large rectangle at the top - reduced height and adjusted position */}
            //                 <mesh material={doorShadowMaterial} position={[0, height/8, 0]}>
            //                     <boxGeometry args={[width * 0.85, height * 0.35, panelDepth]} />
            //                 </mesh>
            //                 {/* Small square at the bottom - adjusted position */}
            //                 <mesh material={doorShadowMaterial} position={[0, -height/3, 0]}>
            //                     <boxGeometry args={[width * 0.5, width * 0.5, panelDepth]} />
            //                 </mesh>
            //                 {/* Decorative border around both shapes - adjusted to match new sizes */}
            //                 <mesh material={doorMaterial} position={[0, height/8, panelDepth]}>
            //                     <boxGeometry args={[width * 0.9, height * 0.4, panelDepth/2]} />
            //                 </mesh>
            //                 <mesh material={doorMaterial} position={[0, -height/3, panelDepth]}>
            //                     <boxGeometry args={[width * 0.55, width * 0.55, panelDepth/2]} />
            //                 </mesh>
            //             </group>
            //         </group>
            //     );

            default:
                return (
                    <group position={position}>
                        <mesh position={[0, 0, 0]} material={doorMaterial}>
                            <boxGeometry args={[width, height, baseDepth]} />
                        </mesh>
                    </group>
                );
        }
    };

    const createHandle = (defaultPosition: [number, number, number]) => {
        const [x, y, z] = defaultPosition;
        let handleX, handleZ;

        if (modelType === 3) {
            // For double door wardrobe, use the passed positions
            handleX = x;
            handleZ = z;
        } else {
            // For single door and storage block
            handleZ = 0.29; // Keep Z position constant
            handleX = handlePosition === 'left' ? -0.28 : 0.4; // Move along X-axis based on position
        }

        switch (handleType) {
            case 'none':
                return null;
            
            case 'straight':
                return (
                    <group position={[handleX, y, handleZ]}>
                        <mesh material={currentHandleMaterial} position={[0, 0, 0]}>
                            <boxGeometry args={[0.08, 0.4, 0.08]} />
                        </mesh>
                    </group>
                );
            
            case 'fancy':
                return (
                    <group position={[handleX, y, handleZ]}>
                        <mesh material={currentHandleMaterial} position={[-0.1, 0, 0]}>
                            <boxGeometry args={[0.08, 0.4, 0.08]} />
                        </mesh>
                        <mesh position={[-0.1, 0.2, 0]} material={currentHandleMaterial}>
                            <boxGeometry args={[0.15, 0.04, 0.15]} />
                        </mesh>
                        <mesh position={[-0.1, -0.2, 0]} material={currentHandleMaterial}>
                            <boxGeometry args={[0.15, 0.04, 0.15]} />
                        </mesh>
                        <mesh position={[-0.1, 0, 0.04]} material={currentHandleMaterial}>
                            <sphereGeometry args={[0.06, 16, 16]} />
                        </mesh>
                    </group>
                );
            
            case 'spherical':
                return (
                    <group position={[handleX, y, handleZ]}>
                        {/* Connecting rod */}
                        <mesh material={currentHandleMaterial} position={[-0.1, 0, 0]}>
                            <boxGeometry args={[0.08, 0.08, 0.08]} />
                        </mesh>
                        {/* Single sphere */}
                        <mesh position={[-0.14, 0, 0]} material={currentHandleMaterial}>
                            <sphereGeometry args={[0.1, 32, 32]} />
                        </mesh>
                    </group>
                );
            
            default:
                return null;
        }
    };

    // Add lighting helper function
    const addLighting = () => (
        <>
            <ambientLight intensity={0.7} />
            <directionalLight 
                position={[5, 5, 5]} 
                intensity={0.9} 
                castShadow 
            />
            <pointLight 
                position={[-3, 0, 3]} 
                intensity={0.6} 
            />
        </>
    );

    // Add getRotation helper function
    const getRotation = (wallPosition: 'leftWall' | 'rightWall' | 'backWall'): [number, number, number] => {
        switch (wallPosition) {
            case 'leftWall':
                return [0, Math.PI, 0];    // 180 degrees around Y axis
            case 'rightWall':
                return [0, Math.PI, 0];          // 180 degrees around Y axis
            case 'backWall':
                return [0, -Math.PI, 0]; // -180 degrees around Y axis
            default:
                return [0, 0, 0];
        }
    };

    const getInternalStoragePosition = (): [number, number, number] => {
        switch (wallPosition) {
            case 'rightWall':
                return [0, -0.2, 0]; // Lower Y position for right wall
            case 'backWall':
                return [0, 0, 0];  // Higher Y position for back wall
            case 'leftWall':
                return [0, 0, 0];    // Normal Y position for left wall
            default:
                return [-0.45, 0, 0];
        }
    };

    // Use internalStorageMaterial instead of internalMaterial in renderInternalStorage
    const renderInternalStorage = () => {
        if (cabinetOption !== 'cabinet-layout') return null;

        const startPosition = getInternalStoragePosition();

        switch (internalStorage) {
            case 'long-hanging':
                return (
                    <group position={startPosition}>
                        <mesh 
                            material={internalStorageMaterial} 
                            position={[0, 0.8, 0]}
                            rotation={[0, 0, Math.PI/2]}
                        >
                            <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
                        </mesh>
                    </group>
                );

            case 'double-hanging-rail':
                return (
                    <group position={startPosition}>
                        <mesh 
                            material={internalStorageMaterial} 
                            position={[0, 1.0, 0]}
                            rotation={[0, 0, Math.PI/2]}
                        >
                            <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
                        </mesh>
                        <mesh 
                            material={internalStorageMaterial} 
                            position={[0, 0.2, 0]}
                            rotation={[0, 0, Math.PI/2]}
                        >
                            <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
                        </mesh>
                    </group>
                );

            case 'hanging-rail-double-shelf':
                return (
                    <group position={startPosition}>
                        <mesh 
                            material={internalStorageMaterial} 
                            position={[0, 1.0, 0]}
                            rotation={[0, 0, Math.PI/2]}
                        >
                            <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
                        </mesh>
                        <mesh material={internalStorageMaterial} position={[0, 0.2, 0]}>
                            <boxGeometry args={[0.9, 0.02, 0.5]} />
                        </mesh>
                        <mesh material={internalStorageMaterial} position={[0, -0.6, 0]}>
                            <boxGeometry args={[0.9, 0.02, 0.5]} />
                        </mesh>
                    </group>
                );

            case 'six-shelves':
                return (
                    <group position={startPosition}>
                        {[...Array(6)].map((_, i) => (
                            <mesh 
                                key={i}
                                material={internalStorageMaterial} 
                                position={[0, 1.0 - (i * 0.35), 0]}
                            >
                                <boxGeometry args={[0.9, 0.35, 0.5]} />
                            </mesh>
                        ))}
                    </group>
                );

            case 'rail-shelf-1-drawer':
                return (
                    <group position={startPosition}>
                        {/* Hanging rail */}
                        <mesh 
                            material={internalStorageMaterial} // Changed from internalMaterial
                            position={[0, 1.0, 0]}
                            rotation={[0, 0, Math.PI/2]}
                        >
                            <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
                        </mesh>
                        {/* Shelf */}
                        <mesh material={internalStorageMaterial} position={[0, 0.2, 0]}>
                            <boxGeometry args={[0.9, 0.02, 0.5]} />
                        </mesh>
                        {/* Single drawer */}
                        <mesh 
                            material={internalStorageMaterial}
                            position={[0, -0.96, 0]} // Keep original position
                        >
                            <boxGeometry args={[0.9, 0.35, 0.5]} />
                        </mesh>
                    </group>
                );

            case 'rail-shelf-2-drawer':
                return (
                    <group position={startPosition}>
                        {/* Hanging rail */}
                        <mesh 
                            material={internalStorageMaterial}
                            position={[0, 1.0, 0]}
                            rotation={[0, 0, Math.PI/2]}
                        >
                            <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
                        </mesh>
                        {/* Shelf */}
                        <mesh material={internalStorageMaterial} position={[0, 0.2, 0]}>
                            <boxGeometry args={[0.9, 0.02, 0.5]} />
                        </mesh>
                        {/* Two drawers with small gaps */}
                        {[0, 1].map(i => (
                            <mesh 
                                key={i}
                                material={internalStorageMaterial}
                                position={[0, -0.6 - (i * 0.36), 0]}
                            >
                                <boxGeometry args={[0.9, 0.35, 0.5]} />
                            </mesh>
                        ))}
                    </group>
                );

            case 'rail-shelf-3-drawer':
                return (
                    <group position={startPosition}>
                        {/* Hanging rail */}
                        <mesh 
                            material={internalStorageMaterial}
                            position={[0, 1.0, 0]}
                            rotation={[0, 0, Math.PI/2]}
                        >
                            <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
                        </mesh>
                        {/* Shelf */}
                        <mesh material={internalStorageMaterial} position={[0, 0.2, 0]}>
                            <boxGeometry args={[0.9, 0.02, 0.5]} />
                        </mesh>
                        {/* Three drawers with small gaps */}
                        {[0, 1, 2].map(i => (
                            <mesh 
                                key={i}
                                material={internalStorageMaterial}
                                position={[0, -0.4 - (i * 0.3), 0]}
                            >
                                <boxGeometry args={[0.9, 0.28, 0.5]} />
                            </mesh>
                        ))}
                    </group>
                );

            default:
                return null;
        }
    };

    // Update the group rotation in renderModel for both cases
    const getInternalStorageRotation = (): [number, number, number] => {
        switch (wallPosition) {
            case 'rightWall':
                return [0, Math.PI, 0];
            case 'backWall':
                return [0, Math.PI, 0];
            case 'leftWall':
                return [0, 0, 0];
            default:
                return [0, 0, 0];
        }
    };

    // Add this new function for double door wardrobe
    const shouldHideSideDoubleDoor = (side: 'front' | 'back' | 'left' | 'right') => {
        // If cabinet layout is not selected, don't hide any sides
        if (cabinetOption !== 'cabinet-layout') return false;

        // Only hide sides when cabinet layout is selected
        switch (wallPosition) {
            case 'backWall':
                return side === 'front';
            case 'leftWall':
                return side === 'front';
            case 'rightWall':
                return side === 'front';
            default:
                return false;
        }
    };

    const getStorageBlockPosition = (): number => {
        const floorHeight = -(height / 2);
        
        const positions = {
            bottom: floorHeight - 0.3,
            middle: floorHeight + 0.4,
            top: floorHeight + 1.2
        };

        const position = positions[storagePosition] || positions.middle;
        return position;
    };

    const renderModel = () => {
        const floorPosition = -(height / 2);

        // Determine which side is facing the user based on wall position
        const shouldHideSide = (side: 'front' | 'back' | 'left' | 'right') => {
            if (cabinetOption !== 'cabinet-layout') return false;

            switch (wallPosition) {
                case 'backWall':
                    return side === 'right'; // Hide left side when on back wall (facing user)
                case 'leftWall':
                    return side === 'right'; // Hide right side when on left wall
                case 'rightWall':
                    return side === 'right'; // Hide front when on right wall
                default:
                    return false;
            }
        };

        switch (modelType) {
            case 1: // Single Door Wardrobe
                return (
                    <group 
                        rotation={getRotation(wallPosition)} 
                        position={[0, floorPosition + 1.2, -0.3]}
                    >
                        <group>
                            {/* Back panel - always show */}
                            <mesh material={wardrobeMaterial} position={[-0.49, 0, 0]}>
                                <boxGeometry args={[0.02, 2.35, 0.55]} />
                            </mesh>

                            {/* Left side */}
                            {!shouldHideSide('left') && (
                                <mesh 
                                    material={wardrobeMaterial} 
                                    position={[0, 0, -0.275]}
                                >
                                    <boxGeometry args={[1, 2.35, 0.02]} />
                                </mesh>
                            )}

                            {/* Right side */}
                            {!shouldHideSide('right') && (
                                <group position={[0, 0, 0.275]} rotation={[0, 0, 0]}>
                                    {renderDoorPanel([0, 0, 0], [1, Number(modelType) === 2 ? 0.8 : 2.35, 0.08], true)}
                                </group>
                            )}

                            {/* Front panel */}
                            {!shouldHideSide('front') && (
                                <mesh 
                                    material={wardrobeMaterial} 
                                    position={[0.49, 0, 0]}
                                >
                                    <boxGeometry args={[0.02, Number(modelType) === 2 ? 0.8 : 2.35, 0.55]} />
                                </mesh>
                            )}

                            {/* Top and Bottom - always show */}
                            <mesh material={wardrobeMaterial} position={[0, 1.175, 0]}>
                                <boxGeometry args={[1, 0.02, 0.55]} />
                            </mesh>
                            <mesh material={wardrobeMaterial} position={[0, -1.175, 0]}>
                                <boxGeometry args={[1, 0.02, 0.55]} />
                            </mesh>
                        </group>

                        {/* Handle - only show if cabinet layout is not selected */}
                        {cabinetOption !== 'cabinet-layout' && handleType !== 'none' && createHandle([0.49, 0, 0])}
                        
                        {/* Internal storage - show if cabinet layout is selected */}
                        {cabinetOption === 'cabinet-layout' && (
                            <group rotation={getInternalStorageRotation()}>
                                {renderInternalStorage()}
                            </group>
                        )}
                        
                        {/* Active outline */}
                        {isActive && (
                            <mesh material={outlineMaterial} scale={[1.02, 1.02, 1.02]}>
                                <boxGeometry args={[1, 2.4, 0.75]} />
                            </mesh>
                        )}
                    </group>
                );

            case 2: // Storage Block
                const yPosition = getStorageBlockPosition();
                
                return (
                    <group 
                        rotation={getRotation(wallPosition)} 
                        position={[0, yPosition, -0.3]}
                    >
                        <group>
                            {/* Back panel - always show */}
                            <mesh material={wardrobeMaterial} position={[-0.49, 0, 0]}>
                                <boxGeometry args={[0.02, 0.8, 0.55]} />
                            </mesh>

                            {/* Left side */}
                            {!shouldHideSide('left') && (
                                <mesh material={wardrobeMaterial} position={[0, 0, -0.275]}>
                                    <boxGeometry args={[1, 0.8, 0.02]} />
                                </mesh>
                            )}

                            {/* Right side */}
                            {!shouldHideSide('right') && (
                                <group position={[0, 0, 0.275]} rotation={[0, 0, 0]}>
                                    {renderDoorPanel([0, 0, 0], [1, 0.8, 0.08], true)}
                                </group>
                            )}

                            {/* Front panel */}
                            {!shouldHideSide('front') && (
                                <mesh material={wardrobeMaterial} position={[0.49, 0, 0]}>
                                    <boxGeometry args={[0.02, 0.8, 0.55]} />
                                </mesh>
                            )}

                            {/* Top panel */}
                            <mesh material={wardrobeMaterial} position={[0, 0.4, 0]}>
                                <boxGeometry args={[1, 0.02, 0.55]} />
                            </mesh>

                            {/* Bottom panel */}
                            <mesh material={wardrobeMaterial} position={[0, -0.4, 0]}>
                                <boxGeometry args={[1, 0.02, 0.55]} />
                            </mesh>

                            {/* Handle - only show if cabinet layout is not selected */}
                            {cabinetOption !== 'cabinet-layout' && handleType !== 'none' && (
                                createHandle([0.49, 0, 0])
                            )}

                            {/* Active outline */}
                            {isActive && (
                                <mesh material={outlineMaterial} scale={[1.02, 1.02, 1.02]}>
                                    <boxGeometry args={[1, 0.8, 0.7]} />
                                </mesh>
                            )}
                        </group>
                    </group>
                );

            case 3: // Double Door Wardrobe
                return (
                    <group 
                        rotation={getRotation(wallPosition)}
                        position={[0, floorPosition + 1.2, -0.3]}
                    >
                        <group>
                            {/* Back Wall */}
                            {!shouldHideSideDoubleDoor('back') && (
                                <mesh material={wardrobeMaterial} position={[0, 0, -0.275]}>
                                    <boxGeometry args={[2, 2.35, 0.02]} />
                                </mesh>
                            )}

                            {/* Left Side Wall */}
                            {!shouldHideSideDoubleDoor('left') && (
                                <mesh material={wardrobeMaterial} position={[-1, 0, 0]}>
                                    <boxGeometry args={[0.02, 2.35, 0.55]} />
                                </mesh>
                            )}

                            {/* Right Side Wall */}
                            {!shouldHideSideDoubleDoor('right') && (
                                <mesh material={wardrobeMaterial} position={[1, 0, 0]}>
                                    <boxGeometry args={[0.02, 2.35, 0.55]} />
                                </mesh>
                            )}

                            {/* Front Doors */}
                            {!shouldHideSideDoubleDoor('front') && (
                                <>
                                    {/* Left Door - Use renderDoorPanel with thicker depth */}
                                    {renderDoorPanel([-0.5, 0, 0.275], [0.98, 2.35, 0.08])}
                                    
                                    {/* Right Door - Use renderDoorPanel with thicker depth */}
                                    {renderDoorPanel([0.5, 0, 0.275], [0.98, 2.35, 0.08])}
                                    
                                    {/* Center Gap Line */}
                                    <mesh position={[0, 0, 0.275]} material={outlineMaterial}>
                                        <boxGeometry args={[0.04, 2.35, 0.02]} />
                                    </mesh>
                                </>
                            )}

                            {/* Handles - Only show if cabinet layout is not selected */}
                            {cabinetOption !== 'cabinet-layout' && handleType !== 'none' && (
                                <>
                                    {createHandle([-0.2, 0, 0.3])} {/* Left Door Handle */}
                                    {createHandle([0.3, 0, 0.3])}  {/* Right Door Handle */}
                                </>
                            )}

                            {/* Internal Storage - Show when cabinet layout is selected */}
                            {cabinetOption === 'cabinet-layout' && (
                                <>
                                    {/* Left Compartment */}
                                    <group rotation={getInternalStorageRotation()} position={[-0.5, 0, 0]}>
                                        {renderInternalStorage()}
                                    </group>
                                    {/* Right Compartment */}
                                    <group rotation={getInternalStorageRotation()} position={[0.5, 0, 0]}>
                                        {renderInternalStorage()}
                                    </group>
                                </>
                            )}

                            {/* Top Panel */}
                            <mesh material={wardrobeMaterial} position={[0, 1.175, 0]}>
                                <boxGeometry args={[2, 0.02, 0.55]} />
                            </mesh>

                            {/* Bottom Panel */}
                            <mesh material={wardrobeMaterial} position={[0, -1.175, 0]}>
                                <boxGeometry args={[2, 0.02, 0.55]} />
                            </mesh>

                            {/* Active Selection Outline */}
                            {isActive && (
                                <mesh material={outlineMaterial} scale={[1.02, 1.02, 1.02]}>
                                    <boxGeometry args={[2, 2.4, 0.7]} />
                                </mesh>
                            )}
                        </group>
                    </group>
                );
            
            default:
                return null;
        }
    };

    return (
        <group>
            {addLighting()}
            {renderModel()}
        </group>
    );
};

export default WardrobeModel;

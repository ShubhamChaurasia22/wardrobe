import React, { useMemo } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import { ColorOption, InternalStorageType } from '../types';

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
    internalStorageColor
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

    const createHandle = (defaultPosition: [number, number, number]) => {
        const [x, y, z] = defaultPosition;
        // For double door, we don't need to adjust handle X position
        const handleX = x;
        const handleZ = modelType === 3 ? z : (handlePosition === 'left' ? -0.275 : 0.275);
        // Keep rest of handle creation logic the same

        switch (handleType) {
            case 'none':
                return null;
            
            case 'straight':
                return (
                    <group position={[handleX, y, handleZ]}>
                        <mesh material={currentHandleMaterial} position={[-0.1, 0, 0.31]}>
                            <boxGeometry args={[0.08, 0.4, 0.08]} />
                        </mesh>
                    </group>
                );
            
            case 'fancy':
                return (
                    <group position={[handleX, y, handleZ]}>
                        <mesh material={currentHandleMaterial} position={[-0.1, 0, 0.31]}>
                            <boxGeometry args={[0.08, 0.4, 0.08]} />
                        </mesh>
                        <mesh position={[-0.1, 0.2, 0.31]} material={currentHandleMaterial}>
                            <boxGeometry args={[0.15, 0.04, 0.15]} />
                        </mesh>
                        <mesh position={[-0.1, -0.2, 0.31]} material={currentHandleMaterial}>
                            <boxGeometry args={[0.15, 0.04, 0.15]} />
                        </mesh>
                        <mesh position={[-0.1, 0, 0.35]} material={currentHandleMaterial}>
                            <sphereGeometry args={[0.06, 16, 16]} />
                        </mesh>
                    </group>
                );
            
            case 'spherical':
                return (
                    <group position={[handleX, y, handleZ]}>
                        <group rotation={[Math.PI/2, 0, 0]} position={[-0.1, 0, 0.31]}>
                            <mesh material={currentHandleMaterial}>
                                <cylinderGeometry args={[0.03, 0.03, 0.4, 16]} />
                            </mesh>
                        </group>
                        <mesh position={[-0.1, 0.2, 0.31]} material={currentHandleMaterial}>
                            <sphereGeometry args={[0.06, 16, 16]} />
                        </mesh>
                        <mesh position={[-0.1, -0.2, 0.31]} material={currentHandleMaterial}>
                            <sphereGeometry args={[0.06, 16, 16]} />
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
            <ambientLight intensity={0.5} />
            <directionalLight 
                position={[5, 5, 5]} 
                intensity={1} 
                castShadow 
            />
            <pointLight 
                position={[-5, 0, 5]} 
                intensity={0.5} 
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
                                <boxGeometry args={[0.9, 0.02, 0.5]} />
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
                            position={[0, -0.84, 0]} // Keep original position
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
                                position={[0, -0.43 - (i * 0.36), 0]}
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
                                position={[0, -0.28 - (i * 0.3), 0]}
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
                                <mesh 
                                    material={wardrobeMaterial} 
                                    position={[0, 0, 0.275]}
                                >
                                    <boxGeometry args={[1, 2.35, 0.02]} />
                                </mesh>
                            )}

                            {/* Front panel */}
                            {!shouldHideSide('front') && (
                                <mesh position={[0.49, 0, 0]} material={wardrobeMaterial}>
                                    <boxGeometry args={[0.02, 2.35, 0.55]} />
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
                        {cabinetOption !== 'cabinet-layout' && handleType !== 'none' && createHandle([0.5, 0, 0])}
                        
                        {/* Internal storage - show if cabinet layout is selected */}
                        {cabinetOption === 'cabinet-layout' && (
                            <group rotation={getInternalStorageRotation()}>
                                {renderInternalStorage()}
                            </group>
                        )}
                        
                        {/* Active outline */}
                        {isActive && (
                            <mesh material={outlineMaterial} scale={[1.02, 1.02, 1.02]}>
                                <boxGeometry args={[1, 2.4, 0.6]} />
                            </mesh>
                        )}
                    </group>
                );

            case 2: // Storage Block
                return (
                    <group 
                        rotation={getRotation(wallPosition)} 
                        position={[0, floorPosition + 0.4, -0.3]}
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
                                <mesh material={wardrobeMaterial} position={[0, 0, 0.275]}>
                                    <boxGeometry args={[1, 0.8, 0.02]} />
                                </mesh>
                            )}

                            {/* Front panel */}
                            {!shouldHideSide('front') && (
                                <mesh position={[0.49, 0, 0]} material={wardrobeMaterial}>
                                    <boxGeometry args={[0.02, 0.8, 0.55]} />
                                </mesh>
                            )}

                            {/* Top */}
                            <mesh material={wardrobeMaterial} position={[0, 0.4, 0]}>
                                <boxGeometry args={[1, 0.02, 0.55]} />
                            </mesh>

                            {/* Bottom */}
                            <mesh material={wardrobeMaterial} position={[0, -0.4, 0]}>
                                <boxGeometry args={[1, 0.02, 0.55]} />
                            </mesh>
                        </group>

                        {/* Internal storage - only show if cabinet layout is selected */}
                        {cabinetOption === 'cabinet-layout' && (
                            <group rotation={getInternalStorageRotation()}>
                                {renderInternalStorage()}
                            </group>
                        )}

                        {/* Active outline */}
                        {isActive && (
                            <mesh material={outlineMaterial} scale={[1.02, 1.02, 1.02]}>
                                <boxGeometry args={[1, 0.8, 0.6]} />
                            </mesh>
                        )}
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
                                    {/* Left Door */}
                                    <mesh position={[-0.5, 0, 0.275]} material={wardrobeMaterial}>
                                        <boxGeometry args={[0.98, 2.35, 0.02]} />
                                    </mesh>
                                    
                                    {/* Right Door */}
                                    <mesh position={[0.5, 0, 0.275]} material={wardrobeMaterial}>
                                        <boxGeometry args={[0.98, 2.35, 0.02]} />
                                    </mesh>
                                    
                                    {/* Center Gap Line */}
                                    <mesh position={[0, 0, 0.275]} material={outlineMaterial}>
                                        <boxGeometry args={[0.04, 2.35, 0.02]} />
                                    </mesh>
                                </>
                            )}

                            {/* Handles - Only show if cabinet layout is not selected */}
                            {cabinetOption !== 'cabinet-layout' && handleType !== 'none' && (
                                <>
                                    {createHandle([-0.2, 0, 0])} {/* Left Door Handle */}
                                    {createHandle([0.4, 0, 0])}  {/* Right Door Handle */}
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
                                    <boxGeometry args={[2, 2.4, 0.6]} />
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

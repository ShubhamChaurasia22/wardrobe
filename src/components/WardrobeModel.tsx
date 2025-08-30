import React, { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ColorOption, InternalStorageType, DoorStyle, StoragePosition } from '../types';

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
    wallPosition: 'leftWall' | 'rightWall' | 'backWall'; // Add this new prop
    internalStorageColor?: ColorOption;
    storagePosition?: 'bottom' | 'top' | 'middle'; // Add this new prop
    doorStyle?: DoorStyle; // Add door style prop
}

// Default door image for fallback
const DEFAULT_DOOR_IMAGE = '/assets/default.png';

// Function to get texture URL for door style - moved outside component to fix dependency issues
const getTextureUrlForDoorStyle = (doorStyle: DoorStyle = 'panel-shaker') => {
    // Fallback textures for different door styles
    const fallbackTextures: Record<string, string> = {
        'panel-shaker': 'https://img.freepik.com/free-photo/wooden-texture_1422-300.jpg',
        'panel-eclipse': 'https://img.freepik.com/free-photo/wooden-parquet-texture-background_1339-5269.jpg',
        'estoril': 'https://img.freepik.com/free-photo/dark-wooden-texture_24837-382.jpg',
        'santana': 'https://img.freepik.com/free-photo/wood-painted-white-texture-background_53876-167459.jpg'
    };
    
    // Return appropriate fallback based on door style
    return fallbackTextures[doorStyle] || fallbackTextures['panel-shaker'];
};

// Get wall rotation - moved outside component
const getRotation = (wallPosition?: string): [number, number, number] => {
    switch (wallPosition) {
        case 'leftWall':
            return [0, Math.PI / 2, 0];
        case 'rightWall':
            return [0, -Math.PI / 2, 0];
        case 'backWall':
            return [0, 0, 0];
        default:
            return [0, 0, 0];
    }
};

// Create internal storage material function
const createInternalStorageMaterial = (internalStorageColor?: ColorOption, internalStorageTexture?: THREE.Texture, woodMaterial?: THREE.MeshStandardMaterial) => {
    if (internalStorageColor) {
        return new THREE.MeshStandardMaterial({
            color: internalStorageColor.color || '#ffffff',
            metalness: internalStorageColor.isMetallic ? 0.8 : 0.2,
            roughness: internalStorageColor.isMetallic ? 0.2 : 0.8
        });
    }
    return new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.7 });
};

// Function to get internal storage position
const getInternalStoragePosition = (wallPosition?: string): [number, number, number] => {
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

const WardrobeModel = ({ 
    modelType, 
    handleType = 'straight', 
    isActive = false, 
    height, 
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
    console.log('Rendering WardrobeModel:', { 
        modelType, 
        handleType, 
        isActive, 
        wallPosition, 
        doorStyle 
    });

    // Load the door texture directly using useLoader
    const doorTexture = useLoader(TextureLoader, DEFAULT_DOOR_IMAGE);

    // Load all textures unconditionally at the top level
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const woodTexture = useLoader(TextureLoader, '/textures/wood.jpg');
    const metalTexture = useLoader(TextureLoader, '/textures/metal.jpg');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const colorTexture = useLoader(TextureLoader, color?.texture || '/textures/wood.jpg');
    const handleColorTexture = useLoader(TextureLoader, handleColor?.texture || '/textures/metal.jpg');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const internalStorageTexture = useLoader(TextureLoader, internalStorageColor?.texture || '/textures/wood.jpg');

    // Function to get the door color based on the color prop
    const getDoorColor = () => {
        if (color && color.id) {
            return color.color || "#ffffff";
        }
        return "#ffffff"; // Default color if none selected
    };
    
    // Load the door overlay texture with error handling
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const doorOverlayTexture = useMemo(() => {
        try {
            // Try loading from local assets first, with fallback to a placeholder URL
            const localImagePath = '/assets/default.png';
            const fallbackImageUrl = getTextureUrlForDoorStyle();
            
            const texture = new THREE.TextureLoader().load(
                localImagePath, 
                // onLoad callback
                (loadedTexture) => {
                    console.log('Door texture loaded successfully');
                    // Set texture properties for better appearance
                    loadedTexture.wrapS = loadedTexture.wrapT = THREE.RepeatWrapping;
                    loadedTexture.repeat.set(1, 1);
                    loadedTexture.needsUpdate = true;
                },
                // onProgress callback (not used but required for the next callback)
                undefined,
                // onError callback - try the fallback URL
                (err) => {
                    console.error('Error loading local door texture, trying fallback:', err);
                    return new THREE.TextureLoader().load(
                        fallbackImageUrl,
                        (fallbackTexture) => {
                            console.log('Fallback texture loaded successfully');
                            fallbackTexture.wrapS = fallbackTexture.wrapT = THREE.RepeatWrapping;
                            fallbackTexture.repeat.set(1, 1);
                            fallbackTexture.needsUpdate = true;
                        },
                        undefined,
                        (fallbackErr) => {
                            console.error('Failed to load fallback texture:', fallbackErr);
                        }
                    );
                }
            );
            return texture;
        } catch (error) {
            console.error('Failed to create door texture:', error);
            return null;
        }
    }, []); // Remove the dependencies that are causing warnings

    // Enhanced materials
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const woodMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: "#2f4d3a", // Dark teal/green like in the reference image
            roughness: 0.7,
            metalness: 0.2,
            shadowSide: THREE.FrontSide,
            side: THREE.DoubleSide
        });
    }, []);

    // Create materials using useMemo
    const metalMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        map: metalTexture,
        metalness: 0.8,
        roughness: 2.2,
        color: 0x888888
    }), [metalTexture]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const outlineMaterial = useMemo(() => new THREE.MeshBasicMaterial({
        color: '#e38c6e',
        wireframe: true
    }), []);

    // Enhanced door materials based on selected color
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const wardrobeMaterial = useMemo(() => {
        if (color && color.id !== 'white') {
            const baseColor = new THREE.Color(color.color || '#2f4d3a'); // Default to teal if not specified
            
            // Return a material with better properties
            return new THREE.MeshStandardMaterial({
                color: baseColor,
                roughness: color.isMetallic ? 0.3 : 0.7,
                metalness: color.isMetallic ? 0.8 : 0.2,
                shadowSide: THREE.FrontSide,
                side: THREE.DoubleSide,
                envMapIntensity: color.isMetallic ? 1.0 : 0.5
            });
        }
        // If no color is selected, use the default teal
        return woodMaterial;
    }, [color, woodMaterial]);

    // Handle material based on handle color selection and metallic property
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const currentHandleMaterial = useMemo(() => {
        if (handleColor && handleColor.id !== 'chrome') {
            return new THREE.MeshStandardMaterial({
                color: new THREE.Color(handleColor.color || '#888888'),
                roughness: handleColor.isMetallic ? 0.2 : 0.7,
                metalness: handleColor.isMetallic ? 0.8 : 0.2,
                map: handleColorTexture,
                envMapIntensity: handleColor.isMetallic ? 1.0 : 0.5
            });
        }
        return metalMaterial;
    }, [handleColor, handleColorTexture, metalMaterial]);

    // Door shadow material for depth
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const doorShadowMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: "#000000",
            transparent: true,
            opacity: 0.1,
            side: THREE.FrontSide
        });
    }, []);
    
    // Function to check which sides should be hidden based on wall position
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const shouldHideSide = (side: 'front' | 'back' | 'left' | 'right') => {
        if (cabinetOption !== 'cabinet-layout') return false;

        switch (wallPosition) {
            case 'backWall':
                return side === 'back'; // Hide back side for back wall
            case 'leftWall':
                return side === 'left'; // Hide left side for left wall
            case 'rightWall':
                return side === 'right'; // Hide right side for right wall
            default:
                return false;
        }
    };

    // Function to determine storage block position
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const addLighting = (group: THREE.Group) => {
        // Add directional light for shadows
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 2, 3);
        directionalLight.castShadow = true;
        group.add(directionalLight);
        
        // Add ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        group.add(ambientLight);
    };

    // Modified renderDoorPanel function to apply the texture
    const renderDoorPanel = (position: [number, number, number], size: [number, number, number], isFrontDoor: boolean = true) => {
        // Adjust texture repeat based on door dimensions
        const doorWidth = size[0];
        const doorHeight = size[1];
        
        // Clone the texture to avoid affecting other usages, if available
        let adjustedTexture = null;
        if (doorTexture) {
            adjustedTexture = doorTexture.clone();
            adjustedTexture.wrapS = adjustedTexture.wrapT = THREE.RepeatWrapping;
            
            // Set appropriate scaling based on door dimensions
            // For taller doors, we want to repeat the texture more vertically
            adjustedTexture.repeat.set(1, doorHeight / doorWidth);
            adjustedTexture.needsUpdate = true;
        }
        
        // Get door color
        const doorColor = getDoorColor();
        
        // Create door material with texture
        return (
            <mesh position={position} castShadow receiveShadow>
                <boxGeometry args={size} />
                <meshStandardMaterial 
                    color={doorColor}
                    roughness={0.4} // Slightly rougher to show texture better
                    metalness={0.05} // Lower metalness for more natural look
                    map={adjustedTexture}
                    transparent={Boolean(adjustedTexture)}
                    opacity={adjustedTexture ? 0.9 : 1}
                />
            </mesh>
        );
    };

    // Create better looking handles
    const createHandle = (position: [number, number, number]) => {
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: handleColor?.color || '#C0C0C0',
            metalness: 0.8,
            roughness: 0.2
        });

        switch (handleType) {
            case 'straight':
                return (
                    <group position={position}>
                        {/* Handle rod */}
                        <mesh castShadow>
                            <boxGeometry args={[0.03, 0.2, 0.03]} />
                            <primitive object={handleMaterial} />
                        </mesh>
                        {/* Handle mounts */}
                        <mesh position={[0, 0.08, 0.02]} castShadow>
                            <boxGeometry args={[0.02, 0.02, 0.04]} />
                            <primitive object={handleMaterial} />
                        </mesh>
                        <mesh position={[0, -0.08, 0.02]} castShadow>
                            <boxGeometry args={[0.02, 0.02, 0.04]} />
                            <primitive object={handleMaterial} />
                        </mesh>
                    </group>
                );
            case 'fancy':
                return (
                    <group position={position}>
                        {/* Handle rod - curved appearance */}
                        <mesh castShadow rotation={[Math.PI/2, 0, 0]}>
                            <cylinderGeometry args={[0.015, 0.015, 0.2, 16]} />
                            <primitive object={handleMaterial} />
                        </mesh>
                        {/* Decorative end caps */}
                        <mesh position={[0, 0.1, 0]} castShadow>
                            <sphereGeometry args={[0.02, 16, 16]} />
                            <primitive object={handleMaterial} />
                        </mesh>
                        <mesh position={[0, -0.1, 0]} castShadow>
                            <sphereGeometry args={[0.02, 16, 16]} />
                            <primitive object={handleMaterial} />
                        </mesh>
                        {/* Handle mounts */}
                        <mesh position={[0, 0, 0.02]} castShadow>
                            <boxGeometry args={[0.03, 0.03, 0.04]} />
                            <primitive object={handleMaterial} />
                            </mesh>
                    </group>
                );
            case 'spherical':
                return (
                    <group position={position}>
                        {/* Spherical knob */}
                        <mesh castShadow>
                            <sphereGeometry args={[0.04, 16, 16]} />
                            <primitive object={handleMaterial} />
                        </mesh>
                        {/* Base plate */}
                        <mesh position={[0, 0, -0.02]} castShadow rotation={[Math.PI/2, 0, 0]}>
                            <cylinderGeometry args={[0.03, 0.03, 0.01, 16]} />
                            <primitive object={handleMaterial} />
                                        </mesh>
                    </group>
                );
            case 'none':
                return null;
            default:
                // Default to straight handle
                return (
                    <group position={position}>
                        <mesh castShadow>
                            <boxGeometry args={[0.03, 0.2, 0.03]} />
                            <primitive object={handleMaterial} />
                        </mesh>
                    </group>
                );
        }
    };

    // Get proper rotation based on wall position
    const rotation = getRotation(wallPosition);
    
    // Calculate scale based on room height
    const scale = height / 2.4; // 2.4 is the default height

    // Calculate proper position offset based on wall position
    const getWardrobePosition = (): [number, number, number] => {
        // Y position adjustment to ensure wardrobe touches the floor
        const floorLevel = 0;
        const wardrobeHalfHeight = 1.2; // Half of standard 2.4m wardrobe
        const yPosition = floorLevel - wardrobeHalfHeight; // Position the bottom at floor level

        switch (wallPosition) {
            case 'leftWall':
                return [0, yPosition, 0.3]; // Default position for left wall
            case 'rightWall':
                return [0, yPosition, 0.3]; // Default position for right wall
            case 'backWall':
                return [0, yPosition, 0.3]; // Move slightly closer to wall but maintain x at 0
            default:
                return [0, yPosition, 0];
        }
    };

    // Internal storage rendering function
    const renderInternalStorage = () => {
        if (cabinetOption !== 'cabinet-layout') return null;

        const internalStorageMaterial = createInternalStorageMaterial(internalStorageColor, internalStorageTexture);
        const startPosition = getInternalStoragePosition(wallPosition);

        switch (internalStorage) {
            case 'long-hanging':
                return (
                    <group position={startPosition}>
                        <mesh 
                            position={[0, 0.8, 0]}
                            rotation={[0, 0, Math.PI/2]}
                            castShadow
                            receiveShadow
                        >
                            <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
                            <primitive object={internalStorageMaterial} />
                        </mesh>
                    </group>
                );

            case 'double-hanging-rail':
                return (
                    <group position={startPosition}>
                        <mesh 
                            position={[0, 1.0, 0]}
                            rotation={[0, 0, Math.PI/2]}
                            castShadow
                            receiveShadow
                        >
                            <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
                            <primitive object={internalStorageMaterial} />
                        </mesh>
                        <mesh 
                            position={[0, 0.2, 0]}
                            rotation={[0, 0, Math.PI/2]}
                            castShadow
                            receiveShadow
                        >
                            <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
                            <primitive object={internalStorageMaterial} />
                        </mesh>
                    </group>
                );

            case 'hanging-rail-double-shelf':
                return (
                    <group position={startPosition}>
                        <mesh 
                            position={[0, 1.0, 0]}
                            rotation={[0, 0, Math.PI/2]}
                            castShadow
                            receiveShadow
                        >
                            <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
                            <primitive object={internalStorageMaterial} />
                        </mesh>
                        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
                            <boxGeometry args={[0.9, 0.02, 0.5]} />
                            <primitive object={internalStorageMaterial} />
                        </mesh>
                        <mesh position={[0, -0.6, 0]} castShadow receiveShadow>
                            <boxGeometry args={[0.9, 0.02, 0.5]} />
                            <primitive object={internalStorageMaterial} />
                        </mesh>
                    </group>
                );

            case 'six-shelves':
                return (
                    <group position={startPosition}>
                        {[...Array(6)].map((_, i) => (
                            <mesh 
                                key={i}
                                position={[0, 1.0 - (i * 0.35), 0]}
                                castShadow
                                receiveShadow
                            >
                                <boxGeometry args={[0.9, 0.35, 0.5]} />
                                <primitive object={internalStorageMaterial} />
                            </mesh>
                        ))}
                    </group>
                );

            default:
                return null;
        }
    };

    const renderModel = () => {
        // Base cabinet color - updated to a warmer, more natural wood color
        const cabinetColor = color?.color || '#5D4037'; // Warmer brown color
        const basePosition = getWardrobePosition();
        
        // Higher outline intensity for active wardrobe
        const wardrobeOutlineMaterial = isActive ? 
            new THREE.MeshStandardMaterial({
                color: "#e74c3c",
                emissive: "#e74c3c",
                emissiveIntensity: 0.3,
                roughness: 0.7
            }) : 
            new THREE.MeshStandardMaterial({
                color: cabinetColor,
                roughness: 0.7
            });

        switch (modelType) {
            case 1: // Single Door
                return (
                    <group position={basePosition}>
                        {/* Base structure */}
                        <mesh position={[0, 0, 0]} receiveShadow>
                            <boxGeometry args={[1, 0.02, 0.6]} />
                            <meshStandardMaterial color={cabinetColor} />
                            </mesh>

                        {/* Top */}
                        <mesh position={[0, 2.38, 0]} receiveShadow>
                            <boxGeometry args={[1, 0.02, 0.6]} />
                            <meshStandardMaterial color={cabinetColor} />
                                </mesh>
                        
                        {/* Back */}
                        <mesh position={[0, 1.2, -0.3]} receiveShadow>
                            <boxGeometry args={[1, 2.4, 0.02]} />
                            <meshStandardMaterial color={cabinetColor} />
                                </mesh>
                        
                        {/* Sides - using active outline material for the sides when active */}
                        <mesh position={[-0.49, 1.2, 0]} receiveShadow>
                            <boxGeometry args={[0.02, 2.4, 0.6]} />
                            <primitive object={isActive ? wardrobeOutlineMaterial : new THREE.MeshStandardMaterial({ color: cabinetColor })} />
                            </mesh>
                        <mesh position={[0.49, 1.2, 0]} receiveShadow>
                            <boxGeometry args={[0.02, 2.4, 0.6]} />
                            <primitive object={isActive ? wardrobeOutlineMaterial : new THREE.MeshStandardMaterial({ color: cabinetColor })} />
                            </mesh>
                        
                        {/* Door */}
                        {renderDoorPanel([0, 1.2, 0.31], [0.96, 2.37, 0.02])}
                        
                        {/* Handle */}
                        {handleType !== 'none' && (
                            createHandle(handlePosition === 'right' ? [0.4, 1.2, 0.33] : [-0.4, 1.2, 0.33])
                        )}
                        
                        {/* Internal Storage if cabinet option is selected */}
                        {cabinetOption === 'cabinet-layout' && (
                            <group rotation={rotation}>
                                {renderInternalStorage()}
                            </group>
                        )}
                    </group>
                );

            case 2: // Storage Block
                return (
                    <group position={basePosition}>
                        {/* Base structure */}
                        <mesh position={[0, 0, 0]} receiveShadow>
                            <boxGeometry args={[1, 0.02, 0.6]} />
                            <meshStandardMaterial color={cabinetColor} />
                            </mesh>

                        {/* Top */}
                        <mesh position={[0, 2.38, 0]} receiveShadow>
                            <boxGeometry args={[1, 0.02, 0.6]} />
                            <meshStandardMaterial color={cabinetColor} />
                                </mesh>
                        
                        {/* Back */}
                        <mesh position={[0, 1.2, -0.3]} receiveShadow>
                            <boxGeometry args={[1, 2.4, 0.02]} />
                            <meshStandardMaterial color={cabinetColor} />
                            </mesh>

                        {/* Sides */}
                        <mesh position={[-0.49, 1.2, 0]} receiveShadow>
                            <boxGeometry args={[0.02, 2.4, 0.6]} />
                            <meshStandardMaterial color={cabinetColor} />
                        </mesh>
                        <mesh position={[0.49, 1.2, 0]} receiveShadow>
                            <boxGeometry args={[0.02, 2.4, 0.6]} />
                            <meshStandardMaterial color={cabinetColor} />
                            </mesh>

                        {/* Storage shelves */}
                        <mesh position={[0, 0.4, 0]} receiveShadow>
                            <boxGeometry args={[0.95, 0.03, 0.55]} />
                            <meshStandardMaterial color={internalStorageColor?.color || '#ffffff'} />
                        </mesh>
                        <mesh position={[0, 1.0, 0]} receiveShadow>
                            <boxGeometry args={[0.95, 0.03, 0.55]} />
                            <meshStandardMaterial color={internalStorageColor?.color || '#ffffff'} />
                        </mesh>
                        <mesh position={[0, 1.6, 0]} receiveShadow>
                            <boxGeometry args={[0.95, 0.03, 0.55]} />
                            <meshStandardMaterial color={internalStorageColor?.color || '#ffffff'} />
                        </mesh>
                        <mesh position={[0, 2.2, 0]} receiveShadow>
                            <boxGeometry args={[0.95, 0.03, 0.55]} />
                            <meshStandardMaterial color={internalStorageColor?.color || '#ffffff'} />
                                </mesh>
                    </group>
                );

            case 3: // Double Door Wardrobe
            default:
                return (
                    <group position={basePosition}>
                        {/* Base structure */}
                        <mesh position={[0, 0, 0]} receiveShadow>
                            <boxGeometry args={[1, 0.02, 0.6]} />
                            <meshStandardMaterial color={cabinetColor} />
                        </mesh>
                        
                        {/* Top */}
                        <mesh position={[0, 2.38, 0]} receiveShadow>
                            <boxGeometry args={[1, 0.02, 0.6]} />
                            <meshStandardMaterial color={cabinetColor} />
                                </mesh>
                        
                        {/* Back */}
                        <mesh position={[0, 1.2, -0.3]} receiveShadow>
                            <boxGeometry args={[1, 2.4, 0.02]} />
                            <meshStandardMaterial color={cabinetColor} />
                                </mesh>
                        
                        {/* Sides */}
                        <mesh position={[-0.49, 1.2, 0]} receiveShadow>
                            <boxGeometry args={[0.02, 2.4, 0.6]} />
                            <meshStandardMaterial color={cabinetColor} />
                        </mesh>
                        <mesh position={[0.49, 1.2, 0]} receiveShadow>
                            <boxGeometry args={[0.02, 2.4, 0.6]} />
                            <meshStandardMaterial color={cabinetColor} />
                                </mesh>
                        
                        {/* Center divider */}
                        <mesh position={[0, 1.2, 0]} receiveShadow>
                            <boxGeometry args={[0.02, 2.4, 0.58]} />
                            <meshStandardMaterial color={cabinetColor} />
                        </mesh>
                        
                        {/* Left door */}
                        {renderDoorPanel([-0.24, 1.2, 0.31], [0.47, 2.37, 0.02])}
                        
                        {/* Right door */}
                        {renderDoorPanel([0.24, 1.2, 0.31], [0.47, 2.37, 0.02])}
                        
                        {/* Handles */}
                        {handleType !== 'none' && (
                            <>
                                {/* Left door handle */}
                                {createHandle([-0.15, 1.2, 0.33])}
                                
                                {/* Right door handle */}
                                {createHandle([0.15, 1.2, 0.33])}
                                </>
                            )}

                        {/* Internal Storage if cabinet option is selected */}
                            {cabinetOption === 'cabinet-layout' && (
                            <group rotation={rotation}>
                                        {renderInternalStorage()}
                                    </group>
                        )}
                    </group>
                );
        }
    };

    // Return the model with proper rotation and scaling
    return (
        <group rotation={rotation} scale={[1, scale, 1]} position={[0, height/2, 0]}>
            {renderModel()}
        </group>
    );
};

export default WardrobeModel;

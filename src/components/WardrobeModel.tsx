import React, { useMemo } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader";

interface ColorOption {
    color?: string;
    texture?: string;
    isMetallic?: boolean;
}

interface WardrobeModelProps {
    modelType: number;
    handleType?: 'none' | 'straight' | 'fancy' | 'spherical';
    isActive?: boolean;
    height?: number;
    color?: ColorOption;  // Update to use ColorOption type
    handleColor?: ColorOption;  // Update to use ColorOption type
    handlePosition?: 'left' | 'right';
}

const WardrobeModel = ({ modelType, handleType = 'straight', isActive = false, height = 2.4, color, handleColor, handlePosition = 'right' }: WardrobeModelProps) => {
    // Load all textures unconditionally at the top level
    const woodTexture = useLoader(TextureLoader, '/textures/wood.jpg');
    const metalTexture = useLoader(TextureLoader, '/textures/metal.jpg');
    const colorTexture = useLoader(TextureLoader, color?.texture || '/textures/wood.jpg');
    const handleColorTexture = useLoader(TextureLoader, handleColor?.texture || '/textures/metal.jpg');

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
        roughness: 0.2,
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

    const createHandle = (defaultPosition: [number, number, number]) => {
        const [x, y, z] = defaultPosition;
        // Reduce the offset for left position by using a smaller multiplier
        const handleX = handlePosition === 'left' ? -(x * 0.5) : x; // Reduced from -x to -(x * 0.6)

        switch (handleType) {
            case 'none':
                return null;
            
            case 'straight':
                return (
                    <group position={[handleX, y, z]}>
                        <mesh material={currentHandleMaterial} position={[-0.1, 0, 0.31]}>
                            <boxGeometry args={[0.08, 0.4, 0.08]} />
                        </mesh>
                    </group>
                );
            
            case 'fancy':
                return (
                    <group position={[handleX, y, z]}>
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
                    <group position={[handleX, y, z]}>
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

    // Update the renderModel function to include lighting
    const renderModel = () => {
        // Calculate floor position correctly
        const floorPosition = -(height / 2); // Base position at floor level

        switch (modelType) {
            case 1: // Single Door Wardrobe (full height)
                return (
                    <group rotation={[0, Math.PI, 0]} position={[0, floorPosition + 1.2, 0]}>
                        <mesh material={wardrobeMaterial}>
                            <boxGeometry args={[1, 2.4, 0.6]} />
                        </mesh>
                        {/* Door */}
                        <mesh position={[0.49, 0, 0]} material={wardrobeMaterial}>
                            <boxGeometry args={[0.02, 2.35, 0.55]} />
                        </mesh>
                        {handleType !== 'none' && createHandle([0.5, 0, 0])}
                        {isActive && <mesh material={outlineMaterial} scale={[1.02, 1.02, 1.02]}>
                            <boxGeometry args={[1, 2.4, 0.6]} />
                        </mesh>}
                    </group>
                );

            case 2: // Storage Block
                return (
                    <group rotation={[0, Math.PI, 0]}>
                        {/* Main Storage Block - positioned at bottom */}
                        <mesh 
                            material={wardrobeMaterial} 
                            position={[0, -(height/2) + 0.4, 0]} // Position at bottom of wall
                        >
                            <boxGeometry args={[1, 0.8, 0.6]} /> {/* Width, Height, Depth */}
                        </mesh>

                        {/* Active state outline */}
                        {isActive && (
                            <mesh 
                                material={outlineMaterial} 
                                position={[0, -(height/2) + 0.4, 0]}
                                scale={[1.02, 1.02, 1.02]}
                            >
                                <boxGeometry args={[1, 0.8, 0.6]} />
                            </mesh>
                        )}
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

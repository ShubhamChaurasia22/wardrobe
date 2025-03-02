import React from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader";

interface WardrobeModelProps {
    modelType: number;
    handleType?: 'none' | 'straight' | 'fancy' | 'spherical';
    isActive?: boolean;
}

const WardrobeModel = ({ modelType, handleType = 'straight', isActive = false }: WardrobeModelProps) => {
    const woodTexture = useLoader(TextureLoader, '/textures/wood.jpg');
    const metalTexture = useLoader(TextureLoader, '/textures/metal.jpg');

    const woodMaterial = new THREE.MeshStandardMaterial({
        map: woodTexture,
        metalness: 0.2,
        roughness: 0.8,
        color: 0xA0522D  // Add a base color to make wood more visible
    });

    const handleMaterial = new THREE.MeshStandardMaterial({
        map: metalTexture,
        metalness: 0.8,
        roughness: 0.2,
        color: 0x888888
    });

    // Add outline material for active wardrobe
    const outlineMaterial = new THREE.MeshBasicMaterial({
        color: '#e38c6e',
        wireframe: true
    });

    // Add border material
    const borderMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.5,    // Increased metalness
        roughness: 0.3,    // Decreased roughness
        emissive: 0x111111 // Add slight emissive effect
    });

    // Add shadow material
    const shadowMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.3,      // Increased opacity
        side: THREE.DoubleSide // Show shadow on both sides
    });

    const createHandle = (position: [number, number, number]) => {
        switch (handleType) {
            case 'none':
                return null;
            
            case 'straight':
                return (
                    <group position={position}>
                        <mesh material={handleMaterial} position={[-0.1, 0, 0.31]}>
                            <boxGeometry args={[0.08, 0.4, 0.08]} />
                        </mesh>
                    </group>
                );
            
            case 'fancy':
                return (
                    <group position={position}>
                        <mesh material={handleMaterial} position={[-0.1, 0, 0.31]}>
                            <boxGeometry args={[0.08, 0.4, 0.08]} />
                        </mesh>
                        <mesh position={[-0.1, 0.2, 0.31]} material={handleMaterial}>
                            <boxGeometry args={[0.15, 0.04, 0.15]} />
                        </mesh>
                        <mesh position={[-0.1, -0.2, 0.31]} material={handleMaterial}>
                            <boxGeometry args={[0.15, 0.04, 0.15]} />
                        </mesh>
                        <mesh position={[-0.1, 0, 0.35]} material={handleMaterial}>
                            <sphereGeometry args={[0.06, 16, 16]} />
                        </mesh>
                    </group>
                );
            
            case 'spherical':
                return (
                    <group position={position}>
                        <group rotation={[Math.PI/2, 0, 0]} position={[-0.1, 0, 0.31]}>
                            <mesh material={handleMaterial}>
                                <cylinderGeometry args={[0.03, 0.03, 0.4, 16]} />
                            </mesh>
                        </group>
                        <mesh position={[-0.1, 0.2, 0.31]} material={handleMaterial}>
                            <sphereGeometry args={[0.06, 16, 16]} />
                        </mesh>
                        <mesh position={[-0.1, -0.2, 0.31]} material={handleMaterial}>
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
        switch (modelType) {
            case 1: // Single Door Wardrobe (full height)
                return (
                    <group rotation={[0, Math.PI, 0]}>
                        {/* Main Frame */}
                        <mesh material={woodMaterial}>
                            <boxGeometry args={[1, 2.4, 0.6]} />
                        </mesh>
                        {/* Door */}
                        <mesh position={[0.49, 0, 0]} material={woodMaterial}>
                            <boxGeometry args={[0.02, 2.35, 0.55]} />
                        </mesh>
                        {createHandle([0.5, 0, 0])}
                        {isActive && <mesh material={outlineMaterial} scale={[1.02, 1.02, 1.02]}>
                            <boxGeometry args={[1, 2.4, 0.6]} />
                        </mesh>}
                    </group>
                );

            case 2: // Storage Block (1/3rd height)
                return (
                    <group rotation={[0, Math.PI, 0]} position={[0, -0.8, 0]}>
                        {/* Main Block */}
                        <mesh material={woodMaterial}>
                            <boxGeometry args={[1, 0.8, 0.6]} /> {/* Fixed height to 0.8 */}
                        </mesh>
                        {isActive && <mesh material={outlineMaterial} scale={[1.02, 1.02, 1.02]}>
                            <boxGeometry args={[1, 0.8, 0.6]} /> {/* Fixed height to 0.8 */}
                        </mesh>}
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

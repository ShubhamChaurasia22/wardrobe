import React, { useState, useEffect } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { LayoutConfig, WallSection } from "../types";
import WardrobeModel from "./WardrobeModel";

interface RoomProps {
    width: number;
    length: number;
    height: number;
    view: string;
    stage: "size" | "wardrobe" | "style" | "preview";
    selectedModel: number | null;
    layoutConfig: LayoutConfig;
    onAddWardrobe: (wall: keyof LayoutConfig, index: number) => void;
    activeWardrobe: { wall: keyof LayoutConfig; index: number; } | null;
    setActiveWardrobe: (wardrobe: { wall: keyof LayoutConfig; index: number; } | null) => void;
}

interface HighlightedSection {
    wall: keyof LayoutConfig;
    index: number;
}

// Function to check if a material should be transparent
// function isTransparentMaterial(material: THREE.Material | THREE.Material[]): boolean {
//     if (Array.isArray(material)) {
//         return material.some(m => m.transparent);
//     }
//     return material.transparent;
// }

const Room = ({ 
    width, 
    length, 
    height, 
    view, 
    stage, 
    selectedModel, 
    layoutConfig, 
    onAddWardrobe,
    activeWardrobe,
    setActiveWardrobe 
}: RoomProps) => {
    const [highlightedSection, setHighlightedSection] = useState<HighlightedSection | null>(null);
    
    // Comment out unused state
    // const [mainMaterial, setMainMaterial] = useState<THREE.MeshStandardMaterial>(
    //     new THREE.MeshStandardMaterial({ color: "#f5f5f5" })
    // );

    // Comment out unused material declarations
    // const wallMaterial = new THREE.MeshStandardMaterial({
    //     color: "#e0e0e0",
    //     side: THREE.DoubleSide
    // });

    // Log props on mount and when they change
    useEffect(() => {
        console.log("Room component props:", { 
            width, length, height, view, stage, 
            selectedModel, 
            layoutConfig: JSON.stringify(layoutConfig).substring(0, 100) + "...",
            activeWardrobe 
        });
    }, [width, length, height, view, stage, selectedModel, layoutConfig, activeWardrobe]);
    
    // Wall thickness
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const WALL_THICKNESS = 0.1;
    
    // Clean white materials
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const whiteMaterial = new THREE.MeshStandardMaterial({ 
        color: "#ffffff",
        roughness: 0.1,
        metalness: 0.0,
    });
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: "#ffffff",
        roughness: 0.1,
        metalness: 0.0,
    });

    // Function to get position for a wall section
    const getWallSectionPosition = (wall: keyof LayoutConfig, index: number, totalSections: number): [number, number, number] => {
        const sectionWidth = wall === 'backWall' ? width / totalSections : length / totalSections;
        const sectionOffset = sectionWidth * (index + 0.5);

        switch (wall) {
            case 'leftWall':
                return [-width/2, 0, -length/2 + sectionOffset];
            case 'rightWall':
                return [width/2, 0, -length/2 + sectionOffset];
            case 'backWall':
                return [-width/2 + sectionOffset, 0, -length/2];
            default:
                return [0, 0, 0];
        }
    };

    // Function to handle wall click to add wardrobe
    const handleWallClick = (
        wall: "leftWall" | "rightWall" | "backWall", 
        index: number, 
        e: ThreeEvent<any> | React.MouseEvent<HTMLDivElement>
    ) => {
        // Prevent event from bubbling up to higher elements
        if ('stopPropagation' in e) {
            e.stopPropagation();
        }
        
        console.log(`Wall clicked: ${wall}, index ${index}, stage: ${stage}, selectedModel: ${selectedModel}`);
        
        if (stage === "wardrobe" || stage === "style") {
            if (selectedModel !== null) {
                // If we have a selected model, add it directly
                onAddWardrobe(wall, index);
            } else {
                // Otherwise, just highlight this section
                setHighlightedSection({ wall, index });
            }
        }
    };
    
    // Function to render wall buttons for adding wardrobes
    const renderWallButtons = (
        wall: "leftWall" | "rightWall" | "backWall", 
        numSections: number
    ) => {
        // Only show buttons for the wall that matches the current view, never in orbit view
        const currentWallView = wall.replace("Wall", "");
        if (view !== currentWallView) {
            return [];
        }

        const buttons = [];
        const wallSections = layoutConfig[wall] as WallSection[] || [];
        
        for (let i = 0; i < numSections; i++) {
            const section = wallSections[i];
            
            if (section && (section.type === "free-space" || section.type === "button")) {
                // Calculate button position based on wall type
                let position: [number, number, number] = [0, 0, 0];
                const sectionWidth = wall === "backWall" ? width / numSections : length / numSections;
                const offset = sectionWidth * (i + 0.5);
                
                // Position buttons at eye level height (middle of the wall)
                const buttonHeight = height / 2; // Centered vertically on the wall
                
                if (wall === "leftWall") {
                    // Position buttons slightly outside the left wall
                    position = [-width/2 - 0.1, buttonHeight, -length/2 + offset];
                } else if (wall === "rightWall") {
                    // Position buttons slightly outside the right wall
                    position = [width/2 + 0.1, buttonHeight, -length/2 + offset];
                } else { // backWall
                    // Position buttons slightly outside the back wall
                    position = [-width/2 + offset, buttonHeight, -length/2 - 0.1];
                }
                
                // Apply rotation to make + icons face correctly for each wall
                let rotation: [number, number, number] = [0, 0, 0];
                if (wall === "leftWall") {
                    rotation = [0, Math.PI / 2, 0]; // Rotate 90 degrees around Y axis for left wall
                } else if (wall === "rightWall") {
                    rotation = [0, -Math.PI / 2, 0]; // Rotate -90 degrees around Y axis for right wall
                }
                
                buttons.push(
                    <Html
                        key={`${wall}-button-${i}`}
                        position={position}
                        distanceFactor={10}
                        zIndexRange={[9999, 0]}
                        transform
                        rotation={rotation}
                        occlude={false}
                    >
                        <div 
                            className="add-wardrobe-button"
                            onClick={(e) => {
                                console.log(`Button clicked: ${wall}, index ${i}, position:`, position);
                                e.stopPropagation();
                                handleWallClick(wall, i, e);
                            }}
                        >
                            +
                        </div>
                    </Html>
                );
            }
        }
        return buttons;
    };

    // Function to check if a wardrobe at this position is a double door wardrobe
    // Comment out unused function
    /* 
    const isDoubleDoorWardrobe = (
        wall: "leftWall" | "rightWall" | "backWall", 
        index: number
    ): boolean => {
        const section = layoutConfig[wall][index];
        return section && section.type === "wardrobe" && section.modelType === 3;
    };
    */

    // Function to determine the rotation of a wall
    const getWallRotation = (wall: keyof LayoutConfig): [number, number, number] => {
        switch (wall) {
            case 'leftWall':
                return [0, Math.PI / 2, 0]; // 90 degrees around Y axis
            case 'rightWall':
                return [0, -Math.PI / 2, 0]; // -90 degrees around Y axis
            case 'backWall':
                return [0, 0, 0]; // No rotation
            default:
                return [0, 0, 0];
        }
    };

    useEffect(() => {
        if (selectedModel !== null && highlightedSection) {
            onAddWardrobe(highlightedSection.wall, highlightedSection.index);
            setHighlightedSection(null);
        }
    }, [selectedModel, highlightedSection, onAddWardrobe]);

    const handleWardrobeClick = (wall: "leftWall" | "rightWall" | "backWall", index: number) => {
        console.log("Wardrobe clicked:", wall, index);
        
        // Toggle active wardrobe - if clicking the same one, deselect it
        if (activeWardrobe && activeWardrobe.wall === wall && activeWardrobe.index === index) {
            setActiveWardrobe(null);
        } else {
        setActiveWardrobe({ wall, index });
        }
    };

    // Create the room with thick walls as shown in the image
    const createRoom = (): React.ReactElement => {
        // Increase wall thickness for more substantial appearance
        const WALL_THICKNESS = 0.15;
        
        // Small overlap to prevent gaps at joints
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const OVERLAP = 0.01;

    return (
        <>
                {/* Left Wall - hide when viewing right wall */}
            {view !== "right" && (
                        <mesh 
                            position={[-(width/2), height/2, 0]} 
                            receiveShadow 
                            castShadow
                        >
                            <boxGeometry args={[WALL_THICKNESS, height, length]} />
                            <meshStandardMaterial 
                                color="#ffffff"
                                roughness={0.35}
                                metalness={0.05}
                                side={THREE.DoubleSide}
                            />
                        </mesh>
                    )}
                    
                    {/* Right Wall - hide when viewing left wall */}
                {view !== "left" && (
                        <mesh 
                            position={[width/2, height/2, 0]} 
                            receiveShadow 
                            castShadow
                        >
                            <boxGeometry args={[WALL_THICKNESS, height, length]} />
                            <meshStandardMaterial 
                                color="#ffffff"
                                roughness={0.35}
                                metalness={0.05}
                                side={THREE.DoubleSide}
                            />
                        </mesh>
                    )}
                    
                    {/* Back Wall - always visible */}
                    <mesh 
                        position={[0, height/2, -(length/2)]} 
                        receiveShadow 
                        castShadow
                    >
                        <boxGeometry args={[width, height, WALL_THICKNESS]} />
                        <meshStandardMaterial 
                            color="#ffffff"
                            roughness={0.35}
                            metalness={0.05}
                            side={THREE.DoubleSide}
                        />
                    </mesh>

                    {/* Invisible floor for shadow receiving only */}
                    <mesh 
                        rotation={[-Math.PI / 2, 0, 0]} 
                        position={[0, 0, 0]} 
                        receiveShadow
                    >
                        <planeGeometry args={[width + WALL_THICKNESS*2, length + WALL_THICKNESS*2]} />
                        <meshStandardMaterial 
                            transparent
                            opacity={0}
                            side={THREE.DoubleSide}
                            roughness={0.8}
                        />
                    </mesh>

                    {/* Enhanced lighting setup */}
                    <ambientLight intensity={0.2} /> 
                    
                    {/* Main directional light for primary shadows */}
                    <directionalLight 
                        position={[5, 8, 5]} 
                        intensity={1.0} 
                        castShadow
                        shadow-mapSize-width={2048}
                        shadow-mapSize-height={2048}
                        shadow-camera-far={50}
                        shadow-camera-left={-15}
                        shadow-camera-right={15}
                        shadow-camera-top={15}
                        shadow-camera-bottom={-15}
                        shadow-bias={-0.0005}
                    />
                    
                    {/* Secondary directional light for softer fill */}
                    <directionalLight 
                        position={[-4, 6, -4]} 
                        intensity={0.5} 
                        castShadow
                        shadow-mapSize-width={1024}
                        shadow-mapSize-height={1024}
                    />
                    
                    {/* Hemisphere light for ambient fill */}
                    <hemisphereLight 
                        color="#ffffff"
                        groundColor="#f0f0f0"
                        intensity={0.3}
                    />
                </>
            );
        };

    const renderWardrobes = () => {
        const elements: React.ReactElement[] = [];
        
        // Process all walls and render the wardrobe models
        Object.entries(layoutConfig).forEach(([wall, sections]) => {
            if (wall === 'roomDetails') return; // Skip roomDetails, it's not a wall
            
            const wallKey = wall as "leftWall" | "rightWall" | "backWall";
            
            // Skip walls that should not be shown in the current view 
            // (except orbit view which shows all walls)
            if (view !== "orbit") {
                const currentViewWall = `${view}Wall`;
                if (wallKey !== currentViewWall) {
                    return; // Skip this wall if it's not the one being viewed
                }
            }
            
            const wallSections = sections as WallSection[];
            
            wallSections.forEach((section, idx) => {
                if (section.type === "wardrobe") {
                    // Get the position for this wall section
                    const position = getWallSectionPosition(wallKey, idx, wallSections.length);
                    
                    // Generate a unique key for this wardrobe
                    const wardrobeKey = `wardrobe-${wall}-${idx}`;
                    
                    // Check if this is the active wardrobe
                    const isActiveWardrobe = !!(activeWardrobe && 
                        activeWardrobe.wall === wallKey && 
                        activeWardrobe.index === idx);
                    
                    // Add the wardrobe model at the calculated position with correct rotation
                    elements.push(
                    <group
                            key={wardrobeKey} 
                            position={position}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleWardrobeClick(wallKey, idx);
                            }}
                    >
                        <WardrobeModel 
                                modelType={section.modelType || 1}
                                height={2.4} // Fixed height for wardrobe
                            handleType={section.handleType}
                                isActive={isActiveWardrobe}
                                color={section.color}
                                handleColor={section.handleColor}
                                handlePosition={section.handlePosition}
                                cabinetOption={section.cabinetOption}
                                internalStorage={section.internalStorage}
                                wallPosition={wallKey}
                                internalStorageColor={section.internalStorageColor}
                                storagePosition={section.storagePosition}
                                doorStyle={section.doorStyle}
                        />
                    </group>
                    );
                }
            });
        });
        
        return elements;
    };

    const renderActiveWardrobeHighlight = () => {
        if (!activeWardrobe) return null;
        
        const { wall, index } = activeWardrobe;
        const wallSections = layoutConfig[wall] as WallSection[];
        const section = wallSections[index];
        
        if (!section || section.type !== "wardrobe") return null;
        
        // Calculate position based on the active wardrobe's location
        const position = getWallSectionPosition(wall, index, wallSections.length);
        const rotation = getWallRotation(wall);
        
        // Determine width based on wardrobe type (double doors are wider)
        const isDoubleDoor = (section.modelType !== undefined && section.modelType === 3) || section.isDoubleDoor === true;
        const highlightWidth = isDoubleDoor ? 1.0 : 0.6; // Reduced from 1.2/1 to 1.0/0.6
        
        // Calculate the z-position to ensure the highlight is visible from the front
        let zPosition = 0.03; // Small offset to prevent z-fighting with floor
        
        // Use position to create the highlight just above the floor
        return (
            <mesh
                position={[position[0], zPosition, position[2]]} 
                rotation={[Math.PI / 2, 0, rotation[1]]} // Flat on floor with correct orientation
            >
                <planeGeometry args={[highlightWidth, 0.3]} /> {/* Thinner: changed from 0.6 to 0.3 */}
                <meshBasicMaterial color="#e74c3c" transparent opacity={0.7} /> {/* Increased opacity from 0.5 to 0.7 */}
            </mesh>
        );
    };

    return (
        <>
            {/* Room structure */}
            {createRoom()}
            
            {/* Active wardrobe highlight */}
            {renderActiveWardrobeHighlight()}
            
            {/* Render wardrobe add buttons based on stage */}
            {(stage === "wardrobe" || stage === "style") && (
                <>
                    {renderWallButtons("leftWall", layoutConfig.leftWall?.length || 0)}
                    {renderWallButtons("rightWall", layoutConfig.rightWall?.length || 0)}
                    {renderWallButtons("backWall", layoutConfig.backWall?.length || 0)}
                </>
            )}

            {/* Render wardrobes for all walls */}
            {renderWardrobes()}
        </>
    );
};

export default Room;
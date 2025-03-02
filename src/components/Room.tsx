import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import WardrobeModel from "./WardrobeModel";

type WallSection = {
    width: number;
    type: string;
    modelType?: number;
    handleType?: 'none' | 'straight' | 'fancy' | 'spherical';
};

type LayoutConfig = {
    roomDetails: {
        length: number;
        width: number;
        height: number;
    };
    leftWall: WallSection[];
    backWall: WallSection[];
    rightWall: WallSection[];
};

interface RoomProps {
    width: number;
    length: number;
    height: number;
    view: string;
    stage: string;
    selectedModel: number | null;
    layoutConfig: LayoutConfig;
    onAddWardrobe: (wall: keyof LayoutConfig, index: number) => void;
    activeWardrobe: { wall: keyof LayoutConfig; index: number; } | null;
    setActiveWardrobe: (wardrobe: { wall: keyof LayoutConfig; index: number; } | null) => void;
}

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
    const [highlightedSection, setHighlightedSection] = useState<{ wall: keyof LayoutConfig; index: number } | null>(null);

    const material = new THREE.MeshStandardMaterial({ color: "white", side: THREE.DoubleSide });

    const renderWallButtons = (wall: 'leftWall' | 'rightWall' | 'backWall', wallWidth: number, wallHeight: number) => {
        const buttons = [];
        const numButtons = layoutConfig[wall].length;
        const buttonWidth = wallWidth / numButtons;

        for (let i = 0; i < numButtons; i++) {
            const isHighlighted = highlightedSection && highlightedSection.wall === wall && highlightedSection.index === i;
            const section = layoutConfig[wall][i];
            const isMounted = section.type !== "free-space";
            const isExtension = section.type === "wardrobe-extension";

            // Don't render button for wardrobe extensions
            if (!isExtension) {
                buttons.push(
                    <mesh
                        key={`${wall}-${i}`}
                        position={[buttonWidth * (i + 0.5) - wallWidth / 2, 0, 0]}
                        onClick={() => !isMounted && setHighlightedSection({ wall, index: i })}
                    >
                        <planeGeometry args={[buttonWidth, wallHeight]} />
                        <meshStandardMaterial color={isHighlighted ? "yellow" : "transparent"} />
                        <Html>
                            <div style={{ width: `${buttonWidth}px`, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {!isMounted && (
                                    <button 
                                        className="add-wardrobes" 
                                        style={{ width: "20px", height: "20px", border: "none", cursor: "pointer" }} 
                                        onClick={() => onAddWardrobe(wall, i)}
                                        disabled={selectedModel === 2 && i === numButtons - 1} // Disable last button for double door
                                    >
                                        +
                                    </button>
                                )}
                            </div>
                        </Html>
                    </mesh>
                );
            }
        }

        return buttons;
    };

    useEffect(() => {
        if (selectedModel !== null && highlightedSection) {
            onAddWardrobe(highlightedSection.wall, highlightedSection.index);
            setHighlightedSection(null);
        }
    }, [selectedModel, highlightedSection, onAddWardrobe]);

    const getWallSectionPosition = (wall: keyof LayoutConfig, index: number, totalSections: number): [number, number, number] => {
        const sectionWidth = wall === 'backWall' ? width / totalSections : length / totalSections;
        const offset = (index + 0.5) * sectionWidth - (wall === 'backWall' ? width / 2 : length / 2);

        switch (wall) {
            case 'leftWall':
                return [-width / 2, height / 2, offset];
            case 'rightWall':
                return [width / 2, height / 2, offset];
            case 'backWall':
                return [offset, height / 2, -length / 2];
            default:
                return [0, 0, 0];
        }
    };

    const handleWardrobeClick = (wall: keyof LayoutConfig, index: number) => {
        setActiveWardrobe({ wall, index });
    };

    return (
        <>
            {/* Left Wall and its wardrobes */}
            {view !== "right" && (
                <>
                    <mesh position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
                        <planeGeometry args={[length, height]} />
                        <meshStandardMaterial {...material} />
                        {stage === "style" && view === "left" && renderWallButtons("leftWall", length, height)}
                    </mesh>
                    {layoutConfig.leftWall.map((section: WallSection, index: number) =>
                        section.type === "wardrobe" ? (
                            <group
                                key={`leftWall-${index}`}
                                position={getWallSectionPosition('leftWall', index, layoutConfig.leftWall.length)}
                                rotation={[0, -Math.PI / 2, 0]}
                                onClick={() => handleWardrobeClick('leftWall', index)}
                            >
                                <WardrobeModel 
                                    modelType={section.modelType ?? 0} 
                                    handleType={section.handleType}
                                    isActive={activeWardrobe?.wall === 'leftWall' && activeWardrobe?.index === index}
                                />
                            </group>
                        ) : null
                    )}
                </>
            )}

            {/* Right Wall and its wardrobes */}
            {view !== "left" && (
                <>
                    <mesh position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
                        <planeGeometry args={[length, height]} />
                        <meshStandardMaterial {...material} />
                        {stage === "style" && view === "right" && renderWallButtons("rightWall", length, height)}
                    </mesh>
                    {layoutConfig.rightWall.map((section: WallSection, index: number) =>
                        section.type === "wardrobe" ? (
                            <group
                                key={`rightWall-${index}`}
                                position={getWallSectionPosition('rightWall', index, layoutConfig.rightWall.length)}
                                rotation={[0, Math.PI / 2, 0]}
                                onClick={() => handleWardrobeClick('rightWall', index)}
                            >
                                <WardrobeModel 
                                    modelType={section.modelType ?? 0} 
                                    handleType={section.handleType}
                                    isActive={activeWardrobe?.wall === 'rightWall' && activeWardrobe?.index === index}
                                />
                            </group>
                        ) : null
                    )}
                </>
            )}

            {/* Back Wall and its wardrobes */}
            <mesh position={[0, height / 2, -length / 2]}>
                <planeGeometry args={[width, height]} />
                <meshStandardMaterial {...material} />
                {stage === "style" && view === "back" && renderWallButtons("backWall", width, height)}
            </mesh>
            {layoutConfig.backWall.map((section: WallSection, index: number) =>
                section.type === "wardrobe" ? (
                    <group
                        key={`backWall-${index}`}
                        position={getWallSectionPosition('backWall', index, layoutConfig.backWall.length)}
                        rotation={[0, Math.PI, 0]}
                        onClick={() => handleWardrobeClick('backWall', index)}
                    >
                        <WardrobeModel 
                            modelType={section.modelType ?? 0} 
                            handleType={section.handleType}
                            isActive={activeWardrobe?.wall === 'backWall' && activeWardrobe?.index === index}
                        />
                    </group>
                ) : null
            )}

            {/* Floor */}
            <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[width, length]} />
                <meshStandardMaterial color="gray" side={THREE.DoubleSide} />
            </mesh>
        </>
    );
};

export default Room;
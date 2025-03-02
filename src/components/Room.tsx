import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";

const Room = ({ width, length, height, view, stage, selectedModel }: { width: number; length: number; height: number; view: string; stage: string; selectedModel: number | null }) => {
    const [highlightedSection, setHighlightedSection] = useState<{ wall: string; index: number } | null>(null);
    const [mountedModels, setMountedModels] = useState<{ wall: string; index: number; modelType: number }[]>([]);

    const material = new THREE.MeshStandardMaterial({ color: "white", side: THREE.DoubleSide });

    const renderWallButtons = (wall: string, wallWidth: number, wallHeight: number) => {
        const buttons = [];
        const numButtons = 5;
        const buttonWidth = wallWidth / numButtons;

        for (let i = 0; i < numButtons; i++) {
            const isHighlighted = highlightedSection && highlightedSection.wall === wall && highlightedSection.index === i;
            const isMounted = mountedModels.some(model => model.wall === wall && model.index === i);

            buttons.push(
                <mesh
                    key={`${wall}-${i}`}
                    position={[buttonWidth * (i + 0.5) - wallWidth / 2, 0, 0]} // Positioning in the middle of the wall height
                    onClick={() => !isMounted && setHighlightedSection({ wall, index: i })}
                >
                    <planeGeometry args={[buttonWidth, wallHeight]} />
                    <meshStandardMaterial color={isHighlighted ? "yellow" : "transparent"} />
                    <Html>
                        <div style={{ width: `${wallWidth / numButtons}px`, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #000" }}>
                            {!isMounted && (
                                <button className="add-wardrobes" style={{ width: "20px", height: "20px", border: "none", cursor: "pointer" }}>+</button>
                            )}
                        </div>
                    </Html>
                </mesh>
            );
        }

        return buttons;
    };

    useEffect(() => {
        if (selectedModel !== null && highlightedSection) {
            setMountedModels((prev) => [...prev, { wall: highlightedSection.wall, index: highlightedSection.index, modelType: selectedModel }]);
            setHighlightedSection(null);
        }
    }, [selectedModel, highlightedSection]);

    return (
        <>
            {view !== "right" && (
                <mesh position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <planeGeometry args={[length, height]} />
                    <meshStandardMaterial {...material} />
                    {stage === "style" && view === "left" && renderWallButtons("left", length, height)}
                </mesh>
            )}

            {view !== "left" && (
                <mesh position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
                    <planeGeometry args={[length, height]} />
                    <meshStandardMaterial {...material} />
                    {stage === "style" && view === "right" && renderWallButtons("right", length, height)}
                </mesh>
            )}

            <mesh position={[0, height / 2, -length / 2]}>
                <planeGeometry args={[width, height]} />
                <meshStandardMaterial {...material} />
                {stage === "style" && view === "back" && renderWallButtons("back", width, height)}
            </mesh>

            <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[width, length]} />
                <meshStandardMaterial color="gray" side={THREE.DoubleSide} />
            </mesh>

            {mountedModels.map((model, index) => (
                <mesh
                    key={index}
                    position={[
                        model.wall === "left" ? -width / 2 : model.wall === "right" ? width / 2 : 0,
                        height / 2,
                        model.wall === "back" ? -length / 2 : 0
                    ]}
                    rotation={[0, model.wall === "left" ? Math.PI / 2 : model.wall === "right" ? -Math.PI / 2 : 0, 0]}
                >
                    <planeGeometry args={[length / 5, height]} />
                    <meshStandardMaterial color="transparent" />
                </mesh>
            ))}
        </>
    );
};

export default Room;

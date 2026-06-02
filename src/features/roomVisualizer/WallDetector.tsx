import React, { useState } from "react";
import { FaCheck } from "react-icons/fa";
import "./RoomVisualizer.css";

const CheckIcon = FaCheck as any;

interface Detection {
    label: string;
    confidence: number;
    bbox: number[];
}

interface WallDetectorProps {
    detections: Detection[];
    onSelectWall: (wall: "leftWall" | "backWall" | "rightWall") => void;
}

const WallDetector: React.FC<WallDetectorProps> = ({ detections, onSelectWall }) => {
    const [selected, setSelected] = useState<"leftWall" | "backWall" | "rightWall" | null>(null);

    // Analyze detections to find if walls are obstructed by windows or doors
    // Left side: xmin < 0.35
    // Center/Back side: xmin >= 0.35 and xmax <= 0.65
    // Right side: xmax > 0.65
    const getWallObstruction = (side: "left" | "center" | "right") => {
        const obstructions = [];
        for (const det of detections) {
            const label = det.label.toLowerCase();
            if (label !== "window" && label !== "door" && label !== "furniture" && label !== "bed" && label !== "sofa") {
                continue;
            }
            
            const [xmin, , xmax, ] = det.bbox;
            const xCenter = (xmin + xmax) / 2.0;
            
            if (side === "left" && xCenter < 0.35) {
                obstructions.push(det.label);
            } else if (side === "center" && xCenter >= 0.35 && xCenter <= 0.65) {
                obstructions.push(det.label);
            } else if (side === "right" && xCenter > 0.65) {
                obstructions.push(det.label);
            }
        }
        return obstructions;
    };

    const leftObstructions = getWallObstruction("left");
    const backObstructions = getWallObstruction("center");
    const rightObstructions = getWallObstruction("right");

    const handleConfirm = () => {
        if (selected) {
            onSelectWall(selected);
        }
    };

    return (
        <div className="wall-detector-container">
            <h2 className="section-title">Select Target Wall</h2>
            <p className="section-description">
                Choose the wall where you want to place the wardrobe. Our AI will automatically evaluate windows and doors to ensure there are no overlapping placements.
            </p>

            <div className="walls-grid">
                {/* Left Wall Card */}
                <div 
                    className={`wall-card ${selected === "leftWall" ? "selected" : ""} ${leftObstructions.length > 0 ? "obstructed" : ""}`}
                    onClick={() => setSelected("leftWall")}
                >
                    <div className="wall-header">
                        <span className="wall-title">Left Wall</span>
                        {selected === "leftWall" && <CheckIcon className="checked-icon" />}
                    </div>
                    <div className="wall-diagram left-diagram">
                        <div className="inner-wall"></div>
                    </div>
                    <div className="wall-status">
                        {leftObstructions.length > 0 ? (
                            <div className="obstruction-alert">
                                <span>Blocked by:</span>
                                <div className="obs-tags">
                                    {leftObstructions.map((obs, idx) => (
                                        <span key={idx} className="obs-tag">{obs}</span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <span className="status-clear">Clear Space Available</span>
                        )}
                    </div>
                </div>

                {/* Back Wall Card */}
                <div 
                    className={`wall-card ${selected === "backWall" ? "selected" : ""} ${backObstructions.length > 0 ? "obstructed" : ""}`}
                    onClick={() => setSelected("backWall")}
                >
                    <div className="wall-header">
                        <span className="wall-title">Back Wall</span>
                        {selected === "backWall" && <CheckIcon className="checked-icon" />}
                    </div>
                    <div className="wall-diagram back-diagram">
                        <div className="inner-wall"></div>
                    </div>
                    <div className="wall-status">
                        {backObstructions.length > 0 ? (
                            <div className="obstruction-alert">
                                <span>Blocked by:</span>
                                <div className="obs-tags">
                                    {backObstructions.map((obs, idx) => (
                                        <span key={idx} className="obs-tag">{obs}</span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <span className="status-clear">Clear Space Available</span>
                        )}
                    </div>
                </div>

                {/* Right Wall Card */}
                <div 
                    className={`wall-card ${selected === "rightWall" ? "selected" : ""} ${rightObstructions.length > 0 ? "obstructed" : ""}`}
                    onClick={() => setSelected("rightWall")}
                >
                    <div className="wall-header">
                        <span className="wall-title">Right Wall</span>
                        {selected === "rightWall" && <CheckIcon className="checked-icon" />}
                    </div>
                    <div className="wall-diagram right-diagram">
                        <div className="inner-wall"></div>
                    </div>
                    <div className="wall-status">
                        {rightObstructions.length > 0 ? (
                            <div className="obstruction-alert">
                                <span>Blocked by:</span>
                                <div className="obs-tags">
                                    {rightObstructions.map((obs, idx) => (
                                        <span key={idx} className="obs-tag">{obs}</span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <span className="status-clear">Clear Space Available</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="action-button-row">
                <button 
                    className="select-wall-confirm-btn" 
                    disabled={!selected}
                    onClick={handleConfirm}
                    type="button"
                >
                    Confirm & Start Placement
                </button>
            </div>
        </div>
    );
};

export default WallDetector;

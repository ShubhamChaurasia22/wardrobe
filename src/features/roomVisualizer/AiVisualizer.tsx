import React, { useState } from "react";
import RoomUpload from "./RoomUpload";
import RoomAnalysis from "./RoomAnalysis";
import WallDetector from "./WallDetector";
import RoomPreview from "./RoomPreview";
import ExportPanel from "./ExportPanel";
import StyleWardrobes from "../../components/StyleWardrobes";
import { ColorOption, InternalStorageType, StoragePosition, DoorStyle } from "../../types";
import "./RoomVisualizer.css";

// API Endpoint configuration
const API_URL = "http://localhost:8000";

type VisualizerStage = "upload" | "analyze" | "select_wall" | "placement" | "export";

const defaultColor: ColorOption = { id: "white", name: "White", color: "#ffffff" };
const defaultHandleColor: ColorOption = { id: "chrome", name: "Chrome", color: "#C0C0C0", isMetallic: true };

const AiVisualizer: React.FC = () => {
    const [stage, setStage] = useState<VisualizerStage>("upload");
    
    // Room details states
    const [fileId, setFileId] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [detections, setDetections] = useState<any[]>([]);
    const [segments, setSegments] = useState<any[]>([]);
    const [depthMap, setDepthMap] = useState<string | null>(null);
    const [geometry, setGeometry] = useState<any | null>(null);
    const [selectedWall, setSelectedWall] = useState<"leftWall" | "backWall" | "rightWall" | null>(null);
    
    // Wardrobe placement coordinates
    const [placement, setPlacement] = useState<{ position: number[]; rotation: number[]; wall_snapped: string } | null>(null);

    // Style and configuration states (reusing configurator options)
    const [modelType, setModelType] = useState<number>(3); // default to double door
    const [selectedHandle, setSelectedHandle] = useState<"none" | "straight" | "fancy" | "spherical">("straight");
    const [selectedWardrobeColor, setSelectedWardrobeColor] = useState<ColorOption>(defaultColor);
    const [selectedHandleColor, setSelectedHandleColor] = useState<ColorOption>(defaultHandleColor);
    const [selectedHandlePosition, setSelectedHandlePosition] = useState<"left" | "right">("right");
    const [selectedDoorStyle, setSelectedDoorStyle] = useState<DoorStyle>("panel-shaker");
    const [selectedCabinetOption, setSelectedCabinetOption] = useState<"none" | "cabinet-layout">("none");
    const [selectedInternalStorage, setSelectedInternalStorage] = useState<InternalStorageType>("long-hanging");
    const [selectedInternalStorageColor, setSelectedInternalStorageColor] = useState<ColorOption>(defaultColor);
    const [selectedStoragePosition, setSelectedStoragePosition] = useState<StoragePosition>("middle");

    const handleUploadSuccess = (
        uploadedId: string,
        filename: string,
        width: number,
        height: number,
        warnings: string[]
    ) => {
        setFileId(uploadedId);
        setImageUrl(`${API_URL}/uploads/${uploadedId}${filename.slice(filename.lastIndexOf("."))}`);
        setStage("analyze");
    };

    const handleAnalysisComplete = (
        dets: any[],
        segs: any[],
        depth: string,
        geom: any
    ) => {
        setDetections(dets);
        setSegments(segs);
        setDepthMap(depth);
        setGeometry(geom);
        setStage("select_wall");
    };

    const handleSelectWall = (wall: "leftWall" | "backWall" | "rightWall") => {
        setSelectedWall(wall);
        
        // Formulate initial placement based on selected wall snapping vector
        let pos = [0.0, 0.0, -2.4]; // default backWall
        let rot = [0.0, 0.0, 0.0];
        
        if (wall === "leftWall") {
            pos = [-2.4, 0.0, 0.0];
            rot = [0.0, Math.PI / 2, 0.0];
        } else if (wall === "rightWall") {
            pos = [2.4, 0.0, 0.0];
            rot = [0.0, -Math.PI / 2, 0.0];
        }
        
        setPlacement({
            position: pos,
            rotation: rot,
            wall_snapped: wall
        });
        
        setStage("placement");
    };

    const handlePlacementChange = (pos: number[], rot: number[]) => {
        if (placement) {
            setPlacement({
                ...placement,
                position: pos,
                rotation: rot
            });
        }
    };

    const handleReset = () => {
        setFileId(null);
        setImageUrl(null);
        setDetections([]);
        setSegments([]);
        setDepthMap(null);
        setGeometry(null);
        setSelectedWall(null);
        setPlacement(null);
        setStage("upload");
    };

    return (
        <div className="room-visualizer-page">
            {/* Step navigation indicator */}
            <div className="visualizer-steps-nav">
                <div className={`step-nav-item ${stage === "upload" ? "active" : ""}`} onClick={() => stage !== "upload" && setStage("upload")}>
                    <span className="step-num">1</span> <span className="step-txt">Upload Photo</span>
                </div>
                <div className={`step-nav-item ${stage === "analyze" ? "active" : ""}`}>
                    <span className="step-num">2</span> <span className="step-txt">AI Analysis</span>
                </div>
                <div className={`step-nav-item ${stage === "select_wall" ? "active" : ""}`}>
                    <span className="step-num">3</span> <span className="step-txt">Select Wall</span>
                </div>
                <div className={`step-nav-item ${stage === "placement" ? "active" : ""}`}>
                    <span className="step-num">4</span> <span className="step-txt">Design & Place</span>
                </div>
                <div className={`step-nav-item ${stage === "export" ? "active" : ""}`}>
                    <span className="step-num">5</span> <span className="step-txt">Download Render</span>
                </div>
            </div>

            <div className="visualizer-content-body">
                {stage === "upload" && (
                    <RoomUpload onUploadSuccess={handleUploadSuccess} apiUrl={API_URL} />
                )}

                {stage === "analyze" && fileId && imageUrl && (
                    <RoomAnalysis 
                        fileId={fileId} 
                        imageUrl={imageUrl} 
                        apiUrl={API_URL} 
                        onAnalysisComplete={handleAnalysisComplete} 
                    />
                )}

                {stage === "select_wall" && detections && (
                    <WallDetector detections={detections} onSelectWall={handleSelectWall} />
                )}

                {stage === "placement" && imageUrl && geometry && selectedWall && placement && (
                    <div className="design-split-workspace">
                        <div className="threejs-preview-container">
                            <RoomPreview 
                                imageUrl={imageUrl}
                                geometry={geometry}
                                selectedWall={selectedWall}
                                initialPlacement={placement}
                                detections={detections}
                                apiUrl={API_URL}
                                fileId={fileId!}
                                modelType={modelType}
                                color={selectedWardrobeColor}
                                handleType={selectedHandle}
                                handleColor={selectedHandleColor}
                                handlePosition={selectedHandlePosition}
                                doorStyle={selectedDoorStyle}
                                cabinetOption={selectedCabinetOption}
                                internalStorage={selectedInternalStorage}
                                internalStorageColor={selectedInternalStorageColor}
                                onPlacementChange={handlePlacementChange}
                            />
                        </div>

                        <div className="style-options-panel">
                            <div className="options-panel-header">
                                <h3>Customize Wardrobe</h3>
                                <button className="style-proceed-btn" onClick={() => setStage("export")} type="button">
                                    Proceed to Export
                                </button>
                            </div>
                            
                            <StyleWardrobes 
                                setStage={() => {}} // dummy because visualizer controls stage transitions
                                onSelectModel={(type) => setModelType(type)}
                                selectedHandle={selectedHandle}
                                setSelectedHandle={(h) => setSelectedHandle(h)}
                                hasActiveWardrobe={true}
                                onSelectWardrobeColor={(c) => setSelectedWardrobeColor(c)}
                                onSelectHandleColor={(hc) => setSelectedHandleColor(hc)}
                                selectedWardrobeColor={selectedWardrobeColor}
                                selectedHandleColor={selectedHandleColor}
                                handlePosition={selectedHandlePosition}
                                setHandlePosition={(p) => setSelectedHandlePosition(p)}
                                cabinetOption={selectedCabinetOption}
                                setCabinetOption={(co) => setSelectedCabinetOption(co)}
                                internalStorage={selectedInternalStorage}
                                setInternalStorage={(is) => setSelectedInternalStorage(is)}
                                selectedInternalStorageColor={selectedInternalStorageColor}
                                onSelectInternalStorageColor={(isc) => setSelectedInternalStorageColor(isc)}
                                onUndo={() => {}}
                                onRedo={() => {}}
                                canUndo={false}
                                canRedo={false}
                                activeWardrobeType={modelType}
                                storagePosition={selectedStoragePosition}
                                setStoragePosition={(sp) => setSelectedStoragePosition(sp)}
                                doorStyle={selectedDoorStyle}
                                setDoorStyle={(ds) => setSelectedDoorStyle(ds)}
                                onBack={() => setStage("select_wall")}
                            />
                        </div>
                    </div>
                )}

                {stage === "export" && fileId && placement && (
                    <ExportPanel 
                        fileId={fileId}
                        apiUrl={API_URL}
                        placement={placement}
                        modelType={modelType}
                        colorHex={selectedWardrobeColor.color}
                        handleStyle={selectedHandle}
                        handleColorHex={selectedHandleColor.color}
                        handlePosition={selectedHandlePosition}
                        doorStyle={selectedDoorStyle}
                        onReset={handleReset}
                    />
                )}
            </div>
        </div>
    );
};

export default AiVisualizer;

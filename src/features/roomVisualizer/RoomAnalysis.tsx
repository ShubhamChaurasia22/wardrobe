import React, { useState, useEffect } from "react";
import { FaRobot, FaCheckCircle, FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";
import "./RoomVisualizer.css";

const RobotIcon = FaRobot as any;
const CheckCircleIcon = FaCheckCircle as any;
const SpinnerIcon = FaSpinner as any;
const EyeIcon = FaEye as any;
const EyeSlashIcon = FaEyeSlash as any;

interface Detection {
    label: string;
    confidence: number;
    bbox: number[]; // [xmin, ymin, xmax, ymax]
}

interface Segment {
    label: string;
    mask_path: string;
}

interface CameraGeometry {
    camera_pitch: number;
    camera_yaw: number;
    camera_roll: number;
    focal_length: number;
    fov: number;
    room_corners_3d?: number[][];
}

interface RoomAnalysisProps {
    fileId: string;
    imageUrl: string;
    apiUrl: string;
    onAnalysisComplete: (detections: Detection[], segments: Segment[], depthMapPath: string, geometry: CameraGeometry) => void;
}

const RoomAnalysis: React.FC<RoomAnalysisProps> = ({ fileId, imageUrl, apiUrl, onAnalysisComplete }) => {
    const [pipelineStage, setPipelineStage] = useState<"idle" | "dino" | "sam2" | "depth" | "done">("idle");
    const [progressText, setProgressText] = useState("");
    const [error, setError] = useState<string | null>(null);

    const [detections, setDetections] = useState<Detection[]>([]);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [depthMap, setDepthMap] = useState<string | null>(null);
    const [geometry, setGeometry] = useState<CameraGeometry | null>(null);
    const [showOverlay, setShowOverlay] = useState(true);

    const runAiPipeline = async () => {
        setError(null);
        try {
            // Stage 1: Grounding DINO
            setPipelineStage("dino");
            setProgressText("Grounding DINO is scanning room walls, windows, doors, and obstacles...");
            
            const detectRes = await fetch(`${apiUrl}/room/detect-room`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ file_id: fileId, confidence_threshold: 0.25 })
            });
            if (!detectRes.ok) throw new Error("Object detection failed.");
            const detectData = await detectRes.json();
            setDetections(detectData.detections);

            // Stage 2: SAM2 Segmentation
            setPipelineStage("sam2");
            setProgressText("SAM2 is isolating pixel boundaries for occlusion matching...");
            
            const segmentRes = await fetch(`${apiUrl}/room/segment-room`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ file_id: fileId, detections: detectData.detections })
            });
            if (!segmentRes.ok) throw new Error("Image segmentation failed.");
            const segmentData = await segmentRes.json();
            setSegments(segmentData.segments);

            // Stage 3: Depth Anything V2
            setPipelineStage("depth");
            setProgressText("Depth Anything V2 is calculating room depth and 3D camera angles...");
            
            const depthRes = await fetch(`${apiUrl}/room/generate-depth`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ file_id: fileId })
            });
            if (!depthRes.ok) throw new Error("Depth estimation failed.");
            const depthData = await depthRes.json();
            setDepthMap(depthData.depth_map_path);
            setGeometry(depthData.geometry);

            setPipelineStage("done");
        } catch (err: any) {
            setError(err.message || "AI Analysis pipeline encountered an error.");
            setPipelineStage("idle");
        }
    };

    useEffect(() => {
        runAiPipeline();
    }, [fileId]);

    const handleProceed = () => {
        if (depthMap && geometry) {
            onAnalysisComplete(detections, segments, depthMap, geometry);
        }
    };

    return (
        <div className="analysis-container">
            <h2 className="section-title">AI Room Analysis</h2>
            <p className="section-description">
                Our AI models are parsing the room structure and calculating spatial boundaries.
            </p>

            <div className="analysis-workspace">
                <div className="media-canvas">
                    <img src={imageUrl} alt="Uploaded Room" className="base-room-img" />
                    
                    {/* Render detections bounding box overlay */}
                    {showOverlay && pipelineStage === "done" && detections.map((det, index) => {
                        const [xmin, ymin, xmax, ymax] = det.bbox;
                        const style = {
                            left: `${xmin * 100}%`,
                            top: `${ymin * 100}%`,
                            width: `${(xmax - xmin) * 100}%`,
                            height: `${(ymax - ymin) * 100}%`
                        };
                        return (
                            <div key={`det-${index}`} className={`bbox-rect ${det.label}`} style={style}>
                                <span className="bbox-label">
                                    {det.label} ({(det.confidence * 100).toFixed(0)}%)
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="analysis-panel">
                    <h3>Analysis Progress</h3>
                    
                    <ul className="progress-steps-list">
                        <li className={pipelineStage === "dino" ? "active" : detections.length > 0 ? "completed" : ""}>
                            {detections.length > 0 ? <CheckCircleIcon className="step-icon-check" /> : pipelineStage === "dino" ? <SpinnerIcon className="spinner step-icon-load" /> : <div className="step-bullet"></div>}
                            <span>Object Detection (Grounding DINO)</span>
                        </li>
                        
                        <li className={pipelineStage === "sam2" ? "active" : segments.length > 0 ? "completed" : ""}>
                            {segments.length > 0 ? <CheckCircleIcon className="step-icon-check" /> : pipelineStage === "sam2" ? <SpinnerIcon className="spinner step-icon-load" /> : <div className="step-bullet"></div>}
                            <span>Image Segmentation (SAM2)</span>
                        </li>
                        
                        <li className={pipelineStage === "depth" ? "active" : depthMap ? "completed" : ""}>
                            {depthMap ? <CheckCircleIcon className="step-icon-check" /> : pipelineStage === "depth" ? <SpinnerIcon className="spinner step-icon-load" /> : <div className="step-bullet"></div>}
                            <span>Depth & Perspective (Depth Anything V2)</span>
                        </li>
                    </ul>

                    {pipelineStage !== "done" && (
                        <div className="pipeline-loader">
                            <RobotIcon className="spinner loader-robot-icon" />
                            <p>{progressText}</p>
                        </div>
                    )}

                    {pipelineStage === "done" && (
                        <div className="analysis-summary">
                            <h4 className="summary-title">Detected Obstacles</h4>
                            <div className="detected-items-chips">
                                {detections.map((det, index) => (
                                    <span key={`chip-${index}`} className={`chip ${det.label}`}>
                                        {det.label}
                                    </span>
                                ))}
                            </div>

                            <div className="actions-row">
                                <button 
                                    className="toggle-overlay-btn" 
                                    onClick={() => setShowOverlay(!showOverlay)}
                                    type="button"
                                >
                                    {showOverlay ? <EyeSlashIcon /> : <EyeIcon />} {showOverlay ? "Hide BBoxes" : "Show BBoxes"}
                                </button>
                                <button className="proceed-btn" onClick={handleProceed} type="button">
                                    Proceed to Placement
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="error-panel">
                            <p className="error-text">{error}</p>
                            <button className="retry-btn" onClick={runAiPipeline} type="button">
                                Retry Analysis
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomAnalysis;

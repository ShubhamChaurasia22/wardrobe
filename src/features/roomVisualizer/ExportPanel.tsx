import React, { useState } from "react";
import { FaDownload, FaImage, FaSpinner, FaSync } from "react-icons/fa";
import "./RoomVisualizer.css";

const DownloadIcon = FaDownload as any;
const ImageIcon = FaImage as any;
const SpinnerIcon = FaSpinner as any;
const SyncIcon = FaSync as any;

interface PlacementCoords {
    position: number[];
    rotation: number[];
    wall_snapped: string;
}

interface ExportPanelProps {
    fileId: string;
    apiUrl: string;
    placement: PlacementCoords;
    
    // Style configurations
    modelType: number;
    colorHex: string;
    handleStyle: string;
    handleColorHex: string;
    handlePosition: string;
    doorStyle: string;
    
    onReset: () => void;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
    fileId,
    apiUrl,
    placement,
    modelType,
    colorHex,
    handleStyle,
    handleColorHex,
    handlePosition,
    doorStyle,
    onReset
}) => {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generateRealisticPreview = async () => {
        setGenerating(true);
        setError(null);
        
        try {
            // Locate Three.js canvas and capture transparent snapshot
            const canvas = document.querySelector("canvas");
            if (!canvas) {
                throw new Error("Three.js canvas not found. Make sure the visualizer is loaded.");
            }
            
            // Convert canvas contents to transparent Base64 PNG
            const base64Screenshot = canvas.toDataURL("image/png");
            
            // Call FastAPI backend to blend the layers with occlusion masking
            const response = await fetch(`${apiUrl}/visualizer/generate-preview`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    file_id: fileId,
                    placement: {
                        position: placement.position,
                        rotation: placement.rotation,
                        wall_snapped: placement.wall_snapped
                    },
                    style: {
                        model_type: modelType,
                        color_hex: colorHex,
                        handle_style: handleStyle,
                        handle_color_hex: handleColorHex,
                        handle_position: handlePosition,
                        door_style: doorStyle
                    },
                    canvas_screenshot: base64Screenshot
                })
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to generate realistic preview.");
            }
            
            const data = await response.json();
            // Prefix with API base URL to load the static image
            setPreviewUrl(`${apiUrl}/${data.preview_image_path}`);
            
        } catch (err: any) {
            setError(err.message || "Failed to export blended image.");
        } finally {
            setGenerating(false);
        }
    };

    const triggerDownload = () => {
        if (!previewUrl) return;
        const link = document.createElement("a");
        link.href = previewUrl;
        link.download = `room_visualizer_${fileId}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="export-panel-container">
            <h2 className="section-title">Export Realistic Preview</h2>
            <p className="section-description">
                Generate and download a high-definition composite of your wardrobe aligned perfectly inside your room photo, with resolved shadows and depth occlusions.
            </p>

            <div className="export-workspace">
                {previewUrl ? (
                    <div className="preview-display-box">
                        <img src={previewUrl} alt="Blended room visualizer preview" className="final-preview-image" />
                    </div>
                ) : (
                    <div className="export-placeholder-box">
                        {generating ? (
                            <div className="export-loading-overlay">
                                <SpinnerIcon className="spinner loading-icon" />
                                <p>Blending Three.js layers with SAM2 segmentation masks...</p>
                            </div>
                        ) : (
                            <div className="export-trigger-content">
                                <ImageIcon className="placeholder-icon" />
                                <p>Click below to generate your high-fidelity photorealistic room render.</p>
                                <button className="generate-trigger-btn" onClick={generateRealisticPreview} type="button">
                                    Generate Render
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="export-sidebar">
                    <h3>Export Settings</h3>
                    <p className="export-info-text">
                        The visualizer blends the 3D rendered model with the original high-resolution background image, cutting out occluding objects such as furniture and door frames automatically.
                    </p>

                    {previewUrl && (
                        <div className="export-actions-column">
                            <button className="download-action-btn" onClick={triggerDownload} type="button">
                                <DownloadIcon /> Download Image (JPG)
                            </button>
                            <button className="regenerate-action-btn" onClick={generateRealisticPreview} type="button">
                                <SyncIcon /> Re-generate Render
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-error">
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="navigation-actions-row">
                        <button className="restart-btn" onClick={onReset} type="button">
                            Start New Project
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportPanel;

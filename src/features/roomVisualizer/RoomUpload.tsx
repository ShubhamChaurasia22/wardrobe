import React, { useState, useCallback } from "react";
import { FaCloudUploadAlt, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";

const CloudUploadIcon = FaCloudUploadAlt as any;
const ExclamationIcon = FaExclamationTriangle as any;
const InfoIcon = FaInfoCircle as any;

interface RoomUploadProps {
    onUploadSuccess: (fileId: string, filename: string, width: number, height: number, warnings: string[]) => void;
    apiUrl: string;
}

const RoomUpload: React.FC<RoomUploadProps> = ({ onUploadSuccess, apiUrl }) => {
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);

    const handleUpload = async (file: File) => {
        setLoading(true);
        setError(null);
        setFilePreview(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`${apiUrl}/room/upload-room`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to upload room photo.");
            }

            const data = await response.json();
            onUploadSuccess(data.file_id, data.filename, data.width, data.height, data.warnings);
        } catch (err: any) {
            setError(err.message || "An error occurred during upload.");
            setFilePreview(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
        }
    };

    return (
        <div className="upload-container">
            <h2 className="section-title">Upload Room Photo</h2>
            <p className="section-description">
                Upload a clear photo of your room to allow our AI to estimate perspective, detect walls, windows, and obstacles for automatic wardrobe alignment.
            </p>

            <div 
                className={`drag-drop-zone ${dragActive ? "active" : ""} ${loading ? "loading" : ""}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
            >
                {filePreview ? (
                    <div className="preview-box">
                        <img src={filePreview} alt="Room upload preview" className="upload-img-preview" />
                        {loading && (
                            <div className="upload-loader-overlay">
                                <div className="spinner"></div>
                                <p>Analyzing photo diagnostics...</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <label className="file-input-label">
                        <CloudUploadIcon className="upload-icon" />
                        <span className="upload-text-primary">Drag & drop room image here</span>
                        <span className="upload-text-secondary">Supports PNG, JPG, JPEG, or WEBP</span>
                        <input 
                            type="file" 
                            className="hidden-file-input" 
                            accept="image/*" 
                            onChange={handleFileInput}
                            disabled={loading}
                        />
                        <button className="browse-btn" type="button">Browse Files</button>
                    </label>
                )}
            </div>

            {error && (
                <div className="alert alert-error">
                    <ExclamationIcon className="alert-icon" />
                    <span className="alert-message">{error}</span>
                </div>
            )}

            <div className="info-banner">
                <InfoIcon className="info-icon" />
                <div className="info-text">
                    <strong>Photo Tips for Best Quality:</strong>
                    <ul>
                        <li>Make sure the floor and at least two walls are clearly visible.</li>
                        <li>Keep the room well-lit to prevent shadow alignment issues.</li>
                        <li>Avoid extremely blurry or low-resolution images.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default RoomUpload;

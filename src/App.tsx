import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import CameraController from "./components/CameraController";
import Room from "./components/Room";
import Controls from "./components/Controls";
import SizeControls from "./components/SizeControls";
import WardrobeControls from "./components/WardrobeControls";
import StyleWardrobes from "./components/StyleWardrobes";
import { FaCamera } from "react-icons/fa";
import "./index.css";

const CameraIcon = FaCamera as unknown as React.FC;

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

const isWallSection = (wall: any): wall is WallSection[] => {
    return Array.isArray(wall) && wall.length > 0 && 'type' in wall[0];
};

const App = () => {
    const [view, setView] = useState("orbit");
    const [dimensions, setDimensions] = useState({ width: 5, length: 5, height: 2.4 });
    const [stage, setStage] = useState("size"); // "size" | "wardrobe" | "style"
    const [canvasStyle, setCanvasStyle] = useState({ width: "100%", height: "85vh" });
    const [userName, setUserName] = useState(""); // State to store the user's name
    const [selectedModel, setSelectedModel] = useState<number | null>(null);
    const [selectedHandle, setSelectedHandle] = useState<'none' | 'straight' | 'fancy' | 'spherical'>('straight');
    const [activeWardrobe, setActiveWardrobe] = useState<{
        wall: keyof LayoutConfig;
        index: number;
    } | null>(null);

    const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
        roomDetails: { length: 5, width: 5, height: 2.4 },
        leftWall: Array(5).fill({ width: 1, type: "free-space" }),
        backWall: Array(4).fill({ width: 0.95, type: "free-space" }),
        rightWall: Array(5).fill({ width: 1, type: "free-space" }),
    });

    useEffect(() => {
        const updateCanvasStyle = () => {
            setCanvasStyle({
                width: window.innerWidth >= 1024 ? "60%" : "100%",
                height: window.innerWidth >= 1024 ? "100vh" : "85vh",
            });
        };

        // Set initial value
        updateCanvasStyle();

        // Listen for window resize events
        window.addEventListener("resize", updateCanvasStyle);
        
        return () => window.removeEventListener("resize", updateCanvasStyle);
    }, []);

    const handleCapture = () => {
        const canvas = document.querySelector("canvas");
        if (canvas) {
            requestAnimationFrame(() => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = userName ? `${userName}.jpg` : "capture.jpg"; // Use user's name if provided
                        link.click();
                    }
                }, "image/jpeg");
            });
        }
    };

    const handleSelectModel = (modelType: number, handleType?: 'none' | 'straight' | 'fancy' | 'spherical') => {
        setSelectedModel(modelType);
        if (handleType) {
            setSelectedHandle(handleType);
        }
    };

    const handleAddWardrobe = (wall: keyof LayoutConfig, index: number) => {
        if (!selectedModel || wall === "roomDetails") return;

        setLayoutConfig((prevConfig) => {
            const currentWall = prevConfig[wall];
            if (!Array.isArray(currentWall)) return prevConfig;

            const updatedWall = [...currentWall];
            if (selectedModel === 2) {
                if (index < updatedWall.length - 1 && 
                    updatedWall[index].type === "free-space" && 
                    updatedWall[index + 1].type === "free-space") {
                    updatedWall[index] = { 
                        ...updatedWall[index], 
                        type: "wardrobe", 
                        modelType: selectedModel,
                        handleType: selectedHandle 
                    };
                    updatedWall[index + 1] = { 
                        ...updatedWall[index + 1], 
                        type: "wardrobe-extension" 
                    };
                }
            } else {
                updatedWall[index] = { 
                    ...updatedWall[index], 
                    type: "wardrobe", 
                    modelType: selectedModel,
                    handleType: selectedHandle 
                };
            }
            
            return { ...prevConfig, [wall]: updatedWall };
        });

        // Set the newly added wardrobe as active
        setActiveWardrobe({ wall, index });
    };

    const handleHandleChange = (handleType: 'none' | 'straight' | 'fancy' | 'spherical') => {
        if (activeWardrobe) {
            // First update the global selected handle state
            setSelectedHandle(handleType);
            
            // Then update the wardrobe config
            setLayoutConfig(prevConfig => {
                const { wall, index } = activeWardrobe;
                const currentWall = prevConfig[wall];
                if (!Array.isArray(currentWall)) return prevConfig;

                const updatedWall = [...currentWall];
                if (updatedWall[index].type === "wardrobe") {
                    updatedWall[index] = {
                        ...updatedWall[index],
                        handleType
                    };
                }
                return {
                    ...prevConfig,
                    [wall]: updatedWall
                };
            });
        }
    };

    // When a wardrobe is selected, update the selected handle to match
    useEffect(() => {
        if (activeWardrobe) {
            const wall = layoutConfig[activeWardrobe.wall];
            if (Array.isArray(wall)) {
                const activeSection = wall[activeWardrobe.index];
                if (activeSection && activeSection.type === "wardrobe" && activeSection.handleType) {
                    setSelectedHandle(activeSection.handleType);
                }
            }
        }
    }, [activeWardrobe, layoutConfig]);

    return (
        <div className="container" style={{ width: "100vw", height: "fit-content", background: "whitesmoke" }}>
            <Canvas className="canvas" style={canvasStyle}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} />
                <Room 
                    {...dimensions} 
                    view={view} 
                    stage={stage} 
                    selectedModel={selectedModel} 
                    layoutConfig={layoutConfig} 
                    onAddWardrobe={handleAddWardrobe}
                    activeWardrobe={activeWardrobe}
                    setActiveWardrobe={setActiveWardrobe}
                />
                <CameraController view={view} />
                <OrbitControls />
            </Canvas>

            <div className="camera">
                <button className="camera-btn" style={{ color: "black", background: "white", border: "black" }} onClick={handleCapture}>
                    <CameraIcon />
                </button>
            </div>

            <Controls view={view} setView={setView} />

            {stage === "size" && <SizeControls dimensions={dimensions} setDimensions={setDimensions} setStage={setStage} />}
            {stage === "wardrobe" && <WardrobeControls setStage={setStage} userName={userName} setUserName={setUserName} />}
            {stage === "style" && (
                <StyleWardrobes 
                    setStage={setStage} 
                    onSelectModel={handleSelectModel}
                    selectedHandle={selectedHandle}
                    setSelectedHandle={handleHandleChange}
                    hasActiveWardrobe={!!activeWardrobe}
                />
            )}
        </div>
    );
};

export default App;
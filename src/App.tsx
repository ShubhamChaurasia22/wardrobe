import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import CameraController from "./components/CameraController";
import Room from "./components/Room";
import Controls from "./components/Controls";
import SizeControls from "./components/SizeControls";
import WardrobeControls from "./components/WardrobeControls";
import StyleWardrobes from "./components/StyleWardrobes";
import { FaCamera, FaArrowLeft } from "react-icons/fa";
import "./index.css";
import { ColorOption, InternalStorageType, WallSection, LayoutConfig } from './types';

const CameraIcon = FaCamera as unknown as React.FC;
const BackIcon = FaArrowLeft as unknown as React.FC;

const App = () => {
    const [view, setView] = useState("orbit");
    const [dimensions, setDimensions] = useState({ width: 5, length: 5, height: 2.4 });
    const [stage, setStage] = useState<"size" | "wardrobe" | "style" | "preview">("size");
    const [canvasStyle, setCanvasStyle] = useState({ width: "100%", height: "85vh" });
    const [userName, setUserName] = useState(""); // State to store the user's name
    const [selectedModel, setSelectedModel] = useState<number | null>(null);
    const [selectedHandle, setSelectedHandle] = useState<'none' | 'straight' | 'fancy' | 'spherical'>('straight');
    const [activeWardrobe, setActiveWardrobe] = useState<{
        wall: keyof LayoutConfig;
        index: number;
    } | null>(null);
    const [selectedWardrobeColor, setSelectedWardrobeColor] = useState<ColorOption>({
        id: 'rose-gold',
        name: 'Rose Gold',
        color: '#B76E79',
        isMetallic: true
    });
    const [selectedHandleColor, setSelectedHandleColor] = useState<ColorOption>({
        id: '',
        name: '',
        color: '',
        texture: '',
        isMetallic: false
    });
    const [selectedHandlePosition, setSelectedHandlePosition] = useState<'left' | 'right'>('right');
    const [selectedCabinetOption, setSelectedCabinetOption] = useState<'none' | 'cabinet-layout'>('none');
    const [selectedInternalStorage, setSelectedInternalStorage] = useState<InternalStorageType>('long-hanging');
    const [selectedInternalStorageColor, setSelectedInternalStorageColor] = useState<ColorOption>({
        id: 'rose-gold',
        name: 'Rose Gold',
        color: '#B76E79',
        isMetallic: true
    });

    const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
        roomDetails: { length: 5, width: 5, height: 2.4 },
        leftWall: Array(5).fill({ width: 1, type: "free-space" }),
        backWall: Array(4).fill({ width: 0.95, type: "free-space" }),
        rightWall: Array(5).fill({ width: 1, type: "free-space" }),
    });

    useEffect(() => {
        const updateCanvasStyle = () => {
            if (stage === "preview") {
                setCanvasStyle({
                    width: "100%",
                    height: "100vh",
                });
            } else {
                setCanvasStyle({
                    width: window.innerWidth >= 1024 ? "60%" : "100%",
                    height: window.innerWidth >= 1024 ? "100vh" : "85vh",
                });
            }
        };

        // Set initial value
        updateCanvasStyle();

        // Listen for window resize events
        window.addEventListener("resize", updateCanvasStyle);
        
        return () => window.removeEventListener("resize", updateCanvasStyle);
    }, [stage]);

    // Add useEffect to handle view changes when stage changes
    useEffect(() => {
        if (stage === "preview") {
            setView("orbit");  // Set to orbit view in preview stage
            // Deactivate any selected wardrobe in preview mode
            setActiveWardrobe(null);
        }
    }, [stage]);

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
            
            // Add shared properties with default colors
            const commonProps = {
                type: "wardrobe",
                modelType: selectedModel,
                handlePosition: selectedHandlePosition,
                cabinetOption: selectedCabinetOption,
                internalStorage: selectedInternalStorage,
                color: selectedWardrobeColor,
                handleColor: selectedHandleColor,
                internalStorageColor: selectedInternalStorageColor // Add this
            };

            if (selectedModel === 2) { // Storage Block
                updatedWall[index] = {
                    ...updatedWall[index],
                    ...commonProps,
                    handleType: 'none',
                    height: 0.8
                };
            } else { // Single Door Wardrobe
                updatedWall[index] = {
                    ...updatedWall[index],
                    ...commonProps,
                    handleType: selectedHandle,
                    height: 2.4
                };
            }
            
            return { ...prevConfig, [wall]: updatedWall };
        });

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

    const handleWardrobeColorChange = (option: ColorOption) => {
        if (activeWardrobe) {
            const { wall, index } = activeWardrobe;
            setSelectedWardrobeColor(option);
            
            setLayoutConfig(prevConfig => {
                if (wall === 'roomDetails') return prevConfig;
                
                const currentWall = prevConfig[wall];
                if (!Array.isArray(currentWall)) return prevConfig;
                
                const updatedWall = [...currentWall];
                if (updatedWall[index]?.type === "wardrobe") {
                    updatedWall[index] = {
                        ...updatedWall[index],
                        color: option
                    };
                }
                
                return {
                    ...prevConfig,
                    [wall]: updatedWall
                };
            });
        }
    };

    const handleHandleColorChange = (option: ColorOption) => {
        if (activeWardrobe) {
            const { wall, index } = activeWardrobe;
            setSelectedHandleColor(option);
            
            setLayoutConfig(prevConfig => {
                if (wall === 'roomDetails') return prevConfig;
                
                const currentWall = prevConfig[wall];
                if (!Array.isArray(currentWall)) return prevConfig;
                
                const updatedWall = [...currentWall];
                if (updatedWall[index]?.type === "wardrobe") {
                    updatedWall[index] = {
                        ...updatedWall[index],
                        handleColor: option
                    };
                }
                
                return {
                    ...prevConfig,
                    [wall]: updatedWall
                };
            });
        }
    };

    const handleHandlePositionChange = (position: 'left' | 'right') => {
        if (activeWardrobe) {
            setSelectedHandlePosition(position);
            
            setLayoutConfig(prevConfig => {
                const { wall, index } = activeWardrobe;
                const currentWall = prevConfig[wall];
                if (!Array.isArray(currentWall)) return prevConfig;

                const updatedWall = [...currentWall];
                if (updatedWall[index].type === "wardrobe") {
                    updatedWall[index] = {
                        ...updatedWall[index],
                        handlePosition: position
                    };
                }
                return {
                    ...prevConfig,
                    [wall]: updatedWall
                };
            });
        }
    };

    const handleCabinetOptionChange = (option: 'none' | 'cabinet-layout') => {
        if (activeWardrobe) {
            setSelectedCabinetOption(option);
            setLayoutConfig(prevConfig => {
                const { wall, index } = activeWardrobe;
                const currentWall = prevConfig[wall];
                if (!Array.isArray(currentWall)) return prevConfig;

                const updatedWall = [...currentWall];
                if (updatedWall[index].type === "wardrobe") {
                    updatedWall[index] = {
                        ...updatedWall[index],
                        cabinetOption: option
                    };
                }
                return {
                    ...prevConfig,
                    [wall]: updatedWall
                };
            });
        }
    };

    const handleInternalStorageChange = (storage: InternalStorageType) => {
        if (activeWardrobe) {
            setSelectedInternalStorage(storage);
            setLayoutConfig(prevConfig => {
                const { wall, index } = activeWardrobe;
                const currentWall = prevConfig[wall];
                if (!Array.isArray(currentWall)) return prevConfig;

                const updatedWall = [...currentWall];
                if (updatedWall[index].type === "wardrobe") {
                    updatedWall[index] = {
                        ...updatedWall[index],
                        internalStorage: storage
                    };
                }
                return {
                    ...prevConfig,
                    [wall]: updatedWall
                };
            });
        }
    };

    const handleInternalStorageColorChange = (option: ColorOption) => {
        if (activeWardrobe) {
            setSelectedInternalStorageColor(option);
            
            setLayoutConfig(prevConfig => {
                const { wall, index } = activeWardrobe;
                if (wall === 'roomDetails') return prevConfig;
                
                const currentWall = prevConfig[wall];
                if (!Array.isArray(currentWall)) return prevConfig;
                
                const updatedWall = [...currentWall];
                if (updatedWall[index]?.type === "wardrobe") {
                    updatedWall[index] = {
                        ...updatedWall[index],
                        internalStorageColor: option
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

    // Add this useEffect after your existing useEffect hooks
    useEffect(() => {
        if (activeWardrobe) {
            const wall = layoutConfig[activeWardrobe.wall];
            if (Array.isArray(wall)) {
                const activeSection = wall[activeWardrobe.index];
                if (activeSection && activeSection.type === "wardrobe") {
                    // Update cabinet option and internal storage when selecting a wardrobe
                    setSelectedCabinetOption(activeSection.cabinetOption || 'none');
                    setSelectedInternalStorage(activeSection.internalStorage || 'long-hanging');
                }
            }
        }
    }, [activeWardrobe, layoutConfig]);

    // Add this useEffect
    useEffect(() => {
        if (activeWardrobe) {
            const wall = layoutConfig[activeWardrobe.wall];
            if (Array.isArray(wall)) {
                const activeSection = wall[activeWardrobe.index];
                if (activeSection && activeSection.type === "wardrobe") {
                    setSelectedModel(activeSection.modelType || 1);
                }
            }
        }
    }, [activeWardrobe, layoutConfig]);

    const handleBackToStyle = () => {
        setStage("style");
        setView("orbit");  // Change from "front" to "orbit"
    };

    return (
        <div className="container" style={{ width: "100vw", height: "fit-content", background: "#f5f5f5" }}>
            <Canvas
                shadows
                camera={{ 
                    position: stage === "preview" ? [15, 15, 15] : [0, 0, 5], // Adjust camera position for preview
                    fov: 50 
                }}
                className="canvas" 
                style={canvasStyle}
            >
                <color attach="background" args={['#f5f5f5']} />
                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[10, 10, 10]}
                    intensity={1}
                    castShadow
                />
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
                {stage !== "preview" && <CameraController view={view} />}
                <OrbitControls 
                    enableZoom={true}
                    enablePan={true}
                    enableRotate={true}
                    makeDefault={stage === "preview"}
                />
            </Canvas>

            <div className="camera">
                <button 
                    className="camera-btn" 
                    style={{ color: "black", background: "white", border: "black" }} 
                    onClick={handleCapture}
                >
                    <CameraIcon />
                </button>
                {stage === "preview" && (
                    <button 
                        className="back-btn"
                        onClick={handleBackToStyle}
                        style={{
                            marginTop: "1rem",
                            padding: "0.5rem 1rem",
                            backgroundColor: "white",
                            border: "0",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                    >
                        <BackIcon />
                    </button>
                )}
            </div>

            {stage !== "preview" && <Controls view={view} setView={setView} />}

            {stage === "size" && <SizeControls dimensions={dimensions} setDimensions={setDimensions} setStage={setStage} />}
            {stage === "wardrobe" && <WardrobeControls setStage={setStage} userName={userName} setUserName={setUserName} />}
            {stage === "style" && (
                <StyleWardrobes 
                    setStage={setStage} 
                    onSelectModel={handleSelectModel}
                    selectedHandle={selectedHandle}
                    setSelectedHandle={handleHandleChange}
                    hasActiveWardrobe={!!activeWardrobe}
                    onSelectWardrobeColor={handleWardrobeColorChange}
                    onSelectHandleColor={handleHandleColorChange}
                    selectedWardrobeColor={selectedWardrobeColor}
                    selectedHandleColor={selectedHandleColor}
                    handlePosition={selectedHandlePosition}
                    setHandlePosition={handleHandlePositionChange}
                    cabinetOption={selectedCabinetOption}
                    setCabinetOption={handleCabinetOptionChange}
                    internalStorage={selectedInternalStorage}
                    setInternalStorage={handleInternalStorageChange}
                    selectedInternalStorageColor={selectedInternalStorageColor}
                    onSelectInternalStorageColor={handleInternalStorageColorChange}
                />
            )}
        </div>
    );
};

export default App;
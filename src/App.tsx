import React, { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import CameraController from "./components/CameraController";
import Room from "./components/Room";
import SizeControls from "./components/SizeControls";
import WardrobeControls from "./components/WardrobeControls";
import StyleWardrobes from "./components/StyleWardrobes";
import { FaCamera, FaArrowLeft, FaPlus, FaMinus, FaSync, FaCube } from "react-icons/fa";
import "./index.css";
import { ColorOption, InternalStorageType, LayoutConfig, StoragePosition, DoorStyle, WallSection } from './types';
import * as THREE from 'three';
import './App.css';
import ReviewPage from './components/ReviewPage';

const CameraIcon = FaCamera as unknown as React.FC;
const BackIcon = FaArrowLeft as unknown as React.FC;
const PlusIcon = FaPlus as unknown as React.FC;
const MinusIcon = FaMinus as unknown as React.FC;
const SyncIcon = FaSync as unknown as React.FC;
const RotateIcon = FaCube as unknown as React.FC;

// Initial color definitions
const defaultColor: ColorOption = { id: 'white', name: 'White', color: '#ffffff' };
const defaultHandleColor: ColorOption = { id: 'chrome', name: 'Chrome', color: '#C0C0C0', isMetallic: true };

// Define a type for the Camera Zoom Controls
interface CameraZoomControlsProps {
    onRegisterZoomControls: (controls: {
        zoomIn: () => void;
        zoomOut: () => void;
    }) => void;
}

// Add this component inside the App.tsx file to handle camera controls
const CameraZoomControls: React.FC<CameraZoomControlsProps> = ({ onRegisterZoomControls }) => {
    const { camera } = useThree();
    
    useEffect(() => {
        // Register controls with parent component
        onRegisterZoomControls({
            zoomIn: () => {
                // Get the current camera position
                const position = camera.position.clone();
                // Calculate the direction to the target
                const target = new THREE.Vector3(0, 1, 0);
                const direction = new THREE.Vector3().subVectors(target, position).normalize();
                // Move camera closer to target (zoom in)
                position.addScaledVector(direction, 2);
                // Update camera position
                camera.position.copy(position);
            },
            zoomOut: () => {
                // Get the current camera position
                const position = camera.position.clone();
                // Calculate the direction away from the target
                const target = new THREE.Vector3(0, 1, 0);
                const direction = new THREE.Vector3().subVectors(position, target).normalize();
                // Move camera away from target (zoom out)
                position.addScaledVector(direction, 2);
                // Update camera position
                camera.position.copy(position);
            }
        });
    }, [camera, onRegisterZoomControls]);
    
    return null;
};

const App = () => {
    const [view, setView] = useState<"orbit" | "left" | "back" | "right">("orbit");
    const [dimensions, setDimensions] = useState({
        width: 5,
        length: 5,
        height: 2.4
    });
    const [stage, setStage] = useState<"size" | "wardrobe" | "style" | "preview">("size");
    const [canvasStyle, setCanvasStyle] = useState({ width: "100%", height: "85vh" });
    const [userName, setUserName] = useState("");
    const [selectedModel, setSelectedModel] = useState<number | null>(3);
    const [selectedHandle, setSelectedHandle] = useState<'none' | 'straight' | 'fancy' | 'spherical'>('straight');
    const [activeWardrobe, setActiveWardrobe] = useState<{
        wall: keyof LayoutConfig;
        index: number;
    } | null>(null);
    const [selectedWardrobeColor, setSelectedWardrobeColor] = useState<ColorOption>(defaultColor);
    const [selectedHandleColor, setSelectedHandleColor] = useState<ColorOption>(defaultHandleColor);
    const [selectedHandlePosition, setSelectedHandlePosition] = useState<'left' | 'right'>('right');
    const [selectedCabinetOption, setSelectedCabinetOption] = useState<'none' | 'cabinet-layout'>('none');
    const [selectedInternalStorage, setSelectedInternalStorage] = useState<InternalStorageType>('long-hanging');
    const [selectedInternalStorageColor, setSelectedInternalStorageColor] = useState<ColorOption>(defaultColor);
    const [activeWardrobeType, setActiveWardrobeType] = useState<number | null>(null);
    const [selectedStoragePosition, setSelectedStoragePosition] = useState<StoragePosition>('middle');
    const [selectedDoorStyle, setSelectedDoorStyle] = useState<DoorStyle>('panel-shaker');
    const [layoutHistory, setLayoutHistory] = useState<LayoutConfig[]>([]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
    const orbitControlsRef = useRef<any>(null);
    const [allowRotation, setAllowRotation] = useState(false);
    const [zoomControls, setZoomControls] = useState<{
        zoomIn: () => void;
        zoomOut: () => void;
    } | null>(null);

    // Room dimensions state
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [roomDimensions, setRoomDimensions] = useState({
        width: 4,
        length: 4,
        height: 2.4
    });

    // Calculate number of sections based on room dimensions (1000mm per section)
    const calculateWallSections = useCallback((width: number, length: number) => {
        // Convert meters to millimeters and divide by 1000mm per section
        const widthSections = Math.max(1, Math.floor(width * 1000 / 1000));
        const lengthSections = Math.max(1, Math.floor(length * 1000 / 1000));
        
        // Create arrays of wall sections with unique objects for each section
        return {
            leftWall: Array(lengthSections).fill(null).map(() => ({ width: 1, type: "free-space" as const })),
            backWall: Array(widthSections).fill(null).map(() => ({ width: 1, type: "free-space" as const })),
            rightWall: Array(lengthSections).fill(null).map(() => ({ width: 1, type: "free-space" as const })),
        };
    }, []);

    // Create initial layout config based on dimensions
    const createInitialLayoutConfig = useCallback((dimensions: { width: number, length: number, height: number }) => {
        const wallSections = calculateWallSections(dimensions.width, dimensions.length);
        
        return {
            roomDetails: { ...dimensions },
            ...wallSections
        };
    }, [calculateWallSections]);

    const initialLayoutConfig = createInitialLayoutConfig(dimensions);
    const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(initialLayoutConfig);

    useEffect(() => {
        setLayoutHistory([initialLayoutConfig]);
    }, [initialLayoutConfig]);

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
                        link.download = userName ? `${userName}.jpg` : "capture.jpg";
                        link.click();
                    }
                }, "image/jpeg");
            });
        }
    };

    const handleAddWardrobe = (wall: keyof LayoutConfig, index: number) => {
        console.log(`Adding wardrobe to ${wall} at index ${index}, selected model: ${selectedModel}, stage: ${stage}`);
        
        if (selectedModel === null) {
            console.log("No wardrobe model selected");
            return;
        }
        
        // Create a copy of the current configuration
        const newConfig = JSON.parse(JSON.stringify(layoutConfig)) as LayoutConfig;
        
        // Ensure the wall sections array exists and it's not roomDetails
        if (wall === 'roomDetails' || !newConfig[wall] || !Array.isArray(newConfig[wall])) {
            console.error(`Wall ${wall} not found in config, is not an array, or is roomDetails`);
            return;
        }
        
        // Explicitly type and cast the wall sections to handle TypeScript errors
        const wallSections = newConfig[wall] as WallSection[];
        
        // Check if the section is already occupied - with safe indexing
        if (index >= 0 && index < wallSections.length) {
            const currentSection = wallSections[index];
            if (currentSection && currentSection.type !== "free-space" && currentSection.type !== "button") {
                console.log("Section already occupied");
                return;
            }
        } else {
            console.error(`Index ${index} out of bounds for wall ${wall}`);
            return;
        }
        
        // Create the new wardrobe section
        const wardrobeSection: WallSection = {
            type: "wardrobe",
            width: 1000,
            modelType: selectedModel,
            handleType: selectedHandle || 'straight',
            color: selectedWardrobeColor,
            handleColor: selectedHandleColor,
            handlePosition: selectedHandlePosition || 'right',
            cabinetOption: selectedCabinetOption || 'none',
            internalStorage: selectedInternalStorage || 'long-hanging',
            internalStorageColor: selectedInternalStorageColor,
            doorStyle: selectedDoorStyle || 'panel-shaker',
            storagePosition: 'middle'
        };
        
        // Set the current section as wardrobe
        wallSections[index] = wardrobeSection;
        
        // For double-door wardrobes (modelType 3), mark that it takes up space
        // but don't actually remove the next section's button
        if (selectedModel === 3 && index < wallSections.length - 1) {
            // Just mark that the wardrobe extends into next section
            // but don't change the section type to maintain the button
            wardrobeSection.isDoubleDoor = true;
        }
        
        // Safely assign the updated wall sections back to the layout config
        // This explicit assignment to the specific property helps TypeScript understand the types
        if (wall === 'leftWall') {
            newConfig.leftWall = wallSections;
        } else if (wall === 'rightWall') {
            newConfig.rightWall = wallSections;
        } else if (wall === 'backWall') {
            newConfig.backWall = wallSections;
        }
        
        console.log("New config:", newConfig);
        
        // Update the state
        setLayoutConfig(newConfig);
        
        // Set this as the active wardrobe
        setActiveWardrobe({ wall, index });
        
        // If we're in the wardrobe stage, automatically advance to the style stage
        if (stage === "wardrobe") {
            setStage("style");
        }
        
        // Add to history for undo/redo
        addToHistory(newConfig);
    };

    const addToHistory = (newConfig: LayoutConfig) => {
        const newHistory = layoutHistory.slice(0, currentHistoryIndex + 1);
        setLayoutHistory([...newHistory, newConfig]);
        setCurrentHistoryIndex(currentHistoryIndex + 1);
    };

    const handleUndo = () => {
        if (currentHistoryIndex > 0) {
            setCurrentHistoryIndex(currentHistoryIndex - 1);
            setLayoutConfig(layoutHistory[currentHistoryIndex - 1]);
        }
    };

    const handleRedo = () => {
        if (currentHistoryIndex < layoutHistory.length - 1) {
            setCurrentHistoryIndex(currentHistoryIndex + 1);
            setLayoutConfig(layoutHistory[currentHistoryIndex + 1]);
        }
    };

    const handleWardrobeColorChange = (option: ColorOption) => {
        if (activeWardrobe) {
            const { wall, index } = activeWardrobe;
            const newLayoutConfig = { ...layoutConfig };
            const section = (newLayoutConfig[wall] as WallSection[])[index];

            if (section.type === "wardrobe") {
                section.color = option;
                setSelectedWardrobeColor(option);
                setLayoutConfig(newLayoutConfig);
                addToHistory(newLayoutConfig);
            }
        }
    };

    const handleHandleColorChange = (option: ColorOption) => {
        if (activeWardrobe) {
                const { wall, index } = activeWardrobe;
            const newLayoutConfig = { ...layoutConfig };
            const section = (newLayoutConfig[wall] as WallSection[])[index];

            if (section.type === "wardrobe") {
                section.handleColor = option;
                setSelectedHandleColor(option);
                setLayoutConfig(newLayoutConfig);
                addToHistory(newLayoutConfig);
            }
        }
    };

    const handleInternalStorageColorChange = (option: ColorOption) => {
        if (activeWardrobe) {
            const { wall, index } = activeWardrobe;
            const newLayoutConfig = { ...layoutConfig };
            const section = (newLayoutConfig[wall] as WallSection[])[index];

            if (section.type === "wardrobe") {
                section.internalStorageColor = option;
                setSelectedInternalStorageColor(option);
                setLayoutConfig(newLayoutConfig);
                addToHistory(newLayoutConfig);
            }
        }
    };

    const handleHandleChange = (handleType: 'none' | 'straight' | 'fancy' | 'spherical') => {
        setSelectedHandle(handleType);
        if (activeWardrobe) {
            const { wall, index } = activeWardrobe;
            const newLayoutConfig = { ...layoutConfig };
            const section = (newLayoutConfig[wall] as WallSection[])[index];

            if (section.type === "wardrobe") {
                section.handleType = handleType;
                setLayoutConfig(newLayoutConfig);
                addToHistory(newLayoutConfig);
            }
        }
    };

    const handleHandlePositionChange = (position: 'left' | 'right') => {
        setSelectedHandlePosition(position);
        if (activeWardrobe) {
                const { wall, index } = activeWardrobe;
            const newLayoutConfig = { ...layoutConfig };
            const section = (newLayoutConfig[wall] as WallSection[])[index];

            if (section.type === "wardrobe") {
                section.handlePosition = position;
                setLayoutConfig(newLayoutConfig);
                addToHistory(newLayoutConfig);
            }
        }
    };

    const handleCabinetOptionChange = (option: 'none' | 'cabinet-layout') => {
        setSelectedCabinetOption(option);
        if (activeWardrobe) {
                const { wall, index } = activeWardrobe;
            const newLayoutConfig = { ...layoutConfig };
            const section = (newLayoutConfig[wall] as WallSection[])[index];

            if (section.type === "wardrobe") {
                section.cabinetOption = option;
                setLayoutConfig(newLayoutConfig);
                addToHistory(newLayoutConfig);
            }
        }
    };

    const handleInternalStorageChange = (storage: InternalStorageType) => {
        setSelectedInternalStorage(storage);
        if (activeWardrobe) {
                    const { wall, index } = activeWardrobe;
            const newLayoutConfig = { ...layoutConfig };
            const section = (newLayoutConfig[wall] as WallSection[])[index];

            if (section.type === "wardrobe") {
                section.internalStorage = storage;
                setLayoutConfig(newLayoutConfig);
                addToHistory(newLayoutConfig);
            }
        }
    };

    const handleStoragePositionChange = (position: StoragePosition) => {
            setSelectedStoragePosition(position);
        if (activeWardrobe) {
            const { wall, index } = activeWardrobe;
            const newLayoutConfig = { ...layoutConfig };
            const section = (newLayoutConfig[wall] as WallSection[])[index];

            if (section.type === "wardrobe") {
                section.storagePosition = position;
                setLayoutConfig(newLayoutConfig);
                addToHistory(newLayoutConfig);
            }
        }
    };

    const handleDoorStyleChange = (style: DoorStyle) => {
        setSelectedDoorStyle(style);
        if (activeWardrobe) {
            const { wall, index } = activeWardrobe;
            const newLayoutConfig = { ...layoutConfig };
            const section = (newLayoutConfig[wall] as WallSection[])[index];

            if (section.type === "wardrobe") {
                section.doorStyle = style;
                setLayoutConfig(newLayoutConfig);
                addToHistory(newLayoutConfig);
            }
        }
    };

    const handleSelectModel = (modelType: number, handleType?: 'none' | 'straight' | 'fancy' | 'spherical') => {
        setSelectedModel(modelType);
        if (handleType) {
            setSelectedHandle(handleType);
        }
    };

    const handleSetActiveWardrobe = (wardrobe: { wall: keyof LayoutConfig; index: number; } | null) => {
        setActiveWardrobe(wardrobe);
        
        if (wardrobe) {
            const section = (layoutConfig[wardrobe.wall] as WallSection[])[wardrobe.index];
            if (section.type === "wardrobe") {
                // Update active wardrobe type
                setActiveWardrobeType(section.modelType || null);
                
                // Update all the selected options based on this wardrobe
                if (section.handleType) setSelectedHandle(section.handleType);
                if (section.color) setSelectedWardrobeColor(section.color);
                if (section.handleColor) setSelectedHandleColor(section.handleColor);
                if (section.handlePosition) setSelectedHandlePosition(section.handlePosition);
                if (section.cabinetOption) setSelectedCabinetOption(section.cabinetOption);
                if (section.internalStorage) setSelectedInternalStorage(section.internalStorage);
                if (section.internalStorageColor) setSelectedInternalStorageColor(section.internalStorageColor);
                if (section.storagePosition) setSelectedStoragePosition(section.storagePosition);
                if (section.doorStyle) setSelectedDoorStyle(section.doorStyle);
            }
        } else {
            setActiveWardrobeType(null);
        }
    };

    const handleBuildWardrobes = () => {
        console.log("Building wardrobes with dimensions:", dimensions);
        
        // Use the shared function to calculate wall sections
        const wallSections = calculateWallSections(dimensions.width, dimensions.length);
        
        // Update layout config with new dimensions
        const newLayoutConfig = {
            ...layoutConfig,
            roomDetails: {
                ...dimensions
            },
            // Use the calculated wall sections
            leftWall: wallSections.leftWall,
            backWall: wallSections.backWall,
            rightWall: wallSections.rightWall
        };
        
        setLayoutConfig(newLayoutConfig);
        addToHistory(newLayoutConfig);
        
        // Move to the style stage
        setStage("style");
    };

    const handleRegisterZoomControls = useCallback((controls: {
        zoomIn: () => void;
        zoomOut: () => void;
    }) => {
        setZoomControls(controls);
    }, []);
    
    const handleZoomIn = () => {
        console.log('Zoom In clicked');
        if (orbitControlsRef.current) {
            // Get current distance
            const currentDistance = orbitControlsRef.current.getDistance();
            // Calculate new distance (closer)
            const newDistance = Math.max(currentDistance * 0.8, 4);
            // Set new min/max distance
            orbitControlsRef.current.minDistance = newDistance;
            orbitControlsRef.current.maxDistance = newDistance;
            // Force update
            orbitControlsRef.current.update();
        } else if (zoomControls) {
            // Fallback to our zoom controls if orbitControls not available
            zoomControls.zoomIn();
        }
    };
    
    const handleZoomOut = () => {
        console.log('Zoom Out clicked');
        if (orbitControlsRef.current) {
            // Get current distance
            const currentDistance = orbitControlsRef.current.getDistance();
            // Calculate new distance (farther)
            const newDistance = Math.min(currentDistance * 1.2, 20);
            // Set new min/max distance
            orbitControlsRef.current.minDistance = newDistance;
            orbitControlsRef.current.maxDistance = newDistance;
            // Force update
            orbitControlsRef.current.update();
        } else if (zoomControls) {
            // Fallback to our zoom controls if orbitControls not available
            zoomControls.zoomOut();
        }
    };

    const handleResetView = () => {
        console.log('Reset View clicked');
        // Reset camera position to default
        if (orbitControlsRef.current) {
            // Get the camera from the controls
            const camera = orbitControlsRef.current.object;
            if (camera) {
                // Reset to default position - higher up and further back for better overview
                camera.position.set(8, 6, 8);
                
                // Reset target to center of room
                orbitControlsRef.current.target.set(0, 1, 0);
                
                // Reset distances
                orbitControlsRef.current.minDistance = 4;
                orbitControlsRef.current.maxDistance = 20;
                
                // Update controls
                orbitControlsRef.current.update();
            }
        }
    };
    
    const toggleRotation = () => {
        setAllowRotation(prev => {
            const newValue = !prev;
            console.log('Toggling rotation: ', newValue);
            // Directly update the OrbitControls when state changes
            if (orbitControlsRef.current) {
                orbitControlsRef.current.enableRotate = newValue;
                orbitControlsRef.current.enablePan = newValue;
                orbitControlsRef.current.update(); // Add this to force update
            }
            return newValue;
        });
    };

    // Synchronize OrbitControls with rotation state
    useEffect(() => {
        const syncOrbitControls = () => {
            if (orbitControlsRef.current) {
                orbitControlsRef.current.enableRotate = allowRotation;
                orbitControlsRef.current.enablePan = allowRotation;
            }
        };
        
        // Call immediately
        syncOrbitControls();
        
        // Also set up a small interval to ensure controls are properly synced
        // This helps when the Canvas/OrbitControls initializes after this effect runs
        const intervalId = setInterval(syncOrbitControls, 1000);
        
        // Clean up
        return () => clearInterval(intervalId);
    }, [allowRotation]);

    // Add getActiveModelType function
    const getActiveModelType = () => {
        if (!activeWardrobe) return null;
        
        const wall = layoutConfig[activeWardrobe.wall];
        if (!wall || !Array.isArray(wall)) return null;
        
        const section = wall[activeWardrobe.index];
        if (!section) return null;
        
        return section.type === 'wardrobe' ? section.modelType : null;
    };

    // Add back button click handler that skips wardrobe stage
    const handleBackFromStyle = () => {
        setStage("size");
    };

    const handleBackFromReview = () => {
        setStage("style");
    };

    // Add a useEffect to center the model in review stage
    useEffect(() => {
        if (stage === "preview") {
            setView("orbit");
            
            // Reset camera for review stage
            setTimeout(() => {
                if (orbitControlsRef.current) {
                    // Position camera to see the entire room from a higher angle
                    const camera = orbitControlsRef.current.object;
                    if (camera) {
                        // Position for better overview
                        camera.position.set(10, 8, 10);
                        
                        // Look at center of room
                        orbitControlsRef.current.target.set(0, 1, 0);
                        
                        // Update controls
                        orbitControlsRef.current.update();
                    }
                }
            }, 100); // Small delay to ensure OrbitControls is initialized
        }
    }, [stage]);

    return (
        <div className="container" style={{ width: "100vw", height: "fit-content", background: "whitesmoke" }}>
            <Canvas
                camera={{ position: [8, 5, 8], fov: 45 }}
                shadows
                gl={{ preserveDrawingBuffer: true }}
                style={canvasStyle}
                id="roomCanvas"
            >
                <color attach="background" args={["#f5f5f5"]} />
                <fog attach="fog" args={["#f5f5f5", 20, 30]} />
                <Suspense fallback={null}>
                    <OrbitControls
                        ref={orbitControlsRef}
                        enableRotate={allowRotation}
                        enablePan={allowRotation}
                        enableZoom={true}
                        minDistance={4}
                        maxDistance={20}
                        target={[0, 1, 0]}
                        makeDefault
                    />
                    <CameraController view={view} />
                    <CameraZoomControls onRegisterZoomControls={handleRegisterZoomControls} />
                <Room 
                        width={dimensions.width}
                        length={dimensions.length}
                        height={dimensions.height}
                    view={view} 
                    stage={stage} 
                    selectedModel={selectedModel} 
                    layoutConfig={layoutConfig} 
                    onAddWardrobe={handleAddWardrobe}
                    activeWardrobe={activeWardrobe}
                    setActiveWardrobe={handleSetActiveWardrobe}
                />
                </Suspense>
            </Canvas>

            {/* <div className="camera">
                <button className="camera-btn" style={{ color: "black", background: "white", border: "black" }} onClick={handleCapture}>
                    <CameraIcon />
                </button>
            </div> */}

            <div className="view-controls">
                <button className={view === "orbit" ? "active" : ""} onClick={() => setView("orbit")}>
                    Orbit
                </button>
                <button className={view === "left" ? "active" : ""} onClick={() => setView("left")}>
                    Left Wall
                </button>
                <button className={view === "back" ? "active" : ""} onClick={() => setView("back")}>
                    Back Wall
                </button>
                <button className={view === "right" ? "active" : ""} onClick={() => setView("right")}>
                    Right Wall
                </button>
            </div>

            <div className="camera-controls">
                <button 
                    onClick={handleZoomIn} 
                    className="control-btn zoom-in"
                    aria-label="Zoom In"
                >
                    <PlusIcon />
                </button>
                <button 
                    onClick={handleZoomOut} 
                    className="control-btn zoom-out"
                    aria-label="Zoom Out"
                >
                    <MinusIcon />
                </button>
                <button 
                    onClick={handleResetView} 
                    className="control-btn reset"
                    aria-label="Reset View"
                >
                    <SyncIcon />
                </button>
                <button 
                    onClick={toggleRotation} 
                    className={`control-btn rotation ${allowRotation ? 'active' : ''}`}
                    aria-label="Toggle Rotation"
                >
                    <RotateIcon />
                </button>
                <button 
                    onClick={handleCapture}
                    className="control-btn camera"
                    aria-label="Take Screenshot"
                >
                    <CameraIcon />
                </button>
            </div>

            {stage === "size" && <SizeControls dimensions={dimensions} setDimensions={setDimensions} handleBuildWardrobes={handleBuildWardrobes} />}
            {stage === "wardrobe" && <WardrobeControls setStage={setStage} userName={userName} setUserName={setUserName} />}
            {stage === "style" && (
                <StyleWardrobes 
                    setStage={setStage} 
                    onSelectModel={handleSelectModel}
                    selectedHandle={selectedHandle}
                    setSelectedHandle={handleHandleChange}
                    hasActiveWardrobe={activeWardrobe !== null}
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
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={currentHistoryIndex > 0}
                    canRedo={currentHistoryIndex < layoutHistory.length - 1}
                    activeWardrobeType={activeWardrobeType}
                    storagePosition={selectedStoragePosition}
                    setStoragePosition={handleStoragePositionChange}
                    doorStyle={selectedDoorStyle}
                    setDoorStyle={handleDoorStyleChange}
                    onBack={handleBackFromStyle}
                />
            )}

            {stage === "preview" && (
                <ReviewPage
                    setStage={setStage}
                    selectedWardrobeColor={selectedWardrobeColor}
                    selectedHandleColor={selectedHandleColor}
                    selectedHandle={selectedHandle}
                    doorStyle={selectedDoorStyle} 
                    activeWardrobeType={activeWardrobeType}
                    roomDimensions={roomDimensions}
                    layoutConfig={layoutConfig}
                    activeWardrobeData={activeWardrobe ? {
                        modelType: getActiveModelType() || 0,
                        handleType: selectedHandle,
                        color: selectedWardrobeColor,
                        handleColor: selectedHandleColor,
                        handlePosition: selectedHandlePosition,
                        cabinetOption: selectedCabinetOption,
                        internalStorage: selectedInternalStorage,
                        internalStorageColor: selectedInternalStorageColor,
                        doorStyle: selectedDoorStyle
                    } : undefined}
                    totalPrice="1018.90"
                />
            )}

            {/* Add back button in review stage */}
            {stage === "preview" && (
                <button 
                    className="back-button" 
                    onClick={handleBackFromReview}
                >
                    <BackIcon />
                </button>
            )}
        </div>
    );
};

export default App;
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

const App = () => {
    const [view, setView] = useState("orbit");
    const [dimensions, setDimensions] = useState({ width: 5, length: 5, height: 2.4 });
    const [stage, setStage] = useState("size"); // "size" | "wardrobe" | "style"
    const [canvasStyle, setCanvasStyle] = useState({ width: "100%", height: "85vh" });
    const [userName, setUserName] = useState(""); // State to store the user's name
    // const [wardrobes, setWardrobes] = useState([]); // State to store wardrobes
    const [selectedModel, setSelectedModel] = useState<number | null>(null);

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

    const handleWallClick = (x: number, y: number, wall: string) => {
        // Logic to handle wall click and show wardrobe options
        console.log(`Wall clicked at x: ${x}, y: ${y} on ${wall} wall`);
        // Add logic to show wardrobe options and mount selected wardrobe
    };

    const handleSelectModel = (modelType: number) => {
        setSelectedModel(modelType);
    };  

    return (
        <div className="container" style={{ width: "100vw", height: "fit-content", background: "whitesmoke" }}>
            <Canvas className="canvas" style={canvasStyle}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} />
                <Room {...dimensions} view={view} stage={stage} selectedModel={selectedModel} />
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
            {stage === "style" && <StyleWardrobes setStage={setStage} onSelectModel={handleSelectModel} />}
        </div>
    );
};

export default App;
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { FaCamera } from "react-icons/fa";
import * as THREE from "three";
import "./index.css";

const CameraIcon = FaCamera as unknown as React.FC;

const Room = ({ width, length, height, view }: { width: number; length: number; height: number; view: string }) => {
    const material = new THREE.MeshStandardMaterial({ color: "white", side: THREE.DoubleSide });

    return (
        <>
            {/* Left Wall */}
            {view !== "right" && (
                <mesh position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <planeGeometry args={[length, height]} />
                    <meshStandardMaterial {...material} />
                </mesh>
            )}

            {/* Right Wall */}
            {view !== "left" && (
                <mesh position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
                    <planeGeometry args={[length, height]} />
                    <meshStandardMaterial {...material} />
                </mesh>
            )}

            {/* Back Wall */}
            <mesh position={[0, height / 2, -length / 2]}>
                <planeGeometry args={[width, height]} />
                <meshStandardMaterial {...material} />
            </mesh>

            {/* Floor */}
            <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[width, length]} />
                <meshStandardMaterial color="gray" side={THREE.DoubleSide} />
            </mesh>
        </>
    );
};

const CameraController = ({ view }: { view: string }) => {
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<any>(null);

    useEffect(() => {
        if (!cameraRef.current || !controlsRef.current) return;

        const distance = 15; // Fixed distance from the target
        const targetPosition = new THREE.Vector3();
        const lookAtPosition = new THREE.Vector3();

        switch (view) {
            case "left":
                targetPosition.set(distance, 5, 0);
                lookAtPosition.set(-5, 5, 0);
                break;
            case "right":
                targetPosition.set(-distance, 5, 0);
                lookAtPosition.set(5, 5, 0);
                break;
            case "back":
                targetPosition.set(0, 5, distance);
                lookAtPosition.set(0, 5, -5);
                break;
            default:
                targetPosition.set(distance, distance, distance);
                lookAtPosition.set(0, 5, 0);
        }

        const animateCamera = () => {
            if (!cameraRef.current) return;
            cameraRef.current.position.lerp(targetPosition, 0.05);
            cameraRef.current.lookAt(lookAtPosition);
            controlsRef.current.update();
            if (cameraRef.current.position.distanceTo(targetPosition) > 0.1) {
                requestAnimationFrame(animateCamera);
            }
        };

        animateCamera();
    }, [view]);

    return (
        <>
            <PerspectiveCamera ref={cameraRef} makeDefault position={[15, 15, 15]} />
            <OrbitControls ref={controlsRef} enableZoom={false} />
        </>
    );
};

const App = () => {
    const [view, setView] = useState("orbit");
    const [dimensions, setDimensions] = useState({ width: 5, length: 5, height: 2.4 });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDimensions((prev) => ({
            ...prev,
            [e.target.name]: parseFloat(e.target.value) || prev[e.target.name as keyof typeof prev],
        }));
    };

    const handleCapture = () => {
        const canvas = document.querySelector("canvas");
        if (canvas) {
            requestAnimationFrame(() => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = "capture.jpg";
                        link.click();
                    }
                }, "image/jpeg");
            });
        }
    };

    return (
        <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
            <Canvas style={{ width: "100%", background: "whitesmoke" }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} />
                <Room {...dimensions} view={view} />
                <CameraController view={view} />
            </Canvas>

            <div className="camera">
                <button style={{ color: "black", background: "white", border: "black" }} onClick={handleCapture}><CameraIcon /></button>
            </div>

            <div className="controls" style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                <button className={view === "orbit" ? "active" : ""} onClick={() => setView("orbit")}>Orbit</button>
                <button className={view === "left" ? "active" : ""} onClick={() => setView("left")}>Left Wall</button>
                <button className={view === "back" ? "active" : ""} onClick={() => setView("back")}>Back Wall</button>
                <button className={view === "right" ? "active" : ""} onClick={() => setView("right")}>Right Wall</button>
            </div>

            <div className="size-controls" style={{ padding: 10, background: "#ddd", display: "flex", justifyContent: "center", gap: "10px" }}>
                <label>
                    <span>Width:</span>
                    <input type="number" name="width" value={dimensions.width} onChange={handleInputChange} />
                </label>
                <label>
                    <span>Length:</span>
                    <input type="number" name="length" value={dimensions.length} onChange={handleInputChange} />
                </label>
                <label>
                    <span>Height:</span>
                    <input type="number" name="height" value={dimensions.height} onChange={handleInputChange} />
                </label>
            </div>
        </div>
    );
};

export default App;

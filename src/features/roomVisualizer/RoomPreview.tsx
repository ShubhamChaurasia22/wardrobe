import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { TransformControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { FaExclamationTriangle, FaCheck, FaSlidersH } from "react-icons/fa";
import WardrobeModel from "../../components/WardrobeModel";
import { ColorOption, InternalStorageType, StoragePosition, DoorStyle } from "../../types";
import "./RoomVisualizer.css";

const ExclamationIcon = FaExclamationTriangle as any;
const CheckIcon = FaCheck as any;
const SlidersIcon = FaSlidersH as any;

interface CameraGeometry {
    camera_pitch: number;
    camera_yaw: number;
    camera_roll: number;
    focal_length: number;
    fov: number;
    room_corners_3d?: number[][];
}

interface PlacementCoords {
    position: number[];
    rotation: number[];
    wall_snapped: string;
}

interface RoomPreviewProps {
    imageUrl: string;
    geometry: CameraGeometry;
    selectedWall: "leftWall" | "backWall" | "rightWall";
    initialPlacement: PlacementCoords;
    detections: any[];
    apiUrl: string;
    fileId: string;
    
    // Style configurations from user choice
    modelType: number;
    color: ColorOption;
    handleType: "none" | "straight" | "fancy" | "spherical";
    handleColor: ColorOption;
    handlePosition: "left" | "right";
    doorStyle: DoorStyle;
    cabinetOption: "none" | "cabinet-layout";
    internalStorage: InternalStorageType;
    internalStorageColor: ColorOption;
    
    onPlacementChange: (pos: number[], rot: number[]) => void;
}

interface SceneSetupProps {
    imageUrl: string;
    pitch: number;
    yaw: number;
    roll: number;
    height: number;
    fov: number;
}

// Subcomponent to load background texture and sync camera
const SceneSetup: React.FC<SceneSetupProps> = ({ imageUrl, pitch, yaw, roll, height, fov }) => {
    const { scene, camera } = useThree();

    useEffect(() => {
        // Load background room photo
        const loader = new THREE.TextureLoader();
        loader.load(imageUrl, (texture) => {
            scene.background = texture;
        });
    }, [imageUrl, scene]);

    useEffect(() => {
        // Set camera field of view and rotation
        if (camera instanceof THREE.PerspectiveCamera) {
            camera.fov = fov;
        }
        
        // Convert camera pitch, yaw, roll from degrees to radians
        const pitchRad = THREE.MathUtils.degToRad(pitch);
        const yawRad = THREE.MathUtils.degToRad(yaw);
        const rollRad = THREE.MathUtils.degToRad(roll);
        
        camera.rotation.set(pitchRad, yawRad, rollRad, "YXZ");
        
        // Position camera height (y) and distance (z)
        camera.position.set(0, height, 6.5);
        camera.updateProjectionMatrix();
    }, [pitch, yaw, roll, height, fov, camera]);

    return null;
};

const RoomPreview: React.FC<RoomPreviewProps> = ({
    imageUrl,
    geometry,
    selectedWall,
    initialPlacement,
    detections,
    apiUrl,
    fileId,
    modelType,
    color,
    handleType,
    handleColor,
    handlePosition,
    doorStyle,
    cabinetOption,
    internalStorage,
    internalStorageColor,
    onPlacementChange
}) => {
    const [target, setTarget] = useState<THREE.Group | null>(null);
    const transformRef = useRef<any>(null);
    
    const [position, setPosition] = useState<number[]>(initialPlacement.position);
    const [rotation, setRotation] = useState<number[]>(initialPlacement.rotation);
    const [collision, setCollision] = useState<string | null>(null);

    // Collapsible Camera Alignment Sliders state
    const [showPerspective, setShowPerspective] = useState(false);
    
    // Set level defaults (0 pitch/roll/yaw) to prevent skewed cartoon perspective
    const [cameraPitch, setCameraPitch] = useState<number>(0);
    const [cameraYaw, setCameraYaw] = useState<number>(0);
    const [cameraRoll, setCameraRoll] = useState<number>(0);
    const [cameraHeight, setCameraHeight] = useState<number>(1.5);
    const [cameraFov, setCameraFov] = useState<number>(60);

    // Controls transform mode: translate (Move) vs rotate (Rotate)
    const [transformMode, setTransformMode] = useState<"translate" | "rotate">("translate");

    // Run backend collision and snapping check on position update
    const checkCollisions = async (pos: number[]) => {
        try {
            const response = await fetch(`${apiUrl}/visualizer/place-wardrobe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    file_id: fileId,
                    wardrobe_dimensions: {
                        width: modelType === 3 ? 1.0 : 0.6, // double door is 1m, single is 0.6m
                        height: 2.4,
                        depth: 0.6
                    },
                    detections: detections,
                    geometry: {
                        camera_pitch: cameraPitch,
                        camera_yaw: cameraYaw,
                        camera_roll: cameraRoll,
                        fov: cameraFov,
                        focal_length: geometry.focal_length
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                // If there's a primary recommendation and it's not a collision
                if (!data.success && data.message) {
                    setCollision(data.message);
                } else {
                    setCollision(null);
                }
            }
        } catch (e) {
            console.error("Collision check failed", e);
        }
    };

    const handleObjectChange = () => {
        if (target) {
            const pos = target.position;
            const rot = target.rotation;
            const newPos = [pos.x, pos.y, pos.z];
            const newRot = [rot.x, rot.y, rot.z];
            
            setPosition(newPos);
            setRotation(newRot);
            
            onPlacementChange(newPos, newRot);
            checkCollisions(newPos);
        }
    };

    const resetPerspective = () => {
        setCameraPitch(0);
        setCameraYaw(0);
        setCameraRoll(0);
        setCameraHeight(1.5);
        setCameraFov(60);
    };

    return (
        <div className="preview-canvas-container">
            <div className="preview-header-bar">
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <h3>3D Wardrobe Placement</h3>
                    
                    {/* Transform Mode toggle segment control */}
                    <div className="mode-toggle-group">
                        <button 
                            className={`mode-btn ${transformMode === "translate" ? "active" : ""}`}
                            onClick={() => setTransformMode("translate")}
                            type="button"
                        >
                            ↔ Move
                        </button>
                        <button 
                            className={`mode-btn ${transformMode === "rotate" ? "active" : ""}`}
                            onClick={() => setTransformMode("rotate")}
                            type="button"
                        >
                            ⟳ Rotate
                        </button>
                    </div>

                    <button 
                        className="adjust-perspective-toggle-btn"
                        onClick={() => setShowPerspective(!showPerspective)}
                        type="button"
                    >
                        <SlidersIcon /> Align Perspective
                    </button>
                </div>
                {collision ? (
                    <div className="collision-badge warning">
                        <ExclamationIcon />
                        <span>Collision Alert: {collision}</span>
                    </div>
                ) : (
                    <div className="collision-badge success">
                        <CheckIcon />
                        <span>Position Optimal</span>
                    </div>
                )}
            </div>

            <div className="canvas-wrapper" style={{ width: "100%", height: "65vh", position: "relative" }}>
                <Canvas shadows gl={{ preserveDrawingBuffer: true }}>
                    <SceneSetup 
                        imageUrl={imageUrl} 
                        pitch={cameraPitch} 
                        yaw={cameraYaw} 
                        roll={cameraRoll} 
                        height={cameraHeight} 
                        fov={cameraFov} 
                    />
                    
                    {/* Soft hemisphere room lighting */}
                    <hemisphereLight 
                        color={"#ffffff"} 
                        groundColor={"#e2e8f0"} 
                        intensity={0.45} 
                    />
                    
                    {/* Main directional light matching room light direction */}
                    <directionalLight 
                        position={[-6, 8, 4]} 
                        intensity={1.3} 
                        castShadow 
                        shadow-mapSize-width={2048}
                        shadow-mapSize-height={2048}
                        shadow-bias={-0.00005}
                    />

                    {/* Camera headlight to fill in shadows and illuminate front faces of doors */}
                    <directionalLight 
                        position={[0, 2, 6]} 
                        intensity={0.35} 
                    />
                    
                    {/* Add soft ambient contact shadows directly on the floor */}
                    <ContactShadows 
                        position={[0, 0.01, 0]} 
                        opacity={0.65} 
                        scale={12} 
                        blur={2.2} 
                        far={2.5} 
                    />
                    
                    <Suspense fallback={null}>
                        <group 
                            ref={setTarget} 
                            position={new THREE.Vector3(position[0], position[1], position[2])}
                            rotation={new THREE.Euler(rotation[0], rotation[1], rotation[2])}
                        >
                            <WardrobeModel 
                                modelType={modelType}
                                height={2.4}
                                handleType={handleType}
                                isActive={true}
                                color={color}
                                handleColor={handleColor}
                                handlePosition={handlePosition}
                                cabinetOption={cabinetOption}
                                internalStorage={internalStorage}
                                wallPosition={selectedWall}
                                internalStorageColor={internalStorageColor}
                                storagePosition="middle"
                                doorStyle={doorStyle}
                            />
                        </group>
                    </Suspense>

                    {/* Enable Translate (Move) or Rotate with restriction to vertical Y axis */}
                    {target && (
                        <TransformControls 
                            ref={transformRef}
                            object={target}
                            mode={transformMode}
                            showY={transformMode === "rotate"} // restrict rotation to vertical Y (heading) axis only
                            showX={transformMode === "translate"}
                            showZ={transformMode === "translate"}
                            size={0.75} // Cleaner, smaller gizmo size
                            onChange={handleObjectChange}
                        />
                    )}
                </Canvas>
                
                <div className="drag-tip-overlay">
                    <p>
                        {transformMode === "translate" 
                            ? "Use arrows to slide the wardrobe along the floor." 
                            : "Use the green ring to rotate the wardrobe facing angle."}
                    </p>
                </div>

                {/* Collapsible Perspective Setup Slider Drawer */}
                {showPerspective && (
                    <div className="perspective-controls-drawer">
                        <div className="controls-drawer-header">
                            <h4>Fine-tune Camera Perspective Alignment</h4>
                            <button className="reset-perspective-btn" onClick={resetPerspective} type="button">
                                Reset to Level
                            </button>
                        </div>
                        <div className="sliders-grid">
                            <div className="slider-item">
                                <label>Height (m): <span>{cameraHeight.toFixed(1)}m</span></label>
                                <input 
                                    type="range" 
                                    min="0.5" 
                                    max="3.0" 
                                    step="0.1" 
                                    value={cameraHeight} 
                                    onChange={(e) => setCameraHeight(parseFloat(e.target.value))} 
                                />
                            </div>
                            <div className="slider-item">
                                <label>Pitch (Tilt Up/Down): <span>{cameraPitch}°</span></label>
                                <input 
                                    type="range" 
                                    min="-25" 
                                    max="25" 
                                    step="1" 
                                    value={cameraPitch} 
                                    onChange={(e) => setCameraPitch(parseInt(e.target.value))} 
                                />
                            </div>
                            <div className="slider-item">
                                <label>Yaw (Pan Left/Right): <span>{cameraYaw}°</span></label>
                                <input 
                                    type="range" 
                                    min="-25" 
                                    max="25" 
                                    step="1" 
                                    value={cameraYaw} 
                                    onChange={(e) => setCameraYaw(parseInt(e.target.value))} 
                                />
                            </div>
                            <div className="slider-item">
                                <label>Roll (Tilt Sideways): <span>{cameraRoll}°</span></label>
                                <input 
                                    type="range" 
                                    min="-10" 
                                    max="10" 
                                    step="1" 
                                    value={cameraRoll} 
                                    onChange={(e) => setCameraRoll(parseInt(e.target.value))} 
                                />
                            </div>
                            <div className="slider-item">
                                <label>Lens Zoom (FOV): <span>{cameraFov}°</span></label>
                                <input 
                                    type="range" 
                                    min="35" 
                                    max="85" 
                                    step="1" 
                                    value={cameraFov} 
                                    onChange={(e) => setCameraFov(parseInt(e.target.value))} 
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomPreview;

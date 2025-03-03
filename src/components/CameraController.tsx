import React, { useRef, useEffect } from "react";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useFrame as useThreeFrame } from "@react-three/fiber";

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

export default CameraController;


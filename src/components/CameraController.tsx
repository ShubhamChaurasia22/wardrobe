import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

interface CameraControllerProps {
    view: "orbit" | "left" | "back" | "right";
}

const CameraController = ({ view }: CameraControllerProps) => {
    const { camera, controls } = useThree();
    const targetRef = useRef(new THREE.Vector3(0, 0, 0));
    const positionRef = useRef(new THREE.Vector3(0, 0, 0));
    const isTransitioningRef = useRef(false);
    
    // Calculate position based on view
    useEffect(() => {
        if (!camera) return;
        
        const newPosition = new THREE.Vector3();
        isTransitioningRef.current = true;
        
        switch (view) {
            case "left":
                // Position camera on right side looking at left wall
                newPosition.set(10, 3, 0);
                targetRef.current.set(-2, 1.5, 0);
                break;
            case "right":
                // Position camera on left side looking at right wall
                newPosition.set(-10, 3, 0);
                targetRef.current.set(2, 1.5, 0);
                break;
            case "back":
                // Position camera at front looking at back wall
                newPosition.set(0, 3, 10);
                targetRef.current.set(0, 1.5, -2);
                break;
            case "orbit":
            default:
                // Default/orbit view - looking at room from front-top-right corner
                newPosition.set(8, 5, 8);
                targetRef.current.set(0, 1.5, 0);
                break;
        }
        
        positionRef.current = newPosition;
        
        // Reset any existing orbit controls
        if (controls) {
            const orbitControls = controls as unknown as OrbitControls;
            
            // If we're changing views, disable rotation temporarily to allow the camera to move
            if (orbitControls.enableRotate) {
                const wasEnabled = orbitControls.enableRotate;
                orbitControls.enableRotate = false;
                orbitControls.enablePan = false;
                
                // Re-enable after the transition
                setTimeout(() => {
                    orbitControls.enableRotate = wasEnabled;
                    orbitControls.enablePan = wasEnabled;
                }, 600);
            }
            
            // Update the orbit controls target
            if (orbitControls.target) {
                orbitControls.target.copy(targetRef.current);
            }
        }
        
        // Set camera position and orientation immediately
        camera.position.copy(newPosition);
        camera.lookAt(targetRef.current);
        
        // Set a timer to end the transition state
        setTimeout(() => {
            isTransitioningRef.current = false;
        }, 500);
        
    }, [view, camera, controls]);
    
    // Smooth camera movement with improved interpolation
    useFrame(() => {
        // Only handle automatic camera movement when not in manual rotation mode
        const orbitControls = controls as unknown as OrbitControls;
        if (!orbitControls || !orbitControls.enableRotate || isTransitioningRef.current) {
            // Smoothly move the camera to the target position
            camera.position.lerp(positionRef.current, 0.08);
            
            // Calculate current look-at target
            const currentTarget = new THREE.Vector3();
            currentTarget.lerp(targetRef.current, 0.08);
            camera.lookAt(currentTarget);
            
            // Ensure camera up vector is maintained
            camera.up.set(0, 1, 0);
        }
    });
    
    return null;
};

export default CameraController;


import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const WardrobeModel = ({ modelType }: { modelType: number }) => {
    const createWardrobe = () => {
        const group = new THREE.Group();

        const material = new THREE.MeshStandardMaterial({ color: "brown" });

        // Create different wardrobe models based on modelType
        switch (modelType) {
            case 1:
                // Simple wardrobe with two doors
                const door1 = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.1), material);
                const door2 = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.1), material);
                door1.position.set(-0.55, 1, 0);
                door2.position.set(0.55, 1, 0);
                group.add(door1, door2);
                break;
            case 2:
                // Wardrobe with three doors
                const door3 = new THREE.Mesh(new THREE.BoxGeometry(0.66, 2, 0.1), material);
                const door4 = new THREE.Mesh(new THREE.BoxGeometry(0.66, 2, 0.1), material);
                const door5 = new THREE.Mesh(new THREE.BoxGeometry(0.66, 2, 0.1), material);
                door3.position.set(-0.75, 1, 0);
                door4.position.set(0, 1, 0);
                door5.position.set(0.75, 1, 0);
                group.add(door3, door4, door5);
                break;
            case 3:
                // Wardrobe with rounded corners
                const roundedDoor1 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2, 32), material);
                const roundedDoor2 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2, 32), material);
                roundedDoor1.position.set(-0.55, 1, 0);
                roundedDoor2.position.set(0.55, 1, 0);
                group.add(roundedDoor1, roundedDoor2);
                break;
            case 4:
                // Wardrobe with a pattern
                const patternMaterial = new THREE.MeshStandardMaterial({ color: "brown", wireframe: true });
                const patternDoor1 = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.1), patternMaterial);
                const patternDoor2 = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.1), patternMaterial);
                patternDoor1.position.set(-0.55, 1, 0);
                patternDoor2.position.set(0.55, 1, 0);
                group.add(patternDoor1, patternDoor2);
                break;
            // Add more cases for different wardrobe models
            default:
                break;
        }

        return group;
    };

    return (
        <Canvas style={{ width: "100%", height: "100px" }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} />
            <primitive object={createWardrobe()} />
            <OrbitControls enableZoom={false} />
        </Canvas>
    );
};

export default WardrobeModel;

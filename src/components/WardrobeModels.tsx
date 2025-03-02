import React, { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const WardrobeModel = ({ modelType }: { modelType: number }) => {
    const groupRef = useRef<THREE.Group>(new THREE.Group());
    const { scene } = useThree();

    useEffect(() => {
        const group = groupRef.current;
        const material = new THREE.MeshStandardMaterial({ color: "brown" });

        // Clear previous children
        group.clear();

        // Create different wardrobe models based on modelType
        switch (modelType) {
            case 1:
                // Single door wardrobe
                const singleDoor = new THREE.Mesh(new THREE.BoxGeometry(1, 2.4, 0.1), material);
                singleDoor.position.set(0, 1.2, 0);
                group.add(singleDoor);
                break;
            case 2:
                // Double door wardrobe
                const door1 = new THREE.Mesh(new THREE.BoxGeometry(1, 2.4, 0.1), material);
                const door2 = new THREE.Mesh(new THREE.BoxGeometry(1, 2.4, 0.1), material);
                door1.position.set(-0.55, 1.2, 0);
                door2.position.set(0.55, 1.2, 0);
                group.add(door1, door2);
                break;
            case 3:
                // Single block wardrobe
                const singleBlock = new THREE.Mesh(new THREE.BoxGeometry(1, 2.4, 1), material);
                singleBlock.position.set(0, 1.2, 0);
                group.add(singleBlock);
                break;
            default:
                break;
        }

        scene.add(group);

        return () => {
            scene.remove(group);
        };
    }, [modelType, scene]);

    return <primitive object={groupRef.current} />;
};

export default WardrobeModel;
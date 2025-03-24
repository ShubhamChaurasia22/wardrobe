import React, { useState, useEffect, useCallback } from "react";
import CustomTabs from "./CustomTabs";
import { ColorOption, InternalStorageType, StoragePosition, DoorStyle } from '../types';
import './StyleWardrobes.css';

interface StyleWardrobesProps {
    setStage: (stage: "size" | "wardrobe" | "style" | "preview") => void;
    onSelectModel: (modelType: number, handleType?: 'none' | 'straight' | 'fancy' | 'spherical') => void;
    selectedHandle: 'none' | 'straight' | 'fancy' | 'spherical';
    setSelectedHandle: (handleType: 'none' | 'straight' | 'fancy' | 'spherical') => void;
    hasActiveWardrobe: boolean;
    onSelectWardrobeColor: (option: ColorOption) => void;
    onSelectHandleColor: (option: ColorOption) => void;
    selectedWardrobeColor: ColorOption;
    selectedHandleColor: ColorOption;
    handlePosition: 'left' | 'right';
    setHandlePosition: (position: 'left' | 'right') => void;
    cabinetOption: 'none' | 'cabinet-layout';
    setCabinetOption: (option: 'none' | 'cabinet-layout') => void;
    internalStorage: InternalStorageType;
    setInternalStorage: (storage: InternalStorageType) => void;
    selectedInternalStorageColor: ColorOption;
    onSelectInternalStorageColor: (option: ColorOption) => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    activeWardrobeType: number | null;
    storagePosition: StoragePosition;
    setStoragePosition: (position: StoragePosition) => void;
    doorStyle?: DoorStyle;
    setDoorStyle?: (style: DoorStyle) => void;
    onBack?: () => void;
}

const StyleWardrobes = ({ 
    setStage,
    onSelectModel,
    selectedHandle,
    setSelectedHandle,
    hasActiveWardrobe,
    onSelectWardrobeColor,
    onSelectHandleColor,
    selectedWardrobeColor,
    selectedHandleColor,
    handlePosition,
    setHandlePosition,
    cabinetOption,
    setCabinetOption,
    internalStorage,
    setInternalStorage,
    selectedInternalStorageColor,
    onSelectInternalStorageColor,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    activeWardrobeType,
    storagePosition,
    setStoragePosition,
    doorStyle = 'panel-shaker',
    setDoorStyle,
    onBack
}: StyleWardrobesProps) => {
    const [activeTab, setActiveTab] = useState("doors");
    const [selectedOption, setSelectedOption] = useState<number>(3); // Set default to Double Door (3)
    const [internalDoorStyle, setInternalDoorStyle] = useState<DoorStyle>('panel-shaker');
    const [totalPrice, setTotalPrice] = useState("1018.90");

    // Wrap callbacks in useCallback to prevent unnecessary re-renders
    const selectModel = useCallback((modelType: number, handleType?: 'none' | 'straight' | 'fancy' | 'spherical') => {
        onSelectModel(modelType, handleType || selectedHandle);
    }, [onSelectModel, selectedHandle]);

    useEffect(() => {
        // Initialize the component with default selection
        selectModel(3); // Default to Double Door (3)
        
        // Force the component to show both tabs at start
        setTimeout(() => {
            const tabElements = document.querySelectorAll('.custom-tab');
            tabElements.forEach(tab => {
                if (tab) {
                    (tab as HTMLElement).style.display = 'block';
                }
            });
        }, 100);
    }, [selectModel]); // Now correctly depends on selectModel

    const handleSetSelectedOption = (value: number | null) => {
        console.log("Setting selected option to:", value);
        if (value !== null) {
            setSelectedOption(value);
            onSelectModel(value, selectedHandle);
        }
    };

    const handleSetDoorStyle = (style: DoorStyle) => {
        if (setDoorStyle) {
            setDoorStyle(style);
        } else {
            setInternalDoorStyle(style);
        }
    };

    const handleNext = () => {
        setStage("preview");
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            setStage("wardrobe");
        }
    };

    // Calculate price based on selections
    useEffect(() => {
        // Simple pricing model for demonstration
        let price = 0;
        
        // Base price by wardrobe type
        if (activeWardrobeType === 1) price += 500; // Single door
        if (activeWardrobeType === 2) price += 400; // Storage block
        if (activeWardrobeType === 3) price += 900; // Double door
        
        // Add premium for certain door styles
        if (doorStyle === 'panel-eclipse') price += 100;
        if (doorStyle === 'estoril') price += 150;
        
        // Add premium for handle type
        if (selectedHandle === 'fancy') price += 30;
        if (selectedHandle === 'spherical') price += 50;
        
        // Format the price
        setTotalPrice(price.toFixed(2));
    }, [activeWardrobeType, doorStyle, selectedHandle]);

    const currentDoorStyle = doorStyle || internalDoorStyle;

    return (
        <div className="style-wardrobes">
            <CustomTabs 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                onSelectModel={onSelectModel}
                selectedHandle={selectedHandle}
                setSelectedHandle={setSelectedHandle}
                selectedOption={selectedOption}
                setSelectedOption={handleSetSelectedOption}
                hasActiveWardrobe={hasActiveWardrobe}
                onSelectWardrobeColor={onSelectWardrobeColor}
                onSelectHandleColor={onSelectHandleColor}
                selectedWardrobeColor={selectedWardrobeColor}
                selectedHandleColor={selectedHandleColor}
                handlePosition={handlePosition}
                setHandlePosition={setHandlePosition}
                cabinetOption={cabinetOption}
                setCabinetOption={setCabinetOption}
                internalStorage={internalStorage}
                setInternalStorage={setInternalStorage}
                selectedInternalStorageColor={selectedInternalStorageColor}
                onSelectInternalStorageColor={onSelectInternalStorageColor}
                activeWardrobeType={activeWardrobeType}
                storagePosition={storagePosition}
                setStoragePosition={setStoragePosition}
                doorStyle={currentDoorStyle}
                setDoorStyle={handleSetDoorStyle}
            />
            
            <div className="action-area">
                <div className="action-buttons">
                    <button className="action-button build-button" onClick={handleBack}>
                        Back
                    </button>
                    <button className="action-button review-button" onClick={handleNext}>
                        Review
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StyleWardrobes;
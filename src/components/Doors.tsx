import React, { useEffect } from "react";
import { DoorStyle, InternalStorageType, StoragePosition } from '../types';
import { doorImages, handleImages } from '../utils/assetImports';
import './Doors.css';

interface DoorsProps {
    onSelectModel: (modelType: number, handleType?: 'none' | 'straight' | 'fancy' | 'spherical') => void;
    selectedHandle: 'none' | 'straight' | 'fancy' | 'spherical';
    setSelectedHandle: (handleType: 'none' | 'straight' | 'fancy' | 'spherical') => void;
    selectedOption: number | null;
    setSelectedOption: (id: number | null) => void;
    hasActiveWardrobe: boolean;
    handlePosition: 'left' | 'right';
    setHandlePosition: (position: 'left' | 'right') => void;
    cabinetOption: 'none' | 'cabinet-layout';
    setCabinetOption: (option: 'none' | 'cabinet-layout') => void;
    internalStorage: InternalStorageType;
    setInternalStorage: (storage: InternalStorageType) => void;
    activeWardrobeType: number | null;
    storagePosition: StoragePosition;
    setStoragePosition: (position: StoragePosition) => void;
    doorStyle?: DoorStyle;
    setDoorStyle?: (style: DoorStyle) => void;
}

const Doors = ({ 
    onSelectModel, 
    selectedHandle, 
    setSelectedHandle, 
    selectedOption, 
    setSelectedOption,
    hasActiveWardrobe,
    handlePosition,
    setHandlePosition,
    cabinetOption,
    setCabinetOption,
    internalStorage,
    setInternalStorage,
    activeWardrobeType,
    storagePosition,
    setStoragePosition,
    doorStyle = 'panel-shaker',
    setDoorStyle
}: DoorsProps) => {
    // Initialize model selection if needed
    useEffect(() => {
        // Always select Double Door (type 3) as default when component mounts
        console.log("Doors component mounted. Setting default wardrobe option to Double Door (3)");
        
        // Set the visual selection in the UI
        setSelectedOption(3);
        
        // Inform parent component about the selection
        onSelectModel(3, selectedHandle);
        
    // We only want this to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Set default storage position for storage block
    useEffect(() => {
        if (activeWardrobeType === 2) {
            setStoragePosition('middle');
        }
    }, [activeWardrobeType, setStoragePosition]);

    // Add helper function to check if current wardrobe is double door
    const isDoubleDoor = activeWardrobeType === 3;

    const doorStyleOptions = [
        { id: 'panel-shaker' as const, name: "1 Panel Shaker", image: doorImages.panelShaker },
        { id: 'panel-eclipse' as const, name: "4 Panel Eclipse", image: doorImages.panelEclipse },
        { id: 'estoril' as const, name: "Estoril", image: doorImages.estoril },
        { id: 'santana' as const, name: "Santana", image: doorImages.santana }
    ];

    const handleOptions = [
        { id: 'none' as const, name: "No Handle", icon: "⊘" },
        { id: 'straight' as const, name: "Straight", icon: "│" },
        { id: 'fancy' as const, name: "Fancy", icon: "⏦" },
        { id: 'spherical' as const, name: "Spherical", icon: "⬤" }
    ];

    const handlePositionOptions = [
        { id: 'left', name: "Left" },
        { id: 'right', name: "Right" },
    ];

    // Include all three wardrobe types: Single Door, Storage Block, and Double Door
    const wardrobeOptions = [
        { 
            id: 1,
            name: "Single Door", 
            image: "https://img.icons8.com/material-outlined/96/000000/cupboard.png"
        },
        { 
            id: 2,
            name: "Storage Block", 
            image: "https://img.icons8.com/material-outlined/96/000000/drawer.png",
        },
        { 
            id: 3,
            name: "Double Door", 
            image: "https://img.icons8.com/material-outlined/96/000000/empty-wardrobe.png"
        }
    ];

    const handleSelectOption = (id: number) => {
        setSelectedOption(id);
        onSelectModel(id, selectedHandle);
    };

    const handleSelectHandle = (handleType: 'none' | 'straight' | 'fancy' | 'spherical') => {
        if (hasActiveWardrobe) {
            setSelectedHandle(handleType);
        }
    };

    const handleSelectDoorStyle = (style: DoorStyle) => {
        if (hasActiveWardrobe && setDoorStyle) {
            setDoorStyle(style);
        }
    };

    // Force re-render on component mount to ensure all options are visible
    useEffect(() => {
        const forceRerender = () => {
            console.log("Forcing style elements to be visible");
            const styleElements = document.querySelectorAll('.section-title');
            styleElements.forEach(el => {
                if (el) {
                    (el as HTMLElement).style.display = 'block';
                }
            });
        };
        
        // Run immediately and after a short delay to handle various loading conditions
        forceRerender();
        setTimeout(forceRerender, 100);
        setTimeout(forceRerender, 500);
    }, []);

    return (
        <div className="doors-container">
            <div className="section-title">Wardrobe Type</div>
            <div className="wardrobe-options">
                {wardrobeOptions.map((option) => (
                    <div
                        key={option.id}
                        className={`wardrobe-option ${
                            selectedOption === option.id ? "selected" : ""
                        }`}
                        onClick={() => handleSelectOption(option.id)}
                    >
                        <img src={option.image} alt={option.name} />
                        <div className="option-name">{option.name}</div>
                    </div>
                ))}
            </div>

            <div className="section-title">Door Style</div>
            <div className="door-style-options">
                {doorStyleOptions.map((style) => (
                    <div
                        key={style.id}
                        className={`door-style-option ${
                            !hasActiveWardrobe ? "disabled" : ""
                        } ${doorStyle === style.id ? "selected" : ""}`}
                        onClick={() => hasActiveWardrobe && handleSelectDoorStyle(style.id)}
                    >
                        <img src={style.image} alt={style.name} />
                        <span>{style.name}</span>
                    </div>
                ))}
            </div>

            <div className="section-title">Handle Style</div>
            <div className="handle-style-options">
                {handleOptions.map((option) => (
                    <div 
                        key={option.id}
                        className={`handle-style-option ${!hasActiveWardrobe ? "disabled" : ""} ${selectedHandle === option.id ? "selected" : ""}`}
                        onClick={() => hasActiveWardrobe && handleSelectHandle(option.id)}
                    >
                        <div className="handle-icon">{option.icon}</div>
                        <span>{option.name}</span>
                    </div>
                ))}
            </div>

            {selectedHandle !== 'none' && (
                <>
                    <div className="section-title">Handle Position</div>
                    <div className="handle-position-options">
                        {handlePositionOptions.map((position) => (
                            <div
                                key={position.id}
                                className={`handle-position-option ${
                                    hasActiveWardrobe && !isDoubleDoor ? "enabled" : ""
                                } ${handlePosition === position.id ? "selected" : ""}`}
                                onClick={() => 
                                    hasActiveWardrobe && 
                                    !isDoubleDoor && 
                                    setHandlePosition(position.id as 'left' | 'right')
                                }
                            >
                                {position.name}
                                {(!hasActiveWardrobe || isDoubleDoor) && (
                                    <span className="select-wardrobe-message">
                                        {!hasActiveWardrobe 
                                            ? "Select a wardrobe first"
                                            : "Handle position not available for double door"}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Doors;
import React from "react";
import { InternalStorageType } from '../types';

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
    setInternalStorage
}: DoorsProps) => {
    const wardrobeOptions = [
        { 
            id: 1, 
            name: "Single Door", 
            image: "https://cdn-icons-png.flaticon.com/512/607/607050.png"
        },
        // { 
        //     id: 2, // Use id 3 since 2 is for storage block
        //     name: "Storage Block", 
        //     image: "https://cdn-icons-png.flaticon.com/512/1198/1198460.png"
        // },
        { 
            id: 3, // Use id 3 since 2 is for storage block
            name: "Double Door", 
            image: "https://cdn-icons-png.flaticon.com/512/1198/1198460.png"
        }
    ];

    const handleOptions = [
        { id: 'none' as const, name: "No Handle" },
        { id: 'straight' as const, name: "Straight Handle" },
        { id: 'fancy' as const, name: "Fancy Handle" },
        { id: 'spherical' as const, name: "Spherical Handle" },
    ] as const;

    const handlePositionOptions = [
        { id: 'left', name: "Left" },
        { id: 'right', name: "Right" },
    ];

    const cabinetOptions = [
        { id: 'none' as const, name: "None" },
        { id: 'cabinet-layout' as const, name: "Cabinet Layout" }
    ];

    const internalStorageOptions = [
        { id: 'long-hanging' as const, name: "Long Hanging" },
        { id: 'hanging-rail-double-shelf' as const, name: "Hanging Rail Double Shelf" },
        { id: 'double-hanging-rail' as const, name: "Double Hanging Rail" },
        { id: 'six-shelves' as const, name: "6 Shelves" },
        { id: 'rail-shelf-1-drawer' as const, name: "Rail Shelf 1 Drawer" },
        { id: 'rail-shelf-2-drawer' as const, name: "Rail Shelf 2 Drawer" },
        { id: 'rail-shelf-3-drawer' as const, name: "Rail Shelf 3 Drawer" }
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

    return (
        <div>
            <div className="section-title">Wardrobe Style</div>
            <div className="wardrobe-options">
                {wardrobeOptions.map((option) => (
                    <div
                        key={option.id}
                        className={`wardrobe-option ${selectedOption === option.id ? "selected" : ""}`}
                        onClick={() => handleSelectOption(option.id)}
                        style={{ 
                            border: selectedOption === option.id ? "2px solid #e38c6e" : "none", 
                            width: "6rem", 
                            height: "6rem",
                            position: "relative",
                            overflow: "hidden"
                        }}
                    >
                        <img 
                            src={option.image} 
                            alt={option.name}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover"
                            }}
                        />
                        <p style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: "rgba(0,0,0,0.7)",
                            color: "white",
                            margin: 0,
                            padding: "4px",
                            fontSize: "0.8rem",
                            textAlign: "center"
                        }}>
                            {option.name}
                        </p>
                    </div>
                ))}
            </div>

            <div className="section-title">Handle Style</div>
            <div className="handle-options">
                {handleOptions.map((handle) => (
                    <div
                        key={handle.id}
                        className={`handle-option ${hasActiveWardrobe ? "enabled" : ""} ${
                            selectedHandle === handle.id ? "selected" : ""
                        }`}
                        onClick={() => handleSelectHandle(handle.id)}
                        style={{ 
                            padding: "1rem",
                            borderRadius: "8px",
                            cursor: hasActiveWardrobe ? "pointer" : "not-allowed"
                        }}
                    >
                        <p>{handle.name}</p>
                        {!hasActiveWardrobe && (
                            <p className="select-wardrobe-message">
                                Select a wardrobe first
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <div className="section-title">Position of Handle</div>
            <div className="handle-position-options">
                {handlePositionOptions.map((position) => (
                    <div
                        key={position.id}
                        className={`handle-position-option ${hasActiveWardrobe ? "enabled" : ""} ${
                            handlePosition === position.id ? "selected" : ""
                        }`}
                        onClick={() => hasActiveWardrobe && setHandlePosition(position.id as 'left' | 'right')}
                        style={{ 
                            padding: "1rem",
                            borderRadius: "8px",
                            cursor: hasActiveWardrobe ? "pointer" : "not-allowed",
                            border: handlePosition === position.id ? "2px solid #e38c6e" : "none"
                        }}
                    >
                        <p>{position.name}</p>
                        {!hasActiveWardrobe && (
                            <p className="select-wardrobe-message">
                                Select a wardrobe first
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <div className="section-title">Cabinet Options</div>
            <div className="cabinet-options">
                {cabinetOptions.map((option) => (
                    <div
                        key={option.id}
                        className={`cabinet-option ${hasActiveWardrobe ? "enabled" : ""} ${
                            cabinetOption === option.id ? "selected" : ""
                        }`}
                        onClick={() => hasActiveWardrobe && setCabinetOption(option.id)}
                    >
                        <p>{option.name}</p>
                        {!hasActiveWardrobe && (
                            <p className="select-wardrobe-message">
                                Select a wardrobe first
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <div className="section-title">Internal Storage</div>
            <div className="internal-storage-options">
                {internalStorageOptions.map((option) => (
                    <div
                        key={option.id}
                        className={`internal-storage-option ${
                            hasActiveWardrobe && cabinetOption === 'cabinet-layout' ? "enabled" : ""
                        } ${internalStorage === option.id ? "selected" : ""}`}
                        onClick={() => 
                            hasActiveWardrobe && 
                            cabinetOption === 'cabinet-layout' && 
                            setInternalStorage(option.id)
                        }
                    >
                        <p>{option.name}</p>
                        {(!hasActiveWardrobe || cabinetOption !== 'cabinet-layout') && (
                            <p className="select-wardrobe-message">
                                {!hasActiveWardrobe 
                                    ? "Select a wardrobe first" 
                                    : "Enable cabinet layout first"}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Doors;
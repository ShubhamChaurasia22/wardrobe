import React from "react";

interface DoorsProps {
    onSelectModel: (modelType: number, handleType?: 'none' | 'straight' | 'fancy' | 'spherical') => void;
    selectedHandle: 'none' | 'straight' | 'fancy' | 'spherical';
    setSelectedHandle: (handleType: 'none' | 'straight' | 'fancy' | 'spherical') => void;
    selectedOption: number | null;
    setSelectedOption: (id: number | null) => void;
    hasActiveWardrobe: boolean;
}

const Doors = ({ 
    onSelectModel, 
    selectedHandle, 
    setSelectedHandle, 
    selectedOption, 
    setSelectedOption,
    hasActiveWardrobe 
}: DoorsProps) => {
    const wardrobeOptions = [
        { id: 1, name: "Single Door" },
        { id: 2, name: "Double Door" },
        { id: 3, name: "Single Block" },
    ];

    const handleOptions = [
        { id: 'none' as const, name: "No Handle" },
        { id: 'straight' as const, name: "Straight Handle" },
        { id: 'fancy' as const, name: "Fancy Handle" },
        { id: 'spherical' as const, name: "Spherical Handle" },
    ] as const;

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
                            height: "6rem" 
                        }}
                    >
                        <p>{option.name}</p>
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
        </div>
    );
};

export default Doors;
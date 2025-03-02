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
        { 
            id: 1, 
            name: "Single Door", 
            image: "https://www.tomeasure.co.uk/wp-content/themes/hello-theme-child-master/configurator-library/assets/thumbnails/door_styles/cairo_door_style_thumbnail.jpg"
        },
        { 
            id: 2, 
            name: "Storage Block", 
            image: "https://www.tomeasure.co.uk/wp-content/themes/hello-theme-child-master/configurator-library/assets/thumbnails/door_styles/cairo_door_style_thumbnail.jpg"
        }
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
        </div>
    );
};

export default Doors;
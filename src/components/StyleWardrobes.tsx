import React, { useState, useEffect } from "react";
import CustomTabs from "./CustomTabs";

interface StyleWardrobesProps {
    setStage: (stage: string) => void;
    onSelectModel: (modelType: number, handleType?: 'none' | 'straight' | 'fancy' | 'spherical') => void;
    selectedHandle: 'none' | 'straight' | 'fancy' | 'spherical';
    setSelectedHandle: (handleType: 'none' | 'straight' | 'fancy' | 'spherical') => void;
    hasActiveWardrobe: boolean;
}

const StyleWardrobes = ({ 
    setStage, 
    onSelectModel, 
    selectedHandle, 
    setSelectedHandle,
    hasActiveWardrobe 
}: StyleWardrobesProps) => {
    const [activeTab, setActiveTab] = useState("doors");
    const [selectedOption, setSelectedOption] = useState<number>(1); // Set default to single door (1)

    // Set default selection when component mounts
    useEffect(() => {
        onSelectModel(1, 'straight'); // Select single door with straight handle by default
    }, [onSelectModel]);

    // Create a handler function for setSelectedOption
    const handleSetSelectedOption = (value: number | null) => {
        if (value !== null) {
            setSelectedOption(value);
        }
    };

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
            />

            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }} className="buttons">
                <button 
                    style={{ width: "45%", padding: "10px", color: "white", background: "#374b40", border: "1px solid #eee", textWrap: "nowrap", borderRadius: "35px" }} 
                    onClick={() => setStage("wardrobe")}
                >
                    Previous
                </button>
                <button 
                    style={{ width: "45%", padding: "10px", color: "white", background: "#e38c6e", border: "1px solid #eee", textWrap: "nowrap", borderRadius: "35px" }} 
                    onClick={() => setStage("nextStage")}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default StyleWardrobes;
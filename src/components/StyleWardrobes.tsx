import React, { useState, useEffect } from "react";
import CustomTabs from "./CustomTabs";
import { ColorOption, InternalStorageType } from '../types';

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
    canRedo
}: StyleWardrobesProps) => {
    const [activeTab, setActiveTab] = useState("doors");
    const [selectedOption, setSelectedOption] = useState<number>(1);

    useEffect(() => {
        onSelectModel(1, 'straight');
    }, [onSelectModel]);

    const handleSetSelectedOption = (value: number | null) => {
        if (value !== null) {
            setSelectedOption(value);
        }
    };

    const handleNext = () => {
        setStage("preview");
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
            />

            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <button 
                    onClick={onUndo}
                    disabled={!canUndo}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: canUndo ? "#374b40" : "#ccc",
                        color: "white",
                        border: "none",
                        borderRadius: "35px",
                        cursor: canUndo ? "pointer" : "not-allowed"
                    }}
                >
                    Undo
                </button>
                <button 
                    onClick={onRedo}
                    disabled={!canRedo}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: canRedo ? "#374b40" : "#ccc",
                        color: "white",
                        border: "none",
                        borderRadius: "35px",
                        cursor: canRedo ? "pointer" : "not-allowed"
                    }}
                >
                    Redo
                </button>
            </div>

            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }} className="buttons">
                <button 
                    style={{ 
                        width: "45%", 
                        padding: "10px", 
                        color: "white", 
                        background: "#374b40", 
                        border: "1px solid #eee", 
                        textWrap: "nowrap", 
                        borderRadius: "35px" 
                    }} 
                    onClick={() => setStage("wardrobe")}
                >
                    Previous
                </button>
                <button 
                    onClick={handleNext}
                    style={{
                        width: "45%",
                        padding: "10px",
                        color: "white",
                        background: "#e38c6e",
                        border: "none",
                        borderRadius: "35px",
                        cursor: "pointer"
                    }}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default StyleWardrobes;
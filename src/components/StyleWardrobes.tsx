import React, { useState } from "react";
import CustomTabs from "./CustomTabs";

const StyleWardrobes = ({ setStage, onWallClick, onSelectModel }: any) => {
    const [activeTab, setActiveTab] = useState("doors");

    const handleWallClick = (x: number, y: number, wall: string) => {
        // Logic to handle wall click and show wardrobe options
        console.log(`Wall clicked at x: ${x}, y: ${y} on ${wall} wall`);
        onWallClick(x, y, wall);
    };

    return (
        <div className="style-wardrobes">
            <CustomTabs activeTab={activeTab} setActiveTab={setActiveTab} onSelectModel={onSelectModel} />
            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }} className="buttons">
                <button style={{ width: "45%", padding: "10px", color: "white", background: "#374b40", border: "1px solid #eee", textWrap: "nowrap", borderRadius: "35px" }} onClick={() => setStage("wardrobe")}>Previous</button>
                <button style={{ width: "45%", padding: "10px", color: "white", background: "#e38c6e", border: "1px solid #eee", textWrap: "nowrap", borderRadius: "35px" }} onClick={() => setStage("nextStage")}>Next</button>
            </div>
        </div>
    );
};

export default StyleWardrobes;
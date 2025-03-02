import React from "react";

const WardrobeControls = ({ setStage, userName, setUserName }: any) => {
    return (
        <div className="wardrobe-controls">
            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: "column" }}>
                <h2 style={{ margin: "0 auto" }}>Wardrobe For</h2>
                <div className="name-input-block" style={{ marginTop: "0.5rem", width: "100%" }}>
                    <input
                        type="text"
                        placeholder="Enter wardrobe owner's name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="name-input"
                    />
                </div>
            </div>
            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <button
                    style={{ width: "45%", padding: "10px", color: "white", background: "#374b40", border: "1px solid #eee", textWrap: "nowrap", borderRadius: "35px" }}
                    onClick={() => setStage("size")}
                >
                    Room Dimensions
                </button>
                <button
                    style={{ width: "45%", padding: "10px", color: "white", background: "#e38c6e", border: "1px solid #eee", textWrap: "nowrap", borderRadius: "35px" }}
                    onClick={() => setStage("style")}
                >
                    Style my Wardrobes
                </button>
            </div>
        </div>
    );
};

export default WardrobeControls;

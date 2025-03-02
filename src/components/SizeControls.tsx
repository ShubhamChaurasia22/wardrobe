import React from "react";

const SizeControls = ({ dimensions, setDimensions, setStage }: any) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        const name = e.target.name;
        const minValue = name === "width" || name === "length" ? 5 : 2.4;

        if (value >= minValue) {
            setDimensions((prev: any) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    return (
        <div className="size-controls">
            <div style={{ width: "100%", marginBottom: "1rem", display: "flex", justifyContent: "space-between" }}>
                {["width", "length", "height"].map((dim) => (
                    <label key={dim}>
                        {dim.charAt(0).toUpperCase() + dim.slice(1)}:
                        <div className="input-container">
                            <input
                                type="number"
                                name={dim}
                                value={dimensions[dim]}
                                onChange={handleChange}
                                min={dim === "width" || dim === "length" ? 5 : 2.4}
                                className="no-arrows"
                            />
                            <span className="unit">m</span>
                        </div>
                    </label>
                ))}
            </div>
            <button className="size-control-btn" onClick={() => setStage("wardrobe")}>Build my Wardrobes</button>
        </div>
    );
};

export default SizeControls;

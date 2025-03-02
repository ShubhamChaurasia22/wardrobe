import React from "react";

const Controls = ({ view, setView }: { view: string; setView: (view: string) => void }) => {
    return (
        <div className="controls">
            {["orbit", "left", "back", "right"].map((v) => (
                <button
                    key={v}
                    className={`control-btn ${view === v ? "active" : ""}`}
                    onClick={() => setView(v)}
                >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
            ))}
        </div>
    );
};

export default Controls;

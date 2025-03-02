import React from "react";

const StyleConfig = ({ styleConfig, setStyleConfig }: { styleConfig: any; setStyleConfig: (config: any) => void }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setStyleConfig((prevConfig: any) => ({ ...prevConfig, [name]: value }));
    };

    return (
        <div className="style-config">
            <h3>Style Configuration</h3>
            <label>
                Wardrobe Type:
                <select name="wardrobeType" value={styleConfig.wardrobeType} onChange={handleChange}>
                    <option value="singleDoor">Single Door</option>
                    <option value="doubleDoor">Double Door</option>
                    <option value="singleBlock">Single Block</option>
                </select>
            </label>
            <label>
                Door Type:
                <select name="doorType" value={styleConfig.doorType} onChange={handleChange}>
                    <option value="cairo">Cairo</option>
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                </select>
            </label>
            <label>
                Handle Style:
                <select name="handleStyle" value={styleConfig.handleStyle} onChange={handleChange}>
                    <option value="block_handle_330">Block Handle 330</option>
                    <option value="round_handle_220">Round Handle 220</option>
                    <option value="square_handle_110">Square Handle 110</option>
                </select>
            </label>
            <label>
                Handle Material:
                <select name="handleMaterial" value={styleConfig.handleMaterial} onChange={handleChange}>
                    <option value="CP">CP</option>
                    <option value="SS">SS</option>
                    <option value="BR">BR</option>
                </select>
            </label>
            <label>
                Door Material:
                <select name="doorMaterial" value={styleConfig.doorMaterial} onChange={handleChange}>
                    <option value="heritageGreenSuperMatt">Heritage Green Super Matt</option>
                    <option value="whiteGloss">White Gloss</option>
                    <option value="oakWood">Oak Wood</option>
                </select>
            </label>
            <label>
                Interior Material:
                <select name="interiorMaterial" value={styleConfig.interiorMaterial} onChange={handleChange}>
                    <option value="premiumWhite">Premium White</option>
                    <option value="blackMatt">Black Matt</option>
                    <option value="walnutWood">Walnut Wood</option>
                </select>
            </label>
        </div>
    );
};

export default StyleConfig;
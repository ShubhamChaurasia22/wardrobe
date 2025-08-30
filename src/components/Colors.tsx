import React from "react";
import { ColorOption } from "../types";
import "./Colors.css";

interface ColorsProps {
    onSelectWardrobeColor: (option: ColorOption) => void;
    onSelectHandleColor: (option: ColorOption) => void;
    onSelectInternalStorageColor: (option: ColorOption) => void;
    selectedWardrobeColor: ColorOption;
    selectedHandleColor: ColorOption;
    selectedInternalStorageColor: ColorOption;
    hasActiveWardrobe: boolean;
}

const Colors = ({ 
    onSelectWardrobeColor, 
    onSelectHandleColor, 
    onSelectInternalStorageColor,
    selectedWardrobeColor,
    selectedHandleColor,
    selectedInternalStorageColor,
    hasActiveWardrobe 
}: ColorsProps) => {
    const wardrobeColors = [
        {
            id: 'white',
            name: 'White',
            color: '#ffffff',
        },
        {
            id: 'black',
            name: 'Black',
            color: '#121212',
        },
        {
            id: 'sage-green',
            name: 'Sage Green',
            color: '#7d9b76',
        },
        {
            id: 'forest-green',
            name: 'Forest Green',
            color: '#2f4d3a',
        },
        {
            id: 'light-grey',
            name: 'Light Grey',
            color: '#d0d0d0',
        },
        {
            id: 'dark-grey',
            name: 'Dark Grey',
            color: '#505050',
        },
        {
            id: 'light-oak',
            name: 'Light Oak',
            color: '#deb887',
            texture: 'https://i.imgur.com/jmYBygK.jpg'
        },
        {
            id: 'oak',
            name: 'Oak',
            color: '#b8860b',
            texture: 'https://i.imgur.com/aYXbSJ5.jpg'
        },
        {
            id: 'walnut',
            name: 'Walnut',
            color: '#654321',
            texture: 'https://i.imgur.com/TFGBR42.jpg'
        },
        {
            id: 'rose-gold',
            name: 'Rose Gold',
            color: '#B76E79',
            isMetallic: true
        }
    ];

    const handleColors = [
        {
            id: 'chrome',
            name: 'Chrome',
            color: '#C0C0C0',
            isMetallic: true
        },
        {
            id: 'gold',
            name: 'Gold',
            color: '#FFD700',
            isMetallic: true
        },
        {
            id: 'bronze',
            name: 'Bronze',
            color: '#CD7F32',
            isMetallic: true
        },
        {
            id: 'black',
            name: 'Black',
            color: '#121212',
        },
        {
            id: 'forest-green',
            name: 'Forest Green',
            color: '#2f4d3a',
        },
        {
            id: 'white',
            name: 'White',
            color: '#ffffff',
        }
    ];

    return (
        <div className="colors-container">
            <div className="color-section">
                <h3 className="section-title">Wardrobe Color</h3>
                <div className="color-grid">
                    {wardrobeColors.map((option) => (
                        <div
                            key={option.id}
                            className={`color-tile ${
                                selectedWardrobeColor.id === option.id ? 'selected' : ''
                            } ${hasActiveWardrobe ? 'enabled' : ''}`}
                            onClick={() => hasActiveWardrobe && onSelectWardrobeColor(option)}
                        >
                            {option.texture ? (
                                <div 
                                    className="texture-swatch" 
                                    style={{backgroundImage: `url(${option.texture})`}}
                                ></div>
                            ) : (
                                <div 
                                    className={`color-swatch ${option.isMetallic ? 'metallic-color' : ''}`} 
                                    style={{backgroundColor: option.color}}
                                ></div>
                            )}
                            <span className="color-name">{option.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="color-section">
                <h3 className="section-title">Handle Color</h3>
                <div className="color-grid">
                    {handleColors.map((option) => (
                        <div
                            key={option.id}
                            className={`color-tile ${
                                selectedHandleColor.id === option.id ? 'selected' : ''
                            } ${hasActiveWardrobe ? 'enabled' : ''}`}
                            onClick={() => hasActiveWardrobe && onSelectHandleColor(option)}
                        >
                            <div 
                                className={`color-swatch ${option.isMetallic ? 'metallic-color' : ''}`} 
                                style={{backgroundColor: option.color}}
                            ></div>
                            <span className="color-name">{option.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Colors;

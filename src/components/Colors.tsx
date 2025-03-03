import React from 'react';
import { ColorOption } from '../types';

interface ColorsProps {
    onSelectWardrobeColor: (option: ColorOption) => void;
    onSelectHandleColor: (option: ColorOption) => void;
    selectedWardrobeColor: string;
    selectedHandleColor: string;
    hasActiveWardrobe: boolean;
}

const Colors = ({ 
    onSelectWardrobeColor, 
    onSelectHandleColor, 
    selectedWardrobeColor,
    selectedHandleColor,
    hasActiveWardrobe 
}: ColorsProps) => {
    const wardrobeColors: ColorOption[] = [
        { id: 'chrome', name: 'Chrome', color: '#E8E8E8', isMetallic: true },
        { id: 'brass', name: 'Brass', color: '#B5A642', isMetallic: true },
        { id: 'black-metal', name: 'Black Metal', color: '#222222', isMetallic: true },
        { id: 'rose-gold', name: 'Rose Gold', color: '#B76E79', isMetallic: true },
        { id: 'brushed-nickel', name: 'Brushed Nickel', color: '#848789', isMetallic: true },
        { id: 'metallic-silver', name: 'Metallic Silver', color: '#C0C0C0', isMetallic: true },
        { id: 'metallic-gold', name: 'Metallic Gold', color: '#FFD700', isMetallic: true },
        { id: 'brushed-steel', name: 'Brushed Steel', color: '#B4B4B4', isMetallic: true },
        { id: 'copper', name: 'Copper', color: '#B87333', isMetallic: true },
        { id: 'bronze', name: 'Bronze', color: '#CD7F32', isMetallic: true },
        { id: 'gunmetal', name: 'Gunmetal', color: '#2C3539', isMetallic: true },
        { id: 'wood', name: 'Wood', texture: '/textures/wood.jpg' },
        { id: 'DirtWindowStains', name: 'Dirt Window Stains', texture: '/textures/DirtWindowStains.jpg' },
        { id: 'FloorPoured', name: 'Floor Poured', texture: '/textures/FloorPoured.jpg' },
        { id: 'GoldPaint', name: 'Gold Paint', texture: '/textures/GoldPaint.jpg' },
        { id: 'Metal', name: 'Metal', texture: '/textures/metal.jpg' },
        { id: 'Poliigon_MetalBronze', name: 'Poliigon Metal Bronze', texture: '/textures/Poliigon_MetalBronze.jpg' },
        { id: 'Poliigon_MetalRust', name: 'Poliigon Metal Rust', texture: '/textures/Poliigon_MetalRust.jpg' },
        { id: 'RammedEarth', name: 'Rammed Earth', texture: '/textures/RammedEarth.png' },
        { id: 'ScratchesLight', name: 'Scratches Light', texture: '/textures/ScratchesLight.jpg' },
        { id: 'SmudgesLarge', name: 'Smudges Large', texture: '/textures/SmudgesLarge.jpg' },
        { id: 'StuccoRough', name: 'Stucco Rough', texture: '/textures/StuccoRough.png' },
        { id: 'TilesZellige', name: 'Tiles Zellige', texture: '/textures/TilesZellige.jpg' }
    ];

    const handleColors: ColorOption[] = [
        { id: 'chrome', name: 'Chrome', color: '#E8E8E8', isMetallic: true },
        { id: 'brass', name: 'Brass', color: '#B5A642', isMetallic: true },
        { id: 'black-metal', name: 'Black Metal', color: '#222222', isMetallic: true },
        { id: 'rose-gold', name: 'Rose Gold', color: '#B76E79', isMetallic: true },
        { id: 'brushed-nickel', name: 'Brushed Nickel', color: '#848789', isMetallic: true },
        { id: 'wood', name: 'Wood', texture: '/textures/wood.jpg' },
        { id: 'DirtWindowStains', name: 'Dirt Window Stains', texture: '/textures/DirtWindowStains.jpg' },
        { id: 'FloorPoured', name: 'Floor Poured', texture: '/textures/FloorPoured.jpg' },
        { id: 'GoldPaint', name: 'Gold Paint', texture: '/textures/GoldPaint.jpg' },
        { id: 'Metal', name: 'Metal', texture: '/textures/metal.jpg' },
        { id: 'Poliigon_MetalBronze', name: 'Poliigon Metal Bronze', texture: '/textures/Poliigon_MetalBronze.jpg' },
        { id: 'Poliigon_MetalRust', name: 'Poliigon Metal Rust', texture: '/textures/Poliigon_MetalRust.jpg' },
        { id: 'RammedEarth', name: 'Rammed Earth', texture: '/textures/RammedEarth.png' },
        { id: 'ScratchesLight', name: 'Scratches Light', texture: '/textures/ScratchesLight.jpg' },
        { id: 'SmudgesLarge', name: 'Smudges Large', texture: '/textures/SmudgesLarge.jpg' },
        { id: 'StuccoRough', name: 'Stucco Rough', texture: '/textures/StuccoRough.png' },
        { id: 'TilesZellige', name: 'Tiles Zellige', texture: '/textures/TilesZellige.jpg' }
    ];

    return (
        <div className="color-options">
            <div className="section">
                <h3 className="section-title">Color your Wardrobe</h3>
                <div className="color-grid">
                    {wardrobeColors.map((option) => (
                        <div
                            key={option.id}
                            className={`color-tile ${
                                selectedWardrobeColor === option.id ? 'selected' : ''
                            } ${hasActiveWardrobe ? 'enabled' : ''}`}
                            onClick={() => hasActiveWardrobe && onSelectWardrobeColor(option)}
                            style={{
                                background: option.texture 
                                    ? `url(${option.texture}) center/cover`
                                    : option.color
                            }}
                        >
                            <span className="color-name">{option.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="section">
                <h3 className="section-title">Color your Handle</h3>
                <div className="color-grid">
                    {handleColors.map((option) => (
                        <div
                            key={option.id}
                            className={`color-tile ${
                                selectedHandleColor === option.id ? 'selected' : ''
                            } ${hasActiveWardrobe ? 'enabled' : ''}`}
                            onClick={() => hasActiveWardrobe && onSelectHandleColor(option)}
                            style={{
                                background: option.texture 
                                    ? `url(${option.texture}) center/cover`
                                    : option.color
                            }}
                        >
                            <span className="color-name">{option.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Colors;

import React from 'react';
import { ColorOption, DoorStyle, InternalStorageType } from '../types';
import './ReviewPage.css';

interface ReviewPageProps {
  setStage: (stage: "size" | "wardrobe" | "style" | "preview") => void;
  selectedWardrobeColor: ColorOption;
  selectedHandleColor: ColorOption;
  selectedHandle: 'none' | 'straight' | 'fancy' | 'spherical';
  doorStyle: DoorStyle;
  activeWardrobeType: number | null;
  roomDimensions: { width: number; length: number; height: number };
  layoutConfig?: any; // Using any temporarily for simplicity
  activeWardrobeData?: {
    modelType: number;
    handleType: 'none' | 'straight' | 'fancy' | 'spherical';
    color: ColorOption;
    handleColor: ColorOption;
    handlePosition: 'left' | 'right';
    cabinetOption: 'none' | 'cabinet-layout';
    internalStorage: InternalStorageType;
    internalStorageColor: ColorOption;
    doorStyle: DoorStyle;
  };
  totalPrice?: string;
}

const ReviewPage: React.FC<ReviewPageProps> = ({
  setStage,
  selectedWardrobeColor,
  selectedHandleColor,
  selectedHandle,
  doorStyle,
  activeWardrobeType,
  roomDimensions,
  layoutConfig,
  activeWardrobeData,
  totalPrice,
}) => {
  const countWardrobes = () => {
    if (!layoutConfig) return 0;
    
    let count = 0;
    ['leftWall', 'rightWall', 'backWall'].forEach(wall => {
      if (layoutConfig[wall]) {
        layoutConfig[wall].forEach((section: any) => {
          if (section.type === 'wardrobe') count++;
        });
      }
    });
    return count;
  };

  const getWardrobeTypeName = (modelType: number) => {
    switch(modelType) {
      case 1: return "Single Door";
      case 2: return "Storage Block";
      case 3: return "Double Door";
      default: return "Unknown";
    }
  };

  const getDoorStyleName = (style: DoorStyle) => {
    switch(style) {
      case 'panel-shaker': return "1 Panel Shaker";
      case 'panel-eclipse': return "4 Panel Eclipse";
      case 'estoril': return "Estoril";
      case 'santana': return "Santana";
      default: return style;
    }
  };

  // The ReviewPage component is now positioned at the top-right
  // without a back button since we'll use the floating button in App.tsx
  return (
    <div className="review-page">
      <h2 className="review-title">Review Your Wardrobe</h2>
      
      <div className="review-section">
        <h3>Room Details</h3>
        <div className="review-item">
          <span className="review-label">Room Width</span>
          <span className="review-value">{(roomDimensions.width * 1000).toFixed(0)} mm</span>
        </div>
        <div className="review-item">
          <span className="review-label">Room Length</span>
          <span className="review-value">{(roomDimensions.length * 1000).toFixed(0)} mm</span>
        </div>
        <div className="review-item">
          <span className="review-label">Ceiling Height</span>
          <span className="review-value">{(roomDimensions.height * 1000).toFixed(0)} mm</span>
        </div>
        <div className="review-item">
          <span className="review-label">Number of Wardrobes</span>
          <span className="review-value">{countWardrobes()}</span>
        </div>
      </div>
      
      {activeWardrobeData && (
        <div className="review-section">
          <h3>Wardrobe Details</h3>
          <div className="review-item">
            <span className="review-label">Type</span>
            <span className="review-value">{getWardrobeTypeName(activeWardrobeData.modelType)}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Door Style</span>
            <span className="review-value">{getDoorStyleName(activeWardrobeData.doorStyle)}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Door Color</span>
            <span className="review-value">
              {activeWardrobeData.color && (
                <>
                  <div 
                    className="color-preview" 
                    style={{
                      backgroundColor: activeWardrobeData.color.color || "#ccc",
                      backgroundImage: activeWardrobeData.color.texture ? `url(${activeWardrobeData.color.texture})` : 'none',
                      backgroundSize: 'cover'
                    }}
                  ></div>
                  {activeWardrobeData.color.name}
                </>
              )}
            </span>
          </div>
          {activeWardrobeData.handleType !== 'none' && (
            <>
              <div className="review-item">
                <span className="review-label">Handle Type</span>
                <span className="review-value">{activeWardrobeData.handleType.charAt(0).toUpperCase() + activeWardrobeData.handleType.slice(1)}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Handle Color</span>
                <span className="review-value">
                  {activeWardrobeData.handleColor && (
                    <>
                      <div 
                        className="color-preview" 
                        style={{
                          backgroundColor: activeWardrobeData.handleColor.color || "#ccc"
                        }}
                      ></div>
                      {activeWardrobeData.handleColor.name}
                    </>
                  )}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewPage; 
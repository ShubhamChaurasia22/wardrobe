import React, { useState, useEffect } from "react";

interface SizeControlsProps {
    dimensions: {
        width: number;
        length: number;
        height: number;
    };
    setDimensions: (dimensions: any) => void;
    handleBuildWardrobes: () => void;
}

const SizeControls: React.FC<SizeControlsProps> = ({ 
    dimensions, 
    setDimensions, 
    handleBuildWardrobes 
}) => {
    // State for validation
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    
    // State for input values (what the user sees in the input field)
    const [inputValues, setInputValues] = useState({
        width: Math.round(dimensions.width * 1000).toString(),
        length: Math.round(dimensions.length * 1000).toString(),
        height: Math.round(dimensions.height * 1000).toString()
    });
    
    // Update input values when dimensions change externally
    useEffect(() => {
        setInputValues({
            width: Math.round(dimensions.width * 1000).toString(),
            length: Math.round(dimensions.length * 1000).toString(),
            height: Math.round(dimensions.height * 1000).toString()
        });
    }, [dimensions]);
    
    // Validation limits (only used for validation messages, not to restrict input)
    const MIN_WIDTH = 3;
    const MAX_WIDTH = 12;
    const MIN_LENGTH = 3;
    const MAX_LENGTH = 12;
    const MIN_HEIGHT = 2.4;
    const MAX_HEIGHT = 3.2;

    const validateDimension = (name: string, value: number): string => {
        switch(name) {
            case 'width':
                if (value < MIN_WIDTH) return `Width should be at least ${MIN_WIDTH * 1000}mm`;
                if (value > MAX_WIDTH) return `Width is very large (>${MAX_WIDTH * 1000}mm)`;
                break;
            case 'length':
                if (value < MIN_LENGTH) return `Length should be at least ${MIN_LENGTH * 1000}mm`;
                if (value > MAX_LENGTH) return `Length is very large (>${MAX_LENGTH * 1000}mm)`;
                break;
            case 'height':
                if (value < MIN_HEIGHT) return `Height should be at least ${MIN_HEIGHT * 1000}mm`;
                if (value > MAX_HEIGHT) return `Height is very large (>${MAX_HEIGHT * 1000}mm)`;
                break;
        }
        return '';
    };

    const handleDimensionChange = (dimension: string, inputValue: string) => {
        // Update the input value state first (what the user sees)
        setInputValues(prev => ({
            ...prev,
            [dimension]: inputValue
        }));
        
        // Allow only numbers in the input
        const sanitizedValue = inputValue.replace(/[^0-9]/g, '');
        
        // Only proceed if we have a valid number
        if (sanitizedValue !== '') {
            // Store value in millimeters
            const valueMm = Number(sanitizedValue);
            
            // Convert from millimeters to meters for the dimension state
            const valueM = valueMm / 1000;
            
            // Always update the dimension regardless of validation
            setDimensions((prev: {width: number; length: number; height: number}) => {
                const newDimensions = {
                    ...prev,
                    [dimension]: valueM
                };
                return newDimensions;
            });
            
            // Validate and set error message for feedback only
            const error = validateDimension(dimension, valueM);
            setErrors(prev => ({
                ...prev,
                [dimension]: error
            }));
        }
    };

    const isFormValid = () => {
        // If the errors object is empty (initial state) or has no serious errors, the form is valid
        // We'll consider warnings as valid, just to not block the user
        const hasBlockingErrors = Object.values(errors).some(error => 
            error.includes("must be") || error.includes("cannot")
        );
        return !hasBlockingErrors;
    };

    return (
        <div className="room-dimensions-panel">
            <h2>Room Dimensions</h2>
            <div className="dimension-fields">
                <div className="dimension-field">
                    <label>Room Width</label>
                    <div className="input-wrapper">
                        <input 
                            type="text" 
                            value={inputValues.width} 
                            onChange={(e) => handleDimensionChange('width', e.target.value)}
                            className={errors.width ? 'error' : ''}
                            placeholder="mm"
                        />
                        <span className="unit">mm</span>
                    </div>
                    {errors.width && <div className="error-message">{errors.width}</div>}
                </div>
                <div className="dimension-field">
                    <label>Room Length</label>
                    <div className="input-wrapper">
                        <input 
                            type="text" 
                            value={inputValues.length} 
                            onChange={(e) => handleDimensionChange('length', e.target.value)}
                            className={errors.length ? 'error' : ''}
                            placeholder="mm"
                        />
                        <span className="unit">mm</span>
                    </div>
                    {errors.length && <div className="error-message">{errors.length}</div>}
                </div>
                <div className="dimension-field">
                    <label>Ceiling Height</label>
                    <div className="input-wrapper">
                            <input
                            type="text" 
                            value={inputValues.height} 
                            onChange={(e) => handleDimensionChange('height', e.target.value)}
                            className={errors.height ? 'error' : ''}
                            placeholder="mm"
                        />
                        <span className="unit">mm</span>
                    </div>
                    {errors.height && <div className="error-message">{errors.height}</div>}
                </div>
            </div>
            
            <button 
                className="build-button" 
                onClick={handleBuildWardrobes}
                disabled={!isFormValid()}
            >
                Build my Wardrobes
            </button>
        </div>
    );
};

export default SizeControls;

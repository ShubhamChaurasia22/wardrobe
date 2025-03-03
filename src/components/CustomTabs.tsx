import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import Doors from "./Doors";
import Colors from "./Colors";
import { ColorOption } from '../types';

interface CustomTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onSelectModel: (modelType: number, handleType?: 'none' | 'straight' | 'fancy' | 'spherical') => void;
    selectedHandle: 'none' | 'straight' | 'fancy' | 'spherical';
    setSelectedHandle: (handleType: 'none' | 'straight' | 'fancy' | 'spherical') => void;
    selectedOption: number;
    setSelectedOption: (id: number | null) => void;
    hasActiveWardrobe: boolean;
    onSelectWardrobeColor: (option: ColorOption) => void;
    onSelectHandleColor: (option: ColorOption) => void;
    selectedWardrobeColor: string;
    selectedHandleColor: string;
    handlePosition: 'left' | 'right';  // Add these lines
    setHandlePosition: (position: 'left' | 'right') => void;
}

const CustomTabs = ({ 
    activeTab, 
    setActiveTab, 
    onSelectModel, 
    selectedHandle, 
    setSelectedHandle,
    selectedOption,
    setSelectedOption,
    hasActiveWardrobe,
    onSelectWardrobeColor,
    onSelectHandleColor,
    selectedWardrobeColor,
    selectedHandleColor,
    handlePosition,
    setHandlePosition
}: CustomTabsProps) => {
    const handleSelect = (index: number) => {
        setActiveTab(index === 0 ? "doors" : "colors");
    };

    return (
        <Tabs selectedIndex={activeTab === "doors" ? 0 : 1} onSelect={handleSelect}>
            <TabList>
                <Tab>Doors</Tab>
                <Tab>Colors</Tab>
            </TabList>

            <TabPanel>
                <Doors 
                    onSelectModel={onSelectModel}
                    selectedHandle={selectedHandle}
                    setSelectedHandle={setSelectedHandle}
                    selectedOption={selectedOption}
                    setSelectedOption={setSelectedOption}
                    hasActiveWardrobe={hasActiveWardrobe}
                    handlePosition={handlePosition}
                    setHandlePosition={setHandlePosition}
                />
            </TabPanel>
            <TabPanel>
                <Colors 
                    onSelectWardrobeColor={onSelectWardrobeColor}
                    onSelectHandleColor={onSelectHandleColor}
                    selectedWardrobeColor={selectedWardrobeColor}
                    selectedHandleColor={selectedHandleColor}
                    hasActiveWardrobe={hasActiveWardrobe}
                />
            </TabPanel>
        </Tabs>
    );
};

export default CustomTabs;
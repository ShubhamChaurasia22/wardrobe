import React, { useMemo } from "react";
import * as THREE from "three";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import Colors from "./Colors";
import Doors from "./Doors";
import { ColorOption, InternalStorageType } from '../types';

interface CustomTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onSelectModel: (modelType: number, handleType?: 'none' | 'straight' | 'fancy' | 'spherical') => void;
    selectedHandle: 'none' | 'straight' | 'fancy' | 'spherical';
    setSelectedHandle: (handle: 'none' | 'straight' | 'fancy' | 'spherical') => void;
    selectedOption: number;
    setSelectedOption: (option: number | null) => void;
    hasActiveWardrobe: boolean;
    onSelectWardrobeColor: (color: ColorOption) => void;
    onSelectHandleColor: (color: ColorOption) => void;
    selectedWardrobeColor: ColorOption;  // Change from string to ColorOption
    selectedHandleColor: ColorOption;    // Change from string to ColorOption
    handlePosition: 'left' | 'right';
    setHandlePosition: (position: 'left' | 'right') => void;
    cabinetOption: 'none' | 'cabinet-layout';
    setCabinetOption: (option: 'none' | 'cabinet-layout') => void;
    internalStorage: InternalStorageType;
    setInternalStorage: (storage: InternalStorageType) => void;
    selectedInternalStorageColor: ColorOption;
    onSelectInternalStorageColor: (option: ColorOption) => void;
    activeWardrobeType: number | null;  // Add this prop
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
    setHandlePosition,
    cabinetOption,
    setCabinetOption,
    internalStorage,
    setInternalStorage,
    selectedInternalStorageColor,
    onSelectInternalStorageColor,
    activeWardrobeType  // Add this prop
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
                    cabinetOption={cabinetOption}
                    setCabinetOption={setCabinetOption}
                    internalStorage={internalStorage}
                    setInternalStorage={setInternalStorage}
                    activeWardrobeType={activeWardrobeType}  // Add this prop
                />
            </TabPanel>
            <TabPanel>
                <Colors 
                    onSelectWardrobeColor={onSelectWardrobeColor}
                    onSelectHandleColor={onSelectHandleColor}
                    onSelectInternalStorageColor={onSelectInternalStorageColor}
                    selectedWardrobeColor={selectedWardrobeColor}
                    selectedHandleColor={selectedHandleColor}
                    selectedInternalStorageColor={selectedInternalStorageColor}
                    hasActiveWardrobe={hasActiveWardrobe}
                />
            </TabPanel>
        </Tabs>
    );
};

export default CustomTabs;
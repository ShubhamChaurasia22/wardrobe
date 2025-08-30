import React, { lazy, Suspense } from "react";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import { ColorOption, InternalStorageType, StoragePosition, DoorStyle } from '../types';
import "react-tabs/style/react-tabs.css";
import './CustomTabs.css';

// Lazily load the components to break circular dependencies
const Doors = lazy(() => import("./Doors"));
const Colors = lazy(() => import("./Colors"));

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
    selectedWardrobeColor: ColorOption;
    selectedHandleColor: ColorOption;
    handlePosition: 'left' | 'right';
    setHandlePosition: (position: 'left' | 'right') => void;
    cabinetOption: 'none' | 'cabinet-layout';
    setCabinetOption: (option: 'none' | 'cabinet-layout') => void;
    internalStorage: InternalStorageType;
    setInternalStorage: (storage: InternalStorageType) => void;
    selectedInternalStorageColor: ColorOption;
    onSelectInternalStorageColor: (option: ColorOption) => void;
    activeWardrobeType: number | null;
    storagePosition: StoragePosition;
    setStoragePosition: (position: StoragePosition) => void;
    doorStyle: DoorStyle;
    setDoorStyle: (style: DoorStyle) => void;
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
    activeWardrobeType,
    storagePosition,
    setStoragePosition,
    doorStyle,
    setDoorStyle
}: CustomTabsProps) => {
    const handleSelect = (index: number) => {
        console.log("Tab selected:", index === 0 ? "doors" : "colors");
        setActiveTab(index === 0 ? "doors" : "colors");
    };

    // Loading component while lazy-loaded components are being fetched
    const LoadingFallback = () => (
        <div style={{ padding: "20px", textAlign: "center" }}>
            Loading...
        </div>
    );

    return (
        <Tabs selectedIndex={activeTab === "doors" ? 0 : 1} onSelect={handleSelect} className="custom-tabs">
            <TabList className="custom-tab-list">
                <Tab className={`custom-tab ${activeTab === "doors" ? "active-tab" : ""}`}>Door Options</Tab>
                <Tab className={`custom-tab ${activeTab === "colors" ? "active-tab" : ""}`}>Colours</Tab>
            </TabList>

            <TabPanel className="custom-tab-panel">
                <Suspense fallback={<LoadingFallback />}>
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
                        activeWardrobeType={activeWardrobeType}
                        storagePosition={storagePosition}
                        setStoragePosition={setStoragePosition}
                        doorStyle={doorStyle}
                        setDoorStyle={setDoorStyle}
                    />
                </Suspense>
            </TabPanel>
            <TabPanel className="custom-tab-panel">
                <Suspense fallback={<LoadingFallback />}>
                    <Colors 
                        onSelectWardrobeColor={onSelectWardrobeColor}
                        onSelectHandleColor={onSelectHandleColor}
                        onSelectInternalStorageColor={onSelectInternalStorageColor}
                        selectedWardrobeColor={selectedWardrobeColor}
                        selectedHandleColor={selectedHandleColor}
                        selectedInternalStorageColor={selectedInternalStorageColor}
                        hasActiveWardrobe={hasActiveWardrobe}
                    />
                </Suspense>
            </TabPanel>
        </Tabs>
    );
};

export default CustomTabs;
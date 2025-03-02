import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import Doors from "./Doors";
import Colors from "./Colors";

const CustomTabs = ({ activeTab, setActiveTab, onSelectModel }: any) => {
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
                <Doors />
            </TabPanel>
            <TabPanel>
                <Colors />
            </TabPanel>
        </Tabs>
    );
};

export default CustomTabs;
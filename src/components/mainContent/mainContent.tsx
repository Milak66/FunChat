import React from "react";
import './mainContent.css';
import SideBar from "../sideBar/sideBar";
import Chat from "../chat/chat";

interface MainContentProps {};

const MainContent: React.FC<MainContentProps> = (): React.JSX.Element => {

    return (
        <div className="mainContent">
            <SideBar/>
            <div className="content"><Chat/></div>
        </div>
    )
}

export default MainContent;
import React from "react";
import {Header} from "./Header/Header";
import ContentBase from "./ContentBase/ContentBase";

export function Base() {
    return (
        <div className="divide-y">
            <Header/>
            <ContentBase/>
        </div>
    );
}

export default Base;

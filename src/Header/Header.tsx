import React from "react";
import {LogInOutButton} from "./LogInOutButton";
import spotify_logo from "../spotify_logo.png";

export function Header() {
    return (
        <div className="flex flex-row flex-nowrap justify-between mx-5 my-2">
            <div>
                <h1 className="text-2xl font-playlist-cutter inline">Playlist Cutter for</h1>
                <img className="h-8 inline ml-2 -mt-2" src={spotify_logo} alt="Spotify"/>
            </div>
            <LogInOutButton/>
        </div>
    );
}

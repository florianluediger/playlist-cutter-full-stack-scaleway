import React from "react";
import {LogInOutButton} from "./LogInOutButton";

export function Header() {
    return (
        <div className="flex flex-row flex-nowrap justify-between mx-5 my-2">
            <h1 className="text-2xl font-spotify-smart-playlists">Playlist Cutter for Spotify</h1>
            <LogInOutButton/>
        </div>
    );
}

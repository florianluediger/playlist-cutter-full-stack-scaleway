import React from "react";
import { LogInOutButton } from "./LogInOutButton";

export function Header() {
  return (
    <div className="flex flex-row flex-nowrap justify-between mx-10 my-3">
      <h1 className="text-xl">Spotify Smart Playlists</h1>
      <LogInOutButton />
    </div>
  );
}

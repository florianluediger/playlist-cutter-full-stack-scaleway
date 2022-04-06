import React from "react";
import { PlaylistList } from "./PlaylistList/PlaylistList";
import { Header } from "./Header/Header";

export function Base() {
  return (
    <div>
      <Header />
      <PlaylistList />
    </div>
  );
}

export default Base;

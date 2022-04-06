import { PlaylistList } from "./PlaylistList/PlaylistList";
import { useAuth } from "react-oauth2-pkce";
import React from "react";

export function ContentBase() {
  const { authService } = useAuth();

  if (!authService.isAuthenticated()) {
    return (
      <div>
        <p className="flex justify-center my-10 text-xl">
          Please log in via Spotify
        </p>
      </div>
    );
  }
  return (
    <div className="flex justify-center pt-10">
      <div className="grid grid-cols-1 md:grid-cols2">
        <div className="mx-5">
          <p className="text-xl">I want all songs from...</p>
          <PlaylistList />
        </div>
        <div className="mx-5">
          <p className="text-xl mt-5 md:mt-0">... but no songs from...</p>
          <PlaylistList />
        </div>
        <div className="col-span-1 md:col-span-2 mt-5">
          <p className="text-xl ml-5 inline">... in a playlist called</p>
          <input
            className="border-b-2 border-slate-400 ml-3 focus:outline-none focus:border-black text-xl inline"
            type="text"
          />
          <button className="text-xl ml-5 inline border-2 border-slate-500 rounded-lg px-3 py-2 mt-2 md:mt-0 hover:bg-slate-100">
            Let's go!
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContentBase;

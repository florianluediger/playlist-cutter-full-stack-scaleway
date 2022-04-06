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
    <div>
      <PlaylistList />
    </div>
  );
}

export default ContentBase;

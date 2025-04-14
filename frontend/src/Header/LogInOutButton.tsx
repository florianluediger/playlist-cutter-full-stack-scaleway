import React from "react";
import spotify_logo from "../spotify_logo.png";
import { useAuth } from "../hooks/useAuth";

export function LogInOutButton() {
  const { isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <button className="text-xl" onClick={login}>
        Log in with{" "}
        <img
          className="h-8 inline ml-1 -mt-2"
          src={spotify_logo}
          alt="Spotify"
        />
      </button>
    );
  }

  return (
    <button className="text-xl" onClick={logout}>
      Log out from{" "}
      <img className="h-8 inline ml-1 -mt-2" src={spotify_logo} alt="Spotify" />
    </button>
  );
}

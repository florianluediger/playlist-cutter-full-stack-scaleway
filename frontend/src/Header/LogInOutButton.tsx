import { useAuth } from "react-oauth2-pkce";
import React, { useState } from "react";
import spotify_logo from "../spotify_logo.png";

export function LogInOutButton() {
  const { authService } = useAuth();
  const [loginTimeout, setLoginTimeout] = useState<NodeJS.Timeout | null>(null);

  async function login() {
    authService.authorize();
  }

  async function logout() {
    await authService.logout();
  }

  function loginTimeoutCallback() {
    if (loginTimeout != null) {
      clearTimeout(loginTimeout);
      setLoginTimeout(null);
    }
    authService.logout();
  }

  if (authService.isPending()) {
    if (loginTimeout == null) {
      setLoginTimeout(setTimeout(loginTimeoutCallback, 1000));
    }
    return <p>Loading...</p>;
  }

  if (!authService.isAuthenticated()) {
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

import React, { useState, useEffect } from "react";
import spotify_logo from "../spotify_logo.png";

export function LogInOutButton() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/spotify/status`, {
          credentials: 'include'
        });
        if (response.status === 200) {
          const data = await response.json();
          setIsAuthenticated(data.isAuthenticated === true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    }
    checkAuthStatus();
  }, []);

  async function login() {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/spotify`;
  }

  async function logout() {
    //todo
  }

  function getCookie(key: string) {
    var b = document.cookie.match("(^|;)\\s*" + key + "\\s*=\\s*([^;]+)");
    return b ? b.pop() : "";
  }

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

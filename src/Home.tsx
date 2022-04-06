import React from "react";
import { useAuth } from "react-oauth2-pkce";
import { PlaylistList } from "./PlaylistList/PlaylistList";

export function Home() {
  const { authService } = useAuth();

  async function login() {
    authService.authorize();
  }

  async function logout() {
    authService.logout();
  }

  if (authService.isPending()) {
    return <div>Loading...</div>;
  }

  if (!authService.isAuthenticated()) {
    return (
      <div>
        <p>Not Logged in yet: </p>
        <button onClick={login}>Login</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={logout}>Logout</button>
      <PlaylistList />
    </div>
  );
}

export default Home;

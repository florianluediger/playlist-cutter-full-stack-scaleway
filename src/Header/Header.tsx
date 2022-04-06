import { useAuth } from "react-oauth2-pkce";
import React from "react";

export function Header() {
  const { authService } = useAuth();

  async function login() {
    authService.authorize();
  }

  async function logout() {
    await authService.logout();
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
    </div>
  );
}

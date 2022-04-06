import { useAuth } from "react-oauth2-pkce";
import React from "react";

export function LogInOutButton() {
  const { authService } = useAuth();

  async function login() {
    authService.authorize();
  }

  async function logout() {
    await authService.logout();
  }

  if (authService.isPending()) {
    return <p>Loading...</p>;
  }

  if (!authService.isAuthenticated()) {
    return (
      <button className="text-xl" onClick={login}>
        Login
      </button>
    );
  }

  return (
    <button className="text-xl" onClick={logout}>
      Logout
    </button>
  );
}

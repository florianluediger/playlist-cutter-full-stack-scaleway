import { useAuth } from "react-oauth2-pkce";
import React, {useState} from "react";

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

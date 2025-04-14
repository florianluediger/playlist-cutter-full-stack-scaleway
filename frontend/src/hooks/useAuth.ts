import { useState, useEffect } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    function getCookie(key: string) {
      var b = document.cookie.match("(^|;)\\s*" + key + "\\s*=\\s*([^;]+)");
      return b ? b.pop() : "";
    }

    const userId = getCookie("userId");

    setIsAuthenticated(userId != "");
  }, []);

  const login = async () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/spotify`;
  };

  const logout = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/spotify/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        setIsAuthenticated(false);
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return { isAuthenticated, login, logout };
}

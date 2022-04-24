import React from "react";
import { AuthProvider, AuthService } from "react-oauth2-pkce";
import { RootRoute } from "./RootRoute";

import oauthConfig from "./config/oauth-config.json";

const authService = new AuthService({
  clientId: process.env.REACT_APP_CLIENT_ID || oauthConfig.CLIENT_ID,
  location: window.location,
  provider: oauthConfig.OAUTH_PROVIDER,
  redirectUri: window.location.origin + "/playlist-cutter",
  tokenEndpoint: oauthConfig.TOKEN_PROVIDER,
  scopes: [
    "playlist-modify-private",
    "playlist-read-private",
    "playlist-read-collaborative",
  ],
});

function App() {
  return (
    <div className="Spotify Smart Playlists">
      <AuthProvider authService={authService}>
        <RootRoute />
      </AuthProvider>
    </div>
  );
}

export default App;

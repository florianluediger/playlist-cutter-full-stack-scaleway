import { useAuth } from "react-oauth2-pkce";
import { usePlaylists } from "./usePlaylists";

export function PlaylistList() {
  const { authService } = useAuth();
  const { playlists, error } = usePlaylists(
    authService.getAuthTokens().access_token
  );

  if (error) return <div>Failed to load</div>;
  if (!playlists) return <div>Loading...</div>;

  return (
    <ul>
      {playlists.map((playlist) => (
        <li>{playlist.name}</li>
      ))}
    </ul>
  );
}

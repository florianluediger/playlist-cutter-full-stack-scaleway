import { useAuth } from "react-oauth2-pkce";
import { usePlaylists } from "./usePlaylists";
import { PlaylistListItem } from "./PlaylistListItem";

export function PlaylistList() {
  const { authService } = useAuth();
  const { playlists, error } = usePlaylists(
    authService.getAuthTokens().access_token
  );

  if (error) return <div>Failed to load</div>;
  if (!playlists) return <div>Loading...</div>;

  return (
    <div>
      <div className="rounded overflow-hidden shadow-lg">
        <div className="m-5">
          {playlists.map((p) => (
            <PlaylistListItem playlist={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

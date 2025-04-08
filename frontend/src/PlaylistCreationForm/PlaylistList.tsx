import { useAuth } from "react-oauth2-pkce";
import { usePlaylists } from "./usePlaylists";
import { PlaylistListItem } from "./PlaylistListItem";

export function PlaylistList({
  checkedPlaylists,
  setCheckedList,
}: {
  checkedPlaylists: string[];
  setCheckedList: (list: string[]) => void;
}) {
  const { authService } = useAuth();
  const { playlists, error } = usePlaylists(
    authService.getAuthTokens().access_token
  );

  if (error) {
    if (error.status === 401) {
      alert("Session expired. You were logged out.");
      authService.logout();
    }
    return (
      <div>
        <p>Failed to load</p>
        <p>{error.status}</p>
      </div>
    );
  }
  if (!playlists) return <div>Loading...</div>;

  function onItemChange(playlistId: string, checked: boolean) {
    if (checked) {
      setCheckedList([...checkedPlaylists, playlistId]);
    } else {
      setCheckedList(checkedPlaylists.filter((p) => p !== playlistId));
    }
  }

  return (
    <div>
      <div className="rounded-md border border-slate-300 overflow-hidden">
        <div className="mx-4 my-3">
          {playlists.map((p) => (
            <PlaylistListItem key={p.id} playlist={p} onChange={onItemChange} />
          ))}
        </div>
      </div>
    </div>
  );
}

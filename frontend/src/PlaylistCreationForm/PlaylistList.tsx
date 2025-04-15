import { PlaylistListItem } from "./PlaylistListItem";
import { Playlist } from "@playlist-cutter/common";

export function PlaylistList({
  checkedPlaylists,
  setCheckedList,
  playlists,
}: {
  checkedPlaylists: string[];
  setCheckedList: (list: string[]) => void;
  playlists: Playlist[];
}) {
  if (!playlists || playlists.length === 0) return <div>Loading...</div>;

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

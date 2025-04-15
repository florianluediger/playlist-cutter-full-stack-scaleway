import { Playlist } from "@playlist-cutter/common";
import spotify_icon from "../spotify_icon.png";

export function PlaylistListItem({
  playlist,
  onChange,
}: {
  playlist: Playlist;
  onChange: (playlistId: string, checked: boolean) => void;
}) {
  return (
    <div className="flex flex-row flex-nowrap justify-start">
      <label>
        <input
          name={playlist.id}
          className="mt-2 inline"
          type="checkbox"
          onChange={(e) => onChange(e.target.name, e.target.checked)}
        />
        <p className="ml-2 text-xl inline">{playlist.name}</p>
      </label>
    </div>
  );
}

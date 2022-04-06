import { Playlist } from "./Playlist";

export function PlaylistListItem({ playlist }: { playlist: Playlist }) {
  return (
    <div className="flex flex-row flex-nowrap justify-start">
      <input className="mt-2" type="checkbox" />
      <p className="align-middle ml-2 text-xl">{playlist.name}</p>
    </div>
  );
}

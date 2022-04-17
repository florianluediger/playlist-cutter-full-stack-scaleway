import {Playlist} from "./Playlist";

export function PlaylistListItem({
                                     playlist,
                                     onChange,
                                 }: {
    playlist: Playlist;
    onChange: (playlistId: string, checked: boolean) => void;
}) {
    return (
        <div className="flex flex-row flex-nowrap justify-start">
            <input
                name={playlist.id}
                className="mt-2"
                type="checkbox"
                onChange={(e) => onChange(e.target.name, e.target.checked)}
            />
            <p className="align-middle ml-2 text-xl">{playlist.name}</p>
        </div>
    );
}

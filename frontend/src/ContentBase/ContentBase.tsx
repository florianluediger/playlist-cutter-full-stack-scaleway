import PlaylistCreationForm from "../PlaylistCreationForm/PlaylistCreationForm";
import { useEffect, useState } from "react";
import {
  emptyPlaylistGenerationInput,
  Playlist,
} from "../../../common/src/types";

export function ContentBase() {
  const [playlistGenerationInput, setPlaylistGenerationInput] = useState(
    emptyPlaylistGenerationInput()
  );
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    fetchPlaylists().then((playlists) => {
      setPlaylists(playlists);
    });
  }, []);

  async function fetchPlaylists(): Promise<Playlist[]> {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/playlists`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      return [];
    }
  }

  function triggerGeneration() {
    //todo
    setPlaylistGenerationInput(emptyPlaylistGenerationInput());
  }

  return (
    <PlaylistCreationForm
      triggerGeneration={triggerGeneration}
      playlistGenerationInput={playlistGenerationInput}
      setPlaylistGenerationInput={setPlaylistGenerationInput}
      playlists={playlists}
    />
  );
}

export default ContentBase;

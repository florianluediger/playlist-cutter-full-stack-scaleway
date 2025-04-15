import PlaylistCreationForm from "../PlaylistCreationForm/PlaylistCreationForm";
import { useEffect, useState } from "react";
import {
  emptyPlaylistGenerationInput,
  Playlist,
} from "@playlist-cutter/common";

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
    fetch(`${process.env.REACT_APP_API_URL}/playlists/generation`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(playlistGenerationInput),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Refresh the playlists after successful generation
        fetchPlaylists().then((playlists) => {
          setPlaylists(playlists);
        });
      })
      .catch((error) => {
        console.error("Error generating playlist:", error);
      });

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

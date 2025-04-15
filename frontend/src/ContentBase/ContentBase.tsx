import PlaylistCreationForm from "../PlaylistCreationForm/PlaylistCreationForm";
import { useEffect, useState } from "react";
import {
  emptyPlaylistGenerationInput,
  Playlist,
} from "@playlist-cutter/common";
import PlaylistGeneration from "../PlaylistCreationForm/PlaylistGeneration";
import { useAuth } from "../hooks/useAuth";

export function ContentBase() {
  const [playlistGenerationInput, setPlaylistGenerationInput] = useState(
    emptyPlaylistGenerationInput()
  );
  const [generationActive, setGenerationActive] = useState<Boolean>(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlaylists();
    }
  }, [isAuthenticated]);

  function fetchPlaylists() {
    fetch(`${process.env.REACT_APP_API_URL}/playlists`, {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          console.log("Error fetching playlists");
        }
        return response.json();
      })
      .then((data) => {
        setPlaylists(data);
      });
  }

  function triggerGeneration() {
    setGenerationActive(true);
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
          return response.json().then((errorData) => {
            console.error("Error generating playlist:", errorData.error);
          });
        }
        fetchPlaylists();
      })
      .catch((error) => {
        console.error("Error generating playlist:", error);
      })
      .finally(() => {
        setPlaylistGenerationInput(emptyPlaylistGenerationInput());
        setGenerationActive(false);
      });
  }

  if (generationActive) {
    return <PlaylistGeneration />;
  } else {
    return (
      <PlaylistCreationForm
        triggerGeneration={triggerGeneration}
        playlistGenerationInput={playlistGenerationInput}
        setPlaylistGenerationInput={setPlaylistGenerationInput}
        playlists={playlists}
      />
    );
  }
}

export default ContentBase;

import PlaylistCreationForm from "../PlaylistCreationForm/PlaylistCreationForm";
import { useState } from "react";
import { GenerationStatus } from "../PlaylistGeneration/GenerationStatus";
import PlaylistGeneration from "../PlaylistGeneration/PlaylistGeneration";
import { emptyPlaylistGenerationInput } from "./PlaylistGenerationInput";
import { generatePlaylist } from "../PlaylistGeneration/PlaylistGenerator";
import { useAuth } from "react-oauth2-pkce";

export function ContentBase() {
  const [generationStatus, setGenerationStatus] = useState(
    GenerationStatus.INACTIVE
  );
  const [playlistGenerationInput, setPlaylistGenerationInput] = useState(
    emptyPlaylistGenerationInput()
  );
  const { authService } = useAuth();

  function triggerGeneration() {
    generatePlaylist(
      playlistGenerationInput.includePlaylists,
      playlistGenerationInput.excludePlaylists,
      playlistGenerationInput.newName,
      authService.getAuthTokens().access_token,
      setGenerationStatus
    ).then(() => {
      setPlaylistGenerationInput(emptyPlaylistGenerationInput());
      setGenerationStatus(GenerationStatus.INACTIVE);
    });
  }

  if (generationStatus === GenerationStatus.INACTIVE) {
    return (
      <PlaylistCreationForm
        triggerGeneration={triggerGeneration}
        playlistGenerationInput={playlistGenerationInput}
        setPlaylistGenerationInput={setPlaylistGenerationInput}
      />
    );
  } else {
    return <PlaylistGeneration generationStatus={generationStatus} />;
  }
}

export default ContentBase;

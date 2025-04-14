import PlaylistCreationForm from "../PlaylistCreationForm/PlaylistCreationForm";
import { useState } from "react";
import { GenerationStatus } from "../PlaylistGeneration/GenerationStatus";
import PlaylistGeneration from "../PlaylistGeneration/PlaylistGeneration";
import { emptyPlaylistGenerationInput } from "./PlaylistGenerationInput";

export function ContentBase() {
  const [generationStatus, setGenerationStatus] = useState(
    GenerationStatus.INACTIVE
  );
  const [playlistGenerationInput, setPlaylistGenerationInput] = useState(
    emptyPlaylistGenerationInput()
  );

  function triggerGeneration() {
    //todo
    setPlaylistGenerationInput(emptyPlaylistGenerationInput());
    setGenerationStatus(GenerationStatus.INACTIVE);
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

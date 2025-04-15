import { PlaylistList } from "./PlaylistList";
import React, { FormEvent, useState } from "react";
import { PlaylistGenerationInput } from "@playlist-cutter/common";
import { useAuth } from "../hooks/useAuth";
import { Playlist } from "@playlist-cutter/common";
export function PlaylistCreationForm({
  triggerGeneration,
  playlistGenerationInput,
  setPlaylistGenerationInput,
  playlists,
}: {
  triggerGeneration: () => void;
  playlistGenerationInput: PlaylistGenerationInput;
  setPlaylistGenerationInput: (
    playlistGenerationInput: PlaylistGenerationInput
  ) => void;
  playlists: Playlist[];
}) {
  const [localName, setLocalName] = useState("");
  const [nameErrorStyle, setNameErrorStyle] = useState("");
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div>
        <p className="flex justify-center my-10 text-xl">Please log in</p>
      </div>
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (localName === "") {
      setNameErrorStyle("border-rose-600");
      return;
    }
    triggerGeneration();
  }

  function setIncludePlaylists(includePlaylists: string[]) {
    setPlaylistGenerationInput({
      ...playlistGenerationInput,
      includePlaylists,
    });
  }

  function setExcludePlaylists(excludePlaylists: string[]) {
    setPlaylistGenerationInput({
      ...playlistGenerationInput,
      excludePlaylists,
    });
  }

  function setNewName(newName: string) {
    setNameErrorStyle("");
    setLocalName(newName);
    setPlaylistGenerationInput({
      ...playlistGenerationInput,
      newName,
    });
  }

  return (
    <div className="flex justify-center pt-10">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols2">
        <div className="mx-5">
          <p className="text-xl">I want all songs from...</p>
          <PlaylistList
            checkedPlaylists={playlistGenerationInput.includePlaylists}
            setCheckedList={setIncludePlaylists}
            playlists={playlists}
          />
        </div>
        <div className="mx-5">
          <p className="text-xl mt-5 md:mt-0">... but no songs from...</p>
          <PlaylistList
            checkedPlaylists={playlistGenerationInput.excludePlaylists}
            setCheckedList={setExcludePlaylists}
            playlists={playlists}
          />
        </div>
        <div className="col-span-1 md:col-span-2 mt-5">
          <p className="text-xl ml-5 inline">... in a playlist called</p>
          <input
            className={`border-b-2 border-slate-400 ml-3 focus:outline-none focus:border-black text-xl inline ${nameErrorStyle}`}
            type="text"
            value={localName}
            onChange={(name) => setNewName(name.target.value)}
          />
          <input
            type="submit"
            value="Let's go!"
            className="text-xl ml-5 inline border border-slate-300 rounded-md px-3 py-2 mt-2 md:mt-0 hover:bg-slate-100"
          />
        </div>
      </form>
    </div>
  );
}

export default PlaylistCreationForm;

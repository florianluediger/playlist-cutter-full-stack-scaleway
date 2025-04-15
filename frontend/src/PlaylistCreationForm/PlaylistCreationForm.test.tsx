import { fireEvent, render, screen } from "@testing-library/react";
import PlaylistCreationForm from "./PlaylistCreationForm";
import {
  emptyPlaylistGenerationInput,
  PlaylistGenerationInput,
} from "@playlist-cutter/common";
import { useAuth } from "../hooks/useAuth";

jest.mock("../hooks/useAuth");

let playlistExampleData = {
  playlists: [
    {
      id: "plist1Id",
      name: "plist1",
      external_urls: {
        spotify: "spotify_url_1",
      },
      tracks: {
        href: "href",
        total: 0,
      },
    },
    {
      id: "plist2Id",
      name: "plist2",
      external_urls: {
        spotify: "spotify_url_2",
      },
      tracks: {
        href: "href",
        total: 0,
      },
    },
    {
      id: "plist3Id",
      name: "plist3",
      external_urls: {
        spotify: "spotify_url_3",
      },
      tracks: {
        href: "href",
        total: 0,
      },
    },
  ],
  error: null,
};

let triggerGeneration = jest.fn();

it("populates data and triggers generation", () => {
  (useAuth as jest.Mock).mockReturnValue({
    isAuthenticated: true,
  });
  let playlistGenerationInput = emptyPlaylistGenerationInput();
  let setPlaylistGenerationInput = (updatedValue: PlaylistGenerationInput) => {
    playlistGenerationInput = updatedValue;
  };

  render(
    <PlaylistCreationForm
      triggerGeneration={triggerGeneration}
      playlistGenerationInput={playlistGenerationInput}
      setPlaylistGenerationInput={setPlaylistGenerationInput}
      playlists={playlistExampleData.playlists}
    />
  );

  expect(screen.getByText("I want all songs from...")).toBeInTheDocument();
  expect(screen.getByText("... but no songs from...")).toBeInTheDocument();
  expect(screen.getByText("... in a playlist called")).toBeInTheDocument();

  expect(screen.getAllByText("plist1").length).toEqual(2);
  expect(screen.getAllByText("plist2").length).toEqual(2);
  expect(screen.getAllByText("plist3").length).toEqual(2);

  let checkboxes: HTMLInputElement[] = screen.getAllByRole("checkbox");
  expect(checkboxes.length).toEqual(6);

  fireEvent.click(checkboxes[0]); // check plist1 in the including list
  expect(playlistGenerationInput.includePlaylists.length).toEqual(1);
  expect(playlistGenerationInput.includePlaylists).toContainEqual("plist1Id");

  fireEvent.click(checkboxes[4]); // check plist2 in the excluding list
  expect(playlistGenerationInput.excludePlaylists.length).toEqual(1);
  expect(playlistGenerationInput.excludePlaylists).toContainEqual("plist2Id");

  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "Test Playlist" },
  });
  expect(playlistGenerationInput.newName).toEqual("Test Playlist");

  fireEvent.click(screen.getByRole("button"));
  expect(triggerGeneration).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("textbox")).not.toHaveClass("border-rose-600");
});

it("shows an error when user is not authenticated", () => {
  (useAuth as jest.Mock).mockReturnValue({
    isAuthenticated: false,
  });

  render(
    <PlaylistCreationForm
      triggerGeneration={triggerGeneration}
      playlistGenerationInput={emptyPlaylistGenerationInput()}
      setPlaylistGenerationInput={jest.fn()}
      playlists={playlistExampleData.playlists}
    />
  );

  expect(screen.getByText("Please log in")).toBeInTheDocument();
});

it("paints input border red when no name is specified at button click", () => {
  (useAuth as jest.Mock).mockReturnValue({
    isAuthenticated: true,
  });

  let playlistGenerationInput = emptyPlaylistGenerationInput();
  let setPlaylistGenerationInput = (updatedValue: PlaylistGenerationInput) => {
    playlistGenerationInput = updatedValue;
  };

  render(
    <PlaylistCreationForm
      triggerGeneration={triggerGeneration}
      playlistGenerationInput={playlistGenerationInput}
      setPlaylistGenerationInput={setPlaylistGenerationInput}
      playlists={playlistExampleData.playlists}
    />
  );

  expect(screen.getByRole("textbox")).not.toHaveClass("border-rose-600");

  fireEvent.click(screen.getByRole("button"));

  expect(screen.getByRole("textbox")).toHaveClass("border-rose-600");

  expect(triggerGeneration).toHaveBeenCalledTimes(0);
});

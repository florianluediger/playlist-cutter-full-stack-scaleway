import { render, screen } from "@testing-library/react";
import PlaylistGeneration from "./PlaylistGeneration";
import { GenerationStatus } from "./GenerationStatus";

it("shows correct message when generation status is FETCH_INCLUDE", () => {
  render(
    <PlaylistGeneration generationStatus={GenerationStatus.FETCH_INCLUDE} />
  );
  expect(screen.getByText("Fetching songs to include in your new playlist")).toBeInTheDocument();
});

it("shows correct message when generation status is FETCH_EXCLUDE", () => {
  render(
      <PlaylistGeneration generationStatus={GenerationStatus.FETCH_EXCLUDE} />
  );
  expect(screen.getByText("Fetching songs to exclude from your new playlist")).toBeInTheDocument();
});

it("shows correct message when generation status is CALCULATE_DIFFERENCE", () => {
  render(
      <PlaylistGeneration generationStatus={GenerationStatus.CALCULATE_DIFFERENCE} />
  );
  expect(screen.getByText("Calculating the difference between the playlists")).toBeInTheDocument();
});

it("shows correct message when generation status is CREATE_NEW", () => {
  render(
      <PlaylistGeneration generationStatus={GenerationStatus.CREATE_NEW} />
  );
  expect(screen.getByText("Adding your favorite songs to your new playlist")).toBeInTheDocument();
});

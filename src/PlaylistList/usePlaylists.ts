import useSWR, { Fetcher } from "swr";

import spotifyConfig from "../config/spotify-config.json";
import {PlaylistResponse} from "./PlaylistResponse";

const playlistFetcher: Fetcher<PlaylistResponse, string> = async (url) => {
  const result = await fetch(url);
  if (!result.ok) {
    const error = new Error("An error occurred while fetching the data.");
    error.message = await result.json()
    throw error
  }

  return result.json()
}

export function usePlaylists(accessToken: string) {
  const { data, error } = useSWR(
    `${spotifyConfig.BASE_URL}/me/playlists?access_token=${accessToken}&limit=50`,
    playlistFetcher
  );
  let errorMessage
  if (error && error.message) {
    errorMessage = error.message.error
  }
  return {
    playlists: data ? data.items : undefined,
    error: errorMessage,
  };
}

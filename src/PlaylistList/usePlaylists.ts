import useSWR, { Fetcher } from "swr";

import spotifyConfig from "../config/spotify-config.json";
import { PlaylistResponse } from "./PlaylistResponse";

const playlistFetcher: Fetcher<PlaylistResponse, string> = (url) =>
  fetch(url).then((res) => res.json());

export function usePlaylists(accessToken: string) {
  const { data, error } = useSWR(
    `${spotifyConfig.BASE_URL}/me/playlists?access_token=${accessToken}&limit=50`,
    playlistFetcher
  );
  return {
    playlists: data ? data.items : undefined,
    error: error,
  };
}

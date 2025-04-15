export type Playlist = {
  id: string;
  name: string;
  external_urls: {
    spotify: string;
  };
  tracks: {
    href: string;
    total: number;
  };
};

export type PlaylistGenerationInput = {
  includePlaylists: string[];
  excludePlaylists: string[];
  newName: string;
};

export function emptyPlaylistGenerationInput(): PlaylistGenerationInput {
  return {
    includePlaylists: [],
    excludePlaylists: [],
    newName: "",
  };
}

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

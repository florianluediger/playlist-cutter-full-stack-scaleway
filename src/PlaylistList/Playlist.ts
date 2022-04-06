export type Playlist = {
  id: string;
  name: string;
  tracks: {
    href: string;
    total: number;
  };
};

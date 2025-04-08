import {
  addTracksToPlaylist,
  createPlaylist,
  fetchTracks,
} from "./SpotifyClient";
import spotifyConfig from "../config/spotify-config.json";

global.fetch = jest.fn();

describe("addTracksToPlaylist", () => {
  it("creates correct request", async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: true });
    const tracks = ["track1", "track2", "track3"];
    const playlistId = "playlistId";
    const accessToken = "accessToken";

    await addTracksToPlaylist(tracks, playlistId, accessToken);

    const expectedUrl = `${spotifyConfig.BASE_URL}/playlists/${playlistId}/tracks?access_token=${accessToken}`;
    const expectedBody = {
      uris: tracks,
    };
    const expectedInit = {
      method: "POST",
      body: JSON.stringify(expectedBody),
    };
    expect(fetch).toHaveBeenCalledWith(expectedUrl, expectedInit);
  });

  it("adds tracks in two batches when input contains more than 50 elements", async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: true });

    const tracks = Array.from({ length: 60 }, (_, x) => `track${x}`);
    const playlistId = "playlistId";
    const accessToken = "accessToken";

    await addTracksToPlaylist(tracks, playlistId, accessToken);

    const expectedUrl = `${spotifyConfig.BASE_URL}/playlists/${playlistId}/tracks?access_token=${accessToken}`;
    const expectedBodyFirstBatch = {
      uris: tracks.slice(0, 50),
    };
    const expectedBodySecondBatch = {
      uris: tracks.slice(0, 50),
    };
    const expectedInitFirstBatch = {
      method: "POST",
      body: JSON.stringify(expectedBodyFirstBatch),
    };
    const expectedInitSecondBatch = {
      method: "POST",
      body: JSON.stringify(expectedBodySecondBatch),
    };
    expect(fetch).toHaveBeenCalledWith(expectedUrl, expectedInitFirstBatch);
    expect(fetch).toHaveBeenCalledWith(expectedUrl, expectedInitSecondBatch);
  });

  it("throws error when fetch does not return ok", async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false });
    const tracks = ["track1", "track2", "track3"];
    const playlistId = "playlistId";
    const accessToken = "accessToken";

    await expect(
      async () => await addTracksToPlaylist(tracks, playlistId, accessToken)
    ).rejects.toThrowError(
      "An error occurred while adding tracks to the playlist"
    );
  });
});

describe("createPlaylist", () => {
  it("throws error when user id request does not return ok", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    const name = "name";
    const accessToken = "accessToken";

    await expect(
      async () => await createPlaylist(name, accessToken)
    ).rejects.toThrowError(
      "An error occurred while fetching the current users data"
    );
  });

  it("throws error when playlist creation request does not return ok", async () => {
    const playlistId = "playlistId";
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: playlistId }),
    });
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    const name = "name";
    const accessToken = "accessToken";

    await expect(
      async () => await createPlaylist(name, accessToken)
    ).rejects.toThrowError("An error occurred while creating the playlist");
  });

  it("creates correct request", async () => {
    const userId = "userId";
    const playlistId = "playlistId";
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: userId }),
    });
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: playlistId }),
    });

    const name = "name";
    const accessToken = "accessToken";

    const result = await createPlaylist(name, accessToken);

    expect(result).toBe(playlistId);

    const userFetchUrl = `${spotifyConfig.BASE_URL}/me?access_token=${accessToken}`;
    expect(fetch).toHaveBeenCalledWith(userFetchUrl);

    const playlistCreationUrl = `${spotifyConfig.BASE_URL}/users/${userId}/playlists?access_token=${accessToken}`;
    const playlistCreationBody = {
      name: name,
      public: false,
    };
    const playlistCreationInit = {
      method: "POST",
      body: JSON.stringify(playlistCreationBody),
    };
    expect(fetch).toHaveBeenCalledWith(
      playlistCreationUrl,
      playlistCreationInit
    );
  });
});

describe("fetchTracks", () => {
  it("throws error when track fetching request does not return ok", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    const playlists = ["playlist1", "playlist2"];
    const accessToken = "accessToken";

    await expect(
      async () => await fetchTracks(playlists, accessToken)
    ).rejects.toThrowError(
      "An error occurred while fetching a batch of tracks"
    );
  });

  it("fetches two batches of tracks", async () => {
    const urlOfSecondBatch = "urlOfSecondBatch";
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          items: [
            { track: { uri: "list1track1" } },
            { track: { uri: "list1track2" } },
            { track: { uri: "list1track3" } },
          ],
          next: urlOfSecondBatch,
        }),
    });

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          items: [
            { track: { uri: "list1track4" } },
            { track: { uri: "list1track5" } },
          ],
          next: null,
        }),
    });

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          items: [
            { track: { uri: "list2track1" } },
            { track: { uri: "list2track2" } },
          ],
          next: null,
        }),
    });

    const playlists = ["playlist1", "playlist2"];
    const accessToken = "accessToken";

    const result = await fetchTracks(playlists, accessToken);

    expect(result.sort()).toEqual(
      [
        "list1track1",
        "list1track2",
        "list1track3",
        "list1track4",
        "list1track5",
        "list2track1",
        "list2track2",
      ].sort()
    );

    const firstPlaylistUrl = `${spotifyConfig.BASE_URL}/playlists/playlist1/tracks?access_token=${accessToken}&limit=50&fields=items(track(uri)),next,total`;
    const secondPlaylistUrl = `${spotifyConfig.BASE_URL}/playlists/playlist2/tracks?access_token=${accessToken}&limit=50&fields=items(track(uri)),next,total`;
    expect(fetch).toHaveBeenCalledWith(firstPlaylistUrl);
    expect(fetch).toHaveBeenCalledWith(
      `${urlOfSecondBatch}&access_token=${accessToken}`
    );
    expect(fetch).toHaveBeenCalledWith(secondPlaylistUrl);
  });
});

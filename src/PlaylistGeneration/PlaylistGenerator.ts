import spotifyConfig from "../config/spotify-config.json";

type BatchOfTracks = {
  items: [{ track: { uri: string } }];
  next: string;
  total: number;
};

export async function generatePlaylist(
  includePlaylists: string[],
  excludePlaylist: string[],
  name: string,
  accessToken: string
) {
  let includeTracks = await fetchTracks(includePlaylists, accessToken);
  let excludeTracks = new Set(await fetchTracks(excludePlaylist, accessToken));
  let resultingTracks = includeTracks.filter((t) => !excludeTracks.has(t));
  let playlistId = await createPlaylist(resultingTracks, name, accessToken);
  await addTracksToPlaylist(resultingTracks, playlistId, accessToken);
}

async function addTracksToPlaylist(
  tracks: string[],
  playlistId: string,
  accessToken: string
) {
  const url = `${spotifyConfig.BASE_URL}/playlists/${playlistId}/tracks?access_token=${accessToken}`;
  const batchSize = 50;
  for (let i = 0; i < tracks.length; i += batchSize) {
    const trackBatch = tracks.slice(i, i + batchSize);
    const requestBody = {
      uris: trackBatch,
    };
    fetch(url, {
      method: "POST",
      body: JSON.stringify(requestBody),
    }).then((response) => {
      if (!response.ok) {
        throw new Error(
          "An error occurred while adding tracks to the playlist"
        );
      }
    });
  }
}

async function createPlaylist(
  tracks: string[],
  name: string,
  accessToken: string
): Promise<string> {
  let userId = await getUserId(accessToken);
  const url = `${spotifyConfig.BASE_URL}/users/${userId}/playlists?access_token=${accessToken}`;
  const requestBody = {
    name: name,
    public: false,
  };
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(requestBody),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("An error occurred while creating the playlist");
      }
      return response.json() as Promise<{ id: string }>;
    })
    .then((idObject) => idObject.id);
}

async function getUserId(accessToken: string): Promise<string> {
  const url = `${spotifyConfig.BASE_URL}/me?access_token=${accessToken}`;
  return fetch(url)
    .then((response) => {
      if (!response.ok)
        throw new Error(
          "An error occurred while fetching the current users data"
        );
      return response.json() as Promise<{ id: string }>;
    })
    .then((idObject) => idObject.id);
}

async function fetchTracks(
  playlists: string[],
  accessToken: string
): Promise<string[]> {
  var tracks: string[] = [];
  for (const pList of playlists) {
    const url = `${spotifyConfig.BASE_URL}/playlists/${pList}/tracks?access_token=${accessToken}&limit=50&fields=items(track(uri)),next,total`;
    let batchOfTracks = await fetchBatchOfTracks(url, accessToken);
    tracks = tracks.concat(batchOfTracks);
  }
  return tracks;
}

function fetchBatchOfTracks(
  url: string,
  accessToken: string
): Promise<string[]> {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("An error occurred while fetching a batch of tracks");
      }
      return response.json() as Promise<BatchOfTracks>;
    })
    .then((batchOfTracks) => {
      let uriList = batchOfTracks.items
        .map((item) => item.track)
        .map((tracks) => tracks.uri);
      if (batchOfTracks.next != null) {
        return fetchBatchOfTracks(
          `${batchOfTracks.next}&access_token=${accessToken}`,
          accessToken
        ).then((remainintUriList) => remainintUriList.concat(uriList));
      } else {
        return uriList;
      }
    });
}

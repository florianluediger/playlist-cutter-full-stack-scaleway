import {GenerationStatus} from "./GenerationStatus";
import {addTracksToPlaylist, createPlaylist, fetchTracks} from "./SpotifyClient";

export async function generatePlaylist(
    includePlaylists: string[],
    excludePlaylist: string[],
    name: string,
    accessToken: string,
    setGenerationStatus: (generationStatus: GenerationStatus) => void
) {
    setGenerationStatus(GenerationStatus.FETCH_INCLUDE)
    let includeTracks = await fetchTracks(includePlaylists, accessToken);
    setGenerationStatus(GenerationStatus.FETCH_EXCLUDE)
    let excludeTracks = new Set(await fetchTracks(excludePlaylist, accessToken));
    setGenerationStatus(GenerationStatus.CALCULATE_DIFFERENCE)
    let resultingTracks = includeTracks.filter((t) => !excludeTracks.has(t));
    setGenerationStatus(GenerationStatus.CREATE_NEW)
    let playlistId = await createPlaylist(name, accessToken);
    await addTracksToPlaylist(resultingTracks, playlistId, accessToken);
}

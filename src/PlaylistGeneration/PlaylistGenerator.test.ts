import {generatePlaylist} from "./PlaylistGenerator";
import {addTracksToPlaylist, createPlaylist, fetchTracks} from "./SpotifyClient";


jest.mock("./SpotifyClient", () => {
    return {
        createPlaylist: jest.fn(),
        fetchTracks: jest.fn(),
        addTracksToPlaylist: jest.fn()
    }
});

it("generates playlist when input is correct", async () => {
    const includePlaylists = ["include"];
    const excludePlaylists = ["exclude"];
    const name = "name"
    const accessToken = "accessToken"
    const setGenerationStatus = jest.fn();

    const includeTracks = ["track1", "track2", "track3"];
    const excludeTracks = ["track3", "track4"];
    const resultingTracks = ["track1", "track2"];
    const playlistId = "playlistId";
    (fetchTracks as jest.Mock).mockResolvedValueOnce(includeTracks);
    (fetchTracks as jest.Mock).mockResolvedValueOnce(excludeTracks);
    (createPlaylist as jest.Mock).mockResolvedValueOnce(playlistId)

    await generatePlaylist(includePlaylists, excludePlaylists, name, accessToken, setGenerationStatus);

    expect(setGenerationStatus).toHaveBeenCalledTimes(4);
    expect(createPlaylist).toHaveBeenCalledWith(resultingTracks, name, accessToken);
    expect(addTracksToPlaylist).toHaveBeenCalledWith(resultingTracks, playlistId, accessToken);
});
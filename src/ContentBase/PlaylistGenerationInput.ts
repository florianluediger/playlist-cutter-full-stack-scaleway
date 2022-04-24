export type PlaylistGenerationInput = {
    includePlaylists: string[],
    excludePlaylists: string[],
    newName: string
}

export function emptyPlaylistGenerationInput(): PlaylistGenerationInput {
    return {
        includePlaylists: [],
        excludePlaylists: [],
        newName: ""
    };
}
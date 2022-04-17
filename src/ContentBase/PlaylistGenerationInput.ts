export type PlaylistGenerationInput = {
    includePlaylists: string[],
    excludePlaylists: string[],
    newName: string
}

export const emptyPlaylistGenerationInput: PlaylistGenerationInput = {
    includePlaylists: [],
    excludePlaylists: [],
    newName: ""
}
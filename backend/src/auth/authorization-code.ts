export function redirect_for_authentication(spotifyClientId: string, redirectUri: string) {
    const scope =
        "playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public";
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${spotifyClientId}&response_type=code&redirect_uri=${encodeURIComponent(
        redirectUri)}&scope=${encodeURIComponent(scope)}`;

    return {
        statusCode: 302,
        headers: {
            Location: authUrl,
            "Access-Control-Allow-Origin": "*",
        },
        body: "",
    };
}

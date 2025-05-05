import {RedisClientType} from "redis";
import {getResponseHeaders, getUnauthorizedResponse, getUserIdFromRecordCookie, User} from "../utils/auth-utils";
import {Playlist} from "@playlist-cutter/common";
import axios, {AxiosResponse} from "axios";
import {ApiGatewayEvent} from "../utils/api-gateway-event";

interface SpotifyPlaylistResponse {
    items: Playlist[];
    next: string | null;
}

export async function listPlaylists(event: ApiGatewayEvent, redisClient: RedisClientType<any, any, any>, frontendUrl: string) {
    try {
    const userId = getUserIdFromRecordCookie(event);
    if (!userId) {
        return { errorResponse: getUnauthorizedResponse(frontendUrl) };
    }
    await redisClient.connect();
    const user: User = JSON.parse(await redisClient.get(userId) || "");
    await redisClient.disconnect();

    const allPlaylists: Playlist[] = [];
    let nextUrl: string | null =
        "https://api.spotify.com/v1/me/playlists?limit=50";

    while (nextUrl) {
        const playlistsResponse: AxiosResponse<SpotifyPlaylistResponse> =
            await axios.get(nextUrl, {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });

        allPlaylists.push(...playlistsResponse.data.items);
        nextUrl = playlistsResponse.data.next;
    }

    return {
        statusCode: 200,
        headers: getResponseHeaders(frontendUrl),
        body: JSON.stringify(allPlaylists),
    };
} catch (error) {
    console.error("Error fetching playlists:", error);

    if (axios.isAxiosError(error) && error.response?.status === 401) {
        return {
            statusCode: 401,
            headers: getResponseHeaders(frontendUrl),
            body: JSON.stringify({ error: "Unauthorized access to Spotify API" }),
        };
    }

    return {
        statusCode: 500,
        headers: getResponseHeaders(frontendUrl),
        body: JSON.stringify({ error: "Failed to fetch playlists" }),
    };
}
}

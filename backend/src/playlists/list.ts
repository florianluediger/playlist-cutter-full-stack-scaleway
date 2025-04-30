import {RedisClientType} from "redis";
import {getUnauthorizedResponse, getUserIdFromRecordCookie, User} from "../utils/auth-utils";
import {Playlist} from "@playlist-cutter/common";
import axios, {AxiosResponse} from "axios";
import {ApiGatewayEvent} from "../utils/api-gateway-event";

const getResponseHeaders = (frontendUrl: string) => ({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": frontendUrl,
    "Access-Control-Allow-Credentials": "true",
});

interface SpotifyPlaylistResponse {
    items: Playlist[];
    next: string | null;
}

export async function listPlaylists(event: ApiGatewayEvent, redisClient: RedisClientType<any, any, any>) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const userId = getUserIdFromRecordCookie(event);
    if (!userId) {
        return { errorResponse: getUnauthorizedResponse() };
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
}

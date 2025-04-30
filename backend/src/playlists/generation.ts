import {RedisClientType} from "redis";
import axios from "axios";
import {getUnauthorizedResponse, getUserIdFromRecordCookie, User} from "../utils/auth-utils";
import {PlaylistGenerationInput} from "@playlist-cutter/common";
import {ApiGatewayEvent} from "../utils/api-gateway-event";

interface SpotifyTrack {
    track: {
        id: string;
        uri: string;
    };
}

async function fetchPlaylistTracks(
    playlistId: string,
    accessToken: string
): Promise<Set<string>> {
    const tracks = new Set<string>();
    let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

    while (nextUrl) {
        const response = await axios.get(nextUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                fields: "items(track(id,uri)),next",
            },
        });

        const spotifyTracks: SpotifyTrack[] = response.data.items;
        spotifyTracks.forEach((item) => {
            if (item.track && item.track.id) {
                tracks.add(item.track.uri);
            }
        });

        nextUrl = response.data.next;
    }

    return tracks;
}

export async function generatePlaylist(event: ApiGatewayEvent, redisClient: RedisClientType<any, any, any>) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const userId = getUserIdFromRecordCookie(event);
    if (!userId) {
        return { errorResponse: getUnauthorizedResponse() };
    }
    await redisClient.connect();
    const user: User = JSON.parse(await redisClient.get(userId) || "{}");
    await redisClient.disconnect();

    if (!event.body || !user.accessToken) {
        return {
            statusCode: 400,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": frontendUrl,
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type,Cookie",
                "Access-Control-Expose-Headers": "Set-Cookie",
            },
            body: JSON.stringify({ error: "Request body is required" }),
        };
    }
    const input: PlaylistGenerationInput = JSON.parse(event.body);

    // Fetch tracks from include playlists
    const includeTracks = new Set<string>();
    for (const playlistId of input.includePlaylists) {
        const tracks = await fetchPlaylistTracks(playlistId, user.accessToken);
        tracks.forEach((track) => includeTracks.add(track));
    }

    // Fetch tracks from exclude playlists
    const excludeTracks = new Set<string>();
    for (const playlistId of input.excludePlaylists) {
        const tracks = await fetchPlaylistTracks(playlistId, user.accessToken);
        tracks.forEach((track) => excludeTracks.add(track));
    }

    // Filter out excluded tracks
    const finalTracks = Array.from(includeTracks).filter(
        (trackUri) => !excludeTracks.has(trackUri)
    );

    if (finalTracks.length === 0) {
        return {
            statusCode: 400,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": frontendUrl,
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type,Cookie",
                "Access-Control-Expose-Headers": "Set-Cookie",
            },
            body: JSON.stringify({ error: "No tracks remain after filtering" }),
        };
    }

    // Create a new playlist
    const createPlaylistResponse = await axios.post(
        `https://api.spotify.com/v1/users/${
            user.spotifyUserId
        }/playlists`,
        {
            name: input.newName,
            description: "Created with Playlist Cutter",
            public: false,
        },
        {
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
                "Content-Type": "application/json",
            },
        }
    );

    const newPlaylistId = createPlaylistResponse.data.id;

    // Add tracks to the new playlist in batches of 100 (Spotify's limit)
    for (let i = 0; i < finalTracks.length; i += 100) {
        const batch = finalTracks.slice(i, i + 100);
        await axios.post(
            `https://api.spotify.com/v1/playlists/${newPlaylistId}/tracks`,
            {
                uris: batch,
            },
            {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
    }

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": frontendUrl,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Cookie",
            "Access-Control-Expose-Headers": "Set-Cookie",
        },
        body: JSON.stringify({
            message: "Playlist created successfully",
            playlistId: newPlaylistId,
            trackCount: finalTracks.length,
        }),
    };
}

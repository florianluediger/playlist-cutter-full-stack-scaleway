import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";
import { authenticateUser } from "../utils/auth-utils";
import { Playlist } from "@playlist-cutter/common";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  try {
    const authResult = await authenticateUser(event);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { accessToken } = authResult.user!;

    // Fetch the user's playlists from Spotify
    const playlistsResponse = await axios.get(
      "https://api.spotify.com/v1/me/playlists",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          limit: 50, // Maximum number of playlists to fetch
        },
      }
    );

    const playlists: Playlist[] = playlistsResponse.data.items.map(
      (playlist: any) => ({
        id: playlist.id,
        name: playlist.name,
        external_urls: {
          spotify: playlist.external_urls.spotify,
        },
        tracks: {
          href: playlist.tracks.href,
          total: playlist.tracks.total,
        },
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": frontendUrl,
        "Access-Control-Allow-Credentials": "true",
      },
      body: JSON.stringify(playlists),
    };
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": frontendUrl,
        "Access-Control-Allow-Credentials": "true",
      },
      body: JSON.stringify({ error: "Failed to fetch playlists" }),
    };
  }
};

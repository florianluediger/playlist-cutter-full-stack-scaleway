import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import axios, { AxiosResponse } from "axios";
import { authenticateUser } from "../utils/auth-utils";
import { Playlist } from "@playlist-cutter/common";

const getResponseHeaders = (frontendUrl: string) => ({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": frontendUrl,
  "Access-Control-Allow-Credentials": "true",
});

interface SpotifyPlaylistResponse {
  items: Playlist[];
  next: string | null;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  try {
    const authResult = await authenticateUser(event);
    if (authResult.errorResponse) {
      return {
        statusCode: 401,
        headers: getResponseHeaders(frontendUrl),
        body: authResult.errorResponse.body,
      };
    }

    const { accessToken } = authResult.user!;
    const allPlaylists: Playlist[] = [];
    let nextUrl: string | null =
      "https://api.spotify.com/v1/me/playlists?limit=50";

    while (nextUrl) {
      const playlistsResponse: AxiosResponse<SpotifyPlaylistResponse> =
        await axios.get(nextUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
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
};

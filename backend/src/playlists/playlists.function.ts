import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import axios from "axios";

const dynamoClient = new DynamoDBClient({});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Extract userId from the cookie
    const cookies = event.headers.Cookie || event.headers.cookie || "";
    const userIdCookie = cookies
      .split(";")
      .find((cookie) => cookie.trim().startsWith("userId="));
    const userId = userIdCookie ? userIdCookie.split("=")[1] : null;

    if (!userId) {
      return {
        statusCode: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Unauthorized: User ID not found in cookie",
        }),
      };
    }

    // Get the user's access token from DynamoDB
    const getUserCommand = new GetItemCommand({
      TableName: process.env.USERS_TABLE_NAME || "playlist-cutter-users",
      Key: marshall({
        userId,
      }),
    });

    const userResponse = await dynamoClient.send(getUserCommand);

    if (!userResponse.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    const user = unmarshall(userResponse.Item);
    const { accessToken } = user;

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

    const playlists = playlistsResponse.data.items.map((playlist: any) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      images: playlist.images,
      tracks: {
        total: playlist.tracks.total,
      },
      owner: {
        id: playlist.owner.id,
        display_name: playlist.owner.display_name,
      },
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(playlists),
    };
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Failed to fetch playlists" }),
    };
  }
};

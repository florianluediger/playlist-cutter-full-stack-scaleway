import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const dynamoClient = new DynamoDBClient({});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    // Get the authorization code from the query parameters
    const code = event.queryStringParameters?.code;

    if (!code) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Authorization code is required" }),
      };
    }

    // Fetch Spotify credentials from SSM Parameter Store
    const ssmClient = new SSMClient({});
    const getParameterCommand = new GetParameterCommand({
      Name: "/playlist-cutter/spotify-credentials",
      WithDecryption: true,
    });

    const parameterResponse = await ssmClient.send(getParameterCommand);
    const spotifyCredentials = JSON.parse(
      parameterResponse.Parameter?.Value || "{}"
    );
    const clientId = spotifyCredentials.clientId || "";
    const clientSecret = spotifyCredentials.clientSecret || "";
    // Exchange the authorization code for an access token
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri:
          process.env.REDIRECT_URI || "http://localhost:3000/auth-success",
        client_id: clientId,
        client_secret: clientSecret,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Get the user's Spotify profile
    const userResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // Generate a UUID for the user
    const userId = uuidv4();

    // Store the user's information in DynamoDB
    const putUserCommand = new PutItemCommand({
      TableName: process.env.USERS_TABLE_NAME || "playlist-cutter-users",
      Item: marshall({
        userId,
        spotifyUserId: userResponse.data.id,
        accessToken: access_token,
        createdAt: Math.floor(Date.now() / 1000),
      }),
    });

    await dynamoClient.send(putUserCommand);

    return {
      statusCode: 302,
      headers: {
        Location: frontendUrl,
        "Access-Control-Allow-Origin": frontendUrl,
        "Access-Control-Allow-Credentials": "true",
        "Set-Cookie": `userId=${userId}; HttpOnly; Path=/; SameSite=None; Secure`,
      },
      body: "",
    };
  } catch (error) {
    console.error("Error during authentication:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Authentication failed" }),
    };
  }
};

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
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

    // Construct the Spotify authorization URL
    const redirectUri =
      process.env.REDIRECT_URI || "http://localhost:3000/auth-success";
    const scope =
      "playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public";

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scope)}`;

    // Redirect to the Spotify authorization URL
    return {
      statusCode: 302,
      headers: {
        Location: authUrl,
        "Access-Control-Allow-Origin": "*",
      },
      body: "",
    };
  } catch (error) {
    console.error("Error redirecting to Spotify:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Failed to redirect to Spotify" }),
    };
  }
};

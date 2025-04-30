import axios from "axios";
import {v4 as uuidv4} from "uuid";
import {RedisClientType} from "redis";
import {ApiGatewayEvent} from "../utils/api-gateway-event";

interface CodeParameters {
    code: string;
}

export async function exchangeToken(event: ApiGatewayEvent, redisClient: RedisClientType<any, any, any>, redirectUri: string, frontendUrl: string, spotifyClientId: string, spotifyClientSecret: string) {
    const code = event.queryStringParameters?.code || "";

    // Exchange the authorization code for an access token
    const tokenResponse = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
            client_id: spotifyClientId,
            client_secret: spotifyClientSecret,
        }),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );

    const {access_token} = tokenResponse.data;

    // Get the user's Spotify profile
    const userResponse = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
    const userId = uuidv4();

    await redisClient.connect();
    await redisClient.set(userId, JSON.stringify({
        userId,
        spotifyUserId: userResponse.data.id,
        accessToken: access_token,
        createdAt: Math.floor(Date.now() / 1000),
    }));
    await redisClient.disconnect();
    return {
        statusCode: 302,
        headers: {
            Location: frontendUrl,
            "Access-Control-Allow-Origin": frontendUrl,
            "Access-Control-Allow-Credentials": "true",
            "Set-Cookie": `userId=${userId}; Domain=luediger.link; Path=/; SameSite=None; Secure`,
        },
        body: "",
    };
}

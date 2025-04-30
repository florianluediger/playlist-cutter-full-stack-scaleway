import { createClient as createScalewayClient, Secret } from '@scaleway/sdk'
import { createClient as createRedisClient } from 'redis';
import { exchangeToken } from "./auth/token"
import { redirect_for_authentication } from "./auth/authorization-code";
import { logoutUser } from "./auth/logout"
import {listPlaylists} from "./playlists/list";
import {generatePlaylist} from "./playlists/generation";
import {ApiGatewayEvent} from "./utils/api-gateway-event";

const redirectUri =
    process.env.REDIRECT_URI || "http://localhost:3000/auth-success";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

const scalewayClient = createScalewayClient(
    {
        accessKey: process.env.ACCESS_KEY,
        secretKey: process.env.SECRET_KEY
    }
)
const secret = new Secret.v1beta1.API(scalewayClient)

var spotifyClientId = "";
var spotifyClientSecret = "";

const redisClient = createRedisClient({
    url: `rediss://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    socket: {
        tls: true,
        requestCert: true,
        rejectUnauthorized: false
    }
}).on('error', err => console.log('Redis Client Error', err));


export async function handle(event: ApiGatewayEvent) {
    if (spotifyClientId === "") {
        const spotifySecret = await secret.accessSecretVersionByPath({
            region: "fr-par",
            projectId: process.env.PROJECT_ID,
            secretPath: "/playlist-cutter",
            secretName: "spotify-credentials",
            revision: "latest"
        })
        const spotifyCredentials = JSON.parse(Buffer.from(spotifySecret.data, "base64").toString());
        spotifyClientId = spotifyCredentials.clientId || "";
        spotifyClientSecret = spotifyCredentials.clientSecret || "";
    }
    if (event.path === "/auth/spotify") {
        return redirect_for_authentication(spotifyClientId, redirectUri);
    } else if (event.path === "/auth/spotify/callback") {
        return await exchangeToken(event, redisClient, redirectUri, frontendUrl, spotifyClientId, spotifyClientSecret);
    } else if (event.path === "/auth/spotify/logout") {
        return await logoutUser(event, redisClient, frontendUrl);
    } else if (event.path === "/playlists") {
        return await listPlaylists(event, redisClient);
    } else if (event.path === "/playlists/generation") {
        return await generatePlaylist(event, redisClient);
    } else {
        return {
            body: "Not found",
            headers: { "Content-Type": ["application/json"] },
            statusCode: 404,
        }
    }
}

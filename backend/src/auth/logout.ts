import {getResponseHeaders, getUnauthorizedResponse, getUserIdFromRecordCookie} from "../utils/auth-utils";
import {RedisClientType} from "redis";
import {ApiGatewayEvent} from "../utils/api-gateway-event";

export async function logoutUser(event: ApiGatewayEvent, redisClient: RedisClientType<any, any, any>, frontendUrl: string) {
    try {
        const userId = getUserIdFromRecordCookie(event);

        if (!userId) {
            return getUnauthorizedResponse(frontendUrl);
        }

        await redisClient.connect();
        await redisClient.del(userId);
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
    } catch (error) {
        console.error("Error during logout:", error);
        return {
            statusCode: 500,
            headers: getResponseHeaders(frontendUrl),
            body: JSON.stringify({ error: "Logout failed" }),
        };
    }
}
